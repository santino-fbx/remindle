import { db } from '../firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, serverTimestamp,
  arrayUnion, arrayRemove, increment, deleteField,
} from 'firebase/firestore';

// ─── Invite Code ───
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no O/0/I/1/L

export function generateInviteCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

// ─── Deck CRUD ───

export async function createDeck(name, uid, displayName) {
  const code = generateInviteCode();
  const ref = await addDoc(collection(db, 'decks'), {
    name,
    code,
    createdBy: uid,
    createdByName: displayName || 'Unknown',
    memberUids: [uid],
    members: { [uid]: displayName || 'Unknown' },
    memberCount: 1,
    createdAt: serverTimestamp(),
  });
  return { deckId: ref.id, code };
}

export async function getDeck(deckId) {
  const snap = await getDoc(doc(db, 'decks', deckId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getUserDecks(uid) {
  const q = query(
    collection(db, 'decks'),
    where('memberUids', 'array-contains', uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function joinDeck(code, uid, displayName) {
  const q = query(collection(db, 'decks'), where('code', '==', code.toUpperCase()));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error('No deck found with that code');

  const deckDoc = snap.docs[0];
  const data = deckDoc.data();

  if (data.memberUids?.includes(uid)) {
    throw new Error('You\'re already a member of this deck');
  }

  await updateDoc(deckDoc.ref, {
    memberUids: arrayUnion(uid),
    [`members.${uid}`]: displayName || 'Unknown',
    memberCount: increment(1),
  });

  return { id: deckDoc.id, ...data };
}

export async function leaveDeck(deckId, uid) {
  const ref = doc(db, 'decks', deckId);
  await updateDoc(ref, {
    memberUids: arrayRemove(uid),
    [`members.${uid}`]: deleteField(),
    memberCount: increment(-1),
  });
}

// ─── Deck Phrases ───

export async function getDeckPhrases(deckId) {
  const snap = await getDocs(collection(db, 'decks', deckId, 'phrases'));
  // Sort by doc ID for deterministic ordering
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function addDeckPhrase(deckId, { phrase, hint, category }, uid, displayName) {
  const ref = await addDoc(collection(db, 'decks', deckId, 'phrases'), {
    phrase,
    hint,
    category,
    addedBy: uid,
    addedByName: displayName || 'Unknown',
    addedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteDeckPhrase(deckId, phraseId) {
  await deleteDoc(doc(db, 'decks', deckId, 'phrases', phraseId));
}

// ─── Daily Results ───

export async function submitDeckResult(deckId, uid, displayName, date, won, attempts) {
  const docId = `${date}_${uid}`;
  await setDoc(doc(db, 'decks', deckId, 'results', docId), {
    uid,
    displayName: displayName || 'Unknown',
    date,
    won,
    attempts,
    completedAt: serverTimestamp(),
  });
}

export async function getUserDeckResult(deckId, uid, date) {
  const docId = `${date}_${uid}`;
  const snap = await getDoc(doc(db, 'decks', deckId, 'results', docId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getDeckDayResults(deckId, date) {
  const snap = await getDocs(collection(db, 'decks', deckId, 'results'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.date === date)
    .sort((a, b) => {
      // Winners first, then by fewer attempts
      if (a.won !== b.won) return b.won ? 1 : -1;
      return a.attempts - b.attempts;
    });
}
