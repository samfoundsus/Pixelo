import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;

if (container.innerHTML.trim() && !container.innerHTML.includes('<!--SSR_OUTLET-->')) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
