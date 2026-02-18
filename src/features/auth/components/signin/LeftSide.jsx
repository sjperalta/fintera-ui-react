import PropTypes from "prop-types";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import LoginFooter from "./LoginFooter";

function LeftSide({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  handleSubmit,
  loading,
  apiError,
  setModalOpen
}) {
  return (
  <div className="w-full px-4 sm:px-6 lg:px-0 xl:px-0 h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 relative overflow-y-auto">
    {/* Enhanced animated background elements */}
    <div className="absolute inset-0 overflow-hidden hidden lg:block">
      {/* Main gradient orbs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/40 to-purple-600/40 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/40 to-pink-600/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      
      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400/80 rounded-full animate-bounce"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-ping"></div>
      <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-indigo-400/60 rounded-full animate-pulse delay-1000"></div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}></div>
    </div>
    
  <div className="w-full max-w-full relative z-10 flex flex-col justify-center min-h-full py-8">
        {/* Header */}
        <LoginHeader />

        {/* Login Form */}
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          errors={errors}
          handleSubmit={handleSubmit}
          loading={loading}
          apiError={apiError}
          setModalOpen={setModalOpen}
        />

        {/* Footer */}
        <LoginFooter />
      </div>
    </div>
  );
}

LeftSide.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  apiError: PropTypes.string,
  setModalOpen: PropTypes.func.isRequired,
};

export default LeftSide;