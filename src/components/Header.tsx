import React, { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, HomeIcon, SproutIcon, Maximize, Minimize } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/utils/auth";
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  onReset: () => void;
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ onReset, children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFullScreenSupported, setIsFullScreenSupported] = useState(true);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Check if fullscreen is supported
  useEffect(() => {
    const checkFullscreenSupport = () => {
      const doc = document as any;
      const fullscreenEnabled =
        doc.fullscreenEnabled ||
        doc.webkitFullscreenEnabled ||
        doc.mozFullScreenEnabled ||
        doc.msFullscreenEnabled;

      setIsFullScreenSupported(!!fullscreenEnabled);

      if (isDebugMode) {
        console.log("Fullscreen support check:", {
          fullscreenEnabled: !!fullscreenEnabled,
          docFullscreenEnabled: !!doc.fullscreenEnabled,
          webkitFullscreenEnabled: !!doc.webkitFullscreenEnabled,
          mozFullScreenEnabled: !!doc.mozFullScreenEnabled,
          msFullscreenEnabled: !!doc.msFullscreenEnabled,
        });
      }
    };

    checkFullscreenSupport();
  }, [isDebugMode]);

  // Check if we're in full screen mode
  useEffect(() => {
    const handleFullScreenChange = () => {
      const doc = document as any;
      const fullscreenElement =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;

      setIsFullScreen(!!fullscreenElement);

      if (isDebugMode) {
        console.log("Fullscreen state changed:", {
          isFullScreen: !!fullscreenElement,
          docFullscreenElement: !!doc.fullscreenElement,
          webkitFullscreenElement: !!doc.webkitFullscreenElement,
          mozFullScreenElement: !!doc.mozFullScreenElement,
          msFullscreenElement: !!doc.msFullscreenElement,
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
    };
  }, [isDebugMode]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDashboard = () => {
    navigate("/home");
  };

  const toggleFullScreen = async () => {
    try {
      const doc = document as any;

      if (!isFullScreenSupported) {
        toast({
          title: "Full Screen Not Supported",
          description: "Your browser does not support full screen mode.",
          variant: "destructive",
        });
        return;
      }

      if (isDebugMode) {
        console.log("Attempting to toggle fullscreen:", {
          currentState: isFullScreen,
          docFullscreenElement: !!doc.fullscreenElement,
          webkitFullscreenElement: !!doc.webkitFullscreenElement,
          mozFullScreenElement: !!doc.mozFullScreenElement,
          msFullscreenElement: !!doc.msFullscreenElement,
        });
      }

      if (
        !doc.fullscreenElement &&
        !doc.webkitFullscreenElement &&
        !doc.mozFullScreenElement &&
        !doc.msFullscreenElement
      ) {
        // Enter full screen
        if (doc.documentElement.requestFullscreen) {
          await doc.documentElement.requestFullscreen();
        } else if (doc.documentElement.webkitRequestFullscreen) {
          await doc.documentElement.webkitRequestFullscreen();
        } else if (doc.documentElement.mozRequestFullScreen) {
          await doc.documentElement.mozRequestFullScreen();
        } else if (doc.documentElement.msRequestFullscreen) {
          await doc.documentElement.msRequestFullscreen();
        }

        toast({
          title: "Full Screen Mode",
          description: "Press ESC to exit full screen mode",
        });
      } else {
        // Exit full screen
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Full screen error:", error);
      toast({
        title: "Full Screen Failed",
        description: "Your browser may not support full screen mode",
        variant: "destructive",
      });
    }
  };

  // Toggle debug mode with triple click on the fullscreen button
  const handleFullScreenButtonClick = (e: React.MouseEvent) => {
    if (e.detail === 3) {
      setIsDebugMode(!isDebugMode);
      toast({
        title: isDebugMode ? "Debug Mode Disabled" : "Debug Mode Enabled",
        description: isDebugMode
          ? "Fullscreen debugging disabled"
          : "Fullscreen debugging enabled",
      });
    } else {
      toggleFullScreen();
    }
  };

  return (
    <header className="py-4 px-6 flex items-center justify-between border-b bg-white shadow-sm relative">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <SproutIcon className="h-6 w-6 text-teal-600 mr-2" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-transparent bg-clip-text">
            SustainCity
          </h1>
        </div>
        {children}
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFullScreenButtonClick}
          title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
          className="min-w-[100px] relative z-10"
          disabled={!isFullScreenSupported}
        >
          {isFullScreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">
            {isFullScreen ? "Exit" : "Full Screen"}
          </span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleDashboard}>
          <HomeIcon className="h-4 w-4 mr-2" /> Dashboard
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          <Trash2 className="h-4 w-4 mr-2" /> Reset City
        </Button>
      </div>
    </header>
  );
};

export default Header;
