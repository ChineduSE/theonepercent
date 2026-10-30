import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './lib/store.jsx';
import Shell from './components/Shell.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Access from './pages/Access.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import Practice from './pages/Practice.jsx';
import Library from './pages/Library.jsx';
import NoteEditor from './pages/NoteEditor.jsx';
import Upload from './pages/Upload.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Interviews from './pages/Interviews.jsx';
import InterviewRoom from './pages/InterviewRoom.jsx';
import Skills from './pages/Skills.jsx';
import SkillDetail from './pages/SkillDetail.jsx';
import Work from './pages/Work.jsx';
import Portfolio from './pages/Portfolio.jsx';
import PublicPortfolio from './pages/PublicPortfolio.jsx';
import Settings from './pages/Settings.jsx';
import Admin from './pages/Admin.jsx';

function Protected({ children }) {
  const { state } = useStore();
  return state.session.loggedIn ? children : <Navigate to="/login" replace />;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/access" element={<Access />} />
        <Route path="/join/:code" element={<Access />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/p/:slug" element={<PublicPortfolio />} />
        <Route path="/app" element={<Protected><Shell /></Protected>}>
          <Route index element={<Home />} />
          <Route path="practice" element={<Practice />} />
          <Route path="library" element={<Library />} />
          <Route path="library/new" element={<NoteEditor />} />
          <Route path="library/note/:id" element={<NoteEditor />} />
          <Route path="library/upload" element={<Upload />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="interviews/:kind/:id" element={<InterviewRoom />} />
          <Route path="skills" element={<Skills />} />
          <Route path="skills/:id" element={<SkillDetail />} />
          <Route path="work" element={<Work />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
