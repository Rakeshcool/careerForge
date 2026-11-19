import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Templates } from './pages/Templates';
import { Dashboard } from './pages/Dashboard';
import { EditorPage } from './editor/EditorPage';

function ResumeRedirect() {
  const { id = '' } = useParams();
  return <Navigate to={`/resume/${id}/content`} replace />;
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted">The page you asked for does not exist in this build.</p>
      <a href="/" className="text-sm font-medium text-brand hover:underline">
        Go home
      </a>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/resumes" element={<Dashboard />} />
        <Route path="/resume/:id" element={<ResumeRedirect />} />
        <Route path="/resume/:id/:tab" element={<EditorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
