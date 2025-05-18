
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/components/ui/use-toast'

// Notify users about the application
setTimeout(() => {
  toast({
    title: "Welcome to SustainCity",
    description: "Plan and create sustainable urban environments",
  });
}, 2000);

// Add full screen tip after initial welcome message
setTimeout(() => {
  toast({
    title: "Pro Tip",
    description: "Use the Full Screen button or press F11 / Alt+F for a completely immersive experience",
  });
}, 6000);

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
