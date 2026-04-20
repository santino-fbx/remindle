import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import DailyGame from './screens/DailyGame';
import AddPhrase from './screens/AddPhrase';
import Collection from './screens/Collection';
import GameResults from './screens/GameResults';
import Login from './screens/Login';
import DeckList from './screens/DeckList';
import DeckDetail from './screens/DeckDetail';
import AddDeckPhrase from './screens/AddDeckPhrase';
import ChallengePlay from './screens/ChallengePlay';
import ChallengeResults from './screens/ChallengeResults';

export default function App() {
  const location = useLocation();
  const hideNav = location.pathname === '/login'
    || location.pathname === '/results'
    || location.pathname.startsWith('/c/')
    || location.pathname.match(/^\/deck\/[^/]+\/results$/);

  return (
    <>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public routes — no auth required */}
          <Route path="/login" element={<Login />} />
          <Route path="/c/:code" element={<ChallengePlay />} />
          <Route path="/c/:code/results" element={<ChallengeResults />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DailyGame />} />
            <Route path="/add" element={<AddPhrase />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/results" element={<GameResults />} />
            <Route path="/decks" element={<DeckList />} />
            <Route path="/decks/:deckId" element={<DeckDetail />} />
            <Route path="/decks/:deckId/add" element={<AddDeckPhrase />} />
            <Route path="/deck/:deckId" element={<DailyGame />} />
            <Route path="/deck/:deckId/results" element={<GameResults />} />
          </Route>
        </Routes>
      </div>
      {!hideNav && <NavBar />}
    </>
  );
}
