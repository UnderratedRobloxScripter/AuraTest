import React from "react";
import ReactDOM from "react-dom/client";
import { NotificationProvider, useNotification } from "./components/NotificationContext";
import ChatInterface from "./components/ChatInterface";
import AuthModal from "./components/AuthModal";
import PricingModal from "./components/PricingModal";
import { generateAIResponse } from "./utils/ai"; // secure AI call

// ------------------- ERROR BOUNDARY -------------------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ------------------- MAIN APP CONTENT -------------------
function AppContent() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showPricingModal, setShowPricingModal] = React.useState(false);
  const { addNotification } = useNotification();

  React.useEffect(() => {
    const savedUser = localStorage.getItem("aura_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("aura_user", JSON.stringify(user));
    addNotification("success", `Welcome back, ${user.name}!`, "Signed In");
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("aura_user");
    addNotification("info", "You have been logged out.", "Signed Out");
  };

  const handleUpgrade = (planId) => {
    if (!currentUser) {
      setShowPricingModal(false);
      setShowAuthModal(true);
      return;
    }

    const updatedUser = { ...currentUser, plan: planId };
    setCurrentUser(updatedUser);
    localStorage.setItem("aura_user", JSON.stringify(updatedUser));
    setShowPricingModal(false);
    addNotification(
      "success",
      `Successfully upgraded to ${planId === "pro_plus" ? "Pro+" : "Pro"}!`,
      "Plan Upgraded"
    );
  };

  return (
    <div data-name="app" data-file="app.js">
      <ChatInterface
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenPricing={() => setShowPricingModal(true)}
        onLogout={handleLogout}
        generateAIResponse={generateAIResponse}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={currentUser ? currentUser.plan : "free"}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}

// ------------------- ROOT APP -------------------
function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);