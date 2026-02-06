const WelcomeModal = ({ open, onContinue }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">👋 Welcome</h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome to Forex Trading
          </p>
        </div>

        <div className="p-6 text-gray-600 text-sm">
          Please review your dashboard before continuing.
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
