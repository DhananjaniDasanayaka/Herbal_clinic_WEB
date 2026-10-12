
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication
  const user = JSON.parse(localStorage.getItem('herbalUser') || 'null');
  const token = localStorage.getItem('token');
  const isLoggedIn = Boolean(token);

  // Logout - clear both user information and JWT token
  const handleLogout = () => {
    localStorage.removeItem('herbalUser');
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  // Hide navbar on authentication and root pages
  if (
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/'
  ) {
    return null;
  }

  const navLinkClass =
    "text-[0.8rem] tracking-[0.06em] uppercase text-[#6B6860] hover:text-[#5C7A4E] transition-colors";

  return (
    <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#5C7A4E]/20 h-16 flex items-center justify-between px-6 md:px-10 gap-4">

      {/* LOGO */}
      <div className="flex-shrink-0 flex items-center">
        <Link
          to="/home"
          className="text-[1.35rem] font-medium tracking-[0.04em] text-[#1E1E1A] no-underline"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Herbal<span className="text-[#5C7A4E]">Clinic</span>
        </Link>
      </div>

      {/* MAIN NAVIGATION */}
      {isLoggedIn && (
        <div
          className="hidden md:flex space-x-8 items-center"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Link to="/home" className={navLinkClass}>
            Home
          </Link>

          <Link to="/assessment" className={navLinkClass}>
            Assessment
          </Link>

          <Link to="/library" className={navLinkClass}>
            Library
          </Link>

          <Link to="/tracker" className={navLinkClass}>
            Tracker
          </Link>
        </div>
      )}

      {/* PROFILE & ACCOUNT ACTIONS */}
      <div className="flex items-center gap-2 sm:gap-3">

        {isLoggedIn ? (
          <>
            {/* PROFILE BUTTON */}
            <Link
              to="/dashboard"
              title={user?.name ? `${user.name}'s Dashboard` : 'My Dashboard'}
              aria-label="Open my dashboard"
              className={`inline-flex items-center justify-center gap-2 rounded-full px-3 sm:px-5 py-2 text-[0.82rem] font-medium tracking-[0.04em] transition-all hover:-translate-y-[1px] ${location.pathname === '/dashboard'
                  ? 'bg-[#5C7A4E] text-white'
                  : 'bg-[#EFF4EB] text-[#5C7A4E] hover:bg-[#DFEAD7] border border-[#5C7A4E]/20'
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>
              <span className="hidden sm:inline">
                My Profile
              </span>
            </Link>

            {/* LOGOUT BUTTON */}
            <button
              type="button"
              onClick={handleLogout}
              className="bg-transparent border border-[#5C7A4E]/30 text-[#5C7A4E] hover:border-[#5C7A4E] rounded-full px-3 sm:px-5 py-2 text-[0.82rem] font-medium tracking-[0.04em] transition-all hover:-translate-y-[1px]"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={navLinkClass}
            >
              Log In
            </Link>

            <Link
              to="/signup"
              className="bg-[#5C7A4E] hover:bg-[#8BAD7A] text-white rounded-full px-4 sm:px-6 py-2 text-[0.82rem] font-medium transition-all"
            >
              Start Free Assessment
            </Link>
          </>
        )}

      </div>
    </nav>
  );
}
