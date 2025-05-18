
import React from 'react';

interface StreetViewTutorialProps {
  isTransitioning: boolean;
  showTutorial: boolean;
  position: { x: number; y: number; height?: number };
  onClose: () => void;
  isVRSupported?: boolean;
}

const StreetViewTutorial: React.FC<StreetViewTutorialProps> = ({
  isTransitioning,
  showTutorial,
  position,
  onClose,
  isVRSupported = false
}) => {
  if (!showTutorial) return null;
  
  return (
    <div 
      className={`fixed inset-0 z-40 flex items-center justify-center transition-opacity duration-500 
        ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="bg-black/75 p-6 rounded-xl max-w-lg text-white shadow-2xl backdrop-blur-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <span className="text-green-400 mr-2">🏙️</span> 
          Welcome to SustainCity View!
        </h2>
        
        <div className="space-y-4 text-sm">
          <p>
            You're now exploring your sustainable city in immersive 3D! 
            Current position: ({position.x}, {position.y})
          </p>
          
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <h3 className="font-semibold text-green-300 mb-2">Controls:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Use <span className="font-mono font-bold">W A S D</span> keys to move around</li>
              <li>Use <span className="font-mono font-bold">Space</span> key to move up</li>
              <li>Use <span className="font-mono font-bold">Shift</span> key to move down</li>
              <li>Look around by moving your mouse</li>
              <li>Press <span className="font-mono font-bold">V</span> to toggle first/third person view</li>
              <li>Press <span className="font-mono font-bold">Esc</span> to exit street view</li>
            </ul>
          </div>
          
          {isVRSupported && (
            <div className="bg-purple-900/30 p-3 rounded-lg">
              <h3 className="font-semibold text-purple-300 mb-2">VR Support Detected!</h3>
              <p>For an even more immersive experience, try the VR mode with compatible headsets like Oculus Quest 2.</p>
            </div>
          )}
          
          <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-full font-medium transition-colors"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetViewTutorial;
