
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/components/ui/use-toast'

// Notify users about the application
setTimeout(() => {
  toast({
    title: "Welcome to SustainCityPlanner",
    description: "Plan and create sustainable urban environments",
  });
}, 2000);

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
