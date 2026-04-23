import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Check if the user is currently logged in
  const user = JSON.parse(localStorage.getItem('herbalUser'));
  const isLoggedIn = user && user.isLoggedIn;

  // 2. The function to handle logging out
  const handleLogout = () => {
    localStorage.removeItem('herbalUser');
    navigate('/login');
  };

  // Hide the navbar completely on the Login, Signup, and default root pages
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
    return null; 
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#5C7A4E]/20 h-16 flex items-center justify-between px-6 md:px-10">
      
      {/* --- LOGO --- */}
      <div className="flex-shrink-0 flex items-center">
        <Link 
          to="/home" 
          className="text-[1.35rem] font-medium tracking-[0.04em] text-[#1E1E1A] no-underline"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Herbal<span className="text-[#5C7A4E]">Clinic</span>
        </Link>
      </div>
      
      {/* --- NAVIGATION LINKS --- */}
      <div className="hidden md:flex space-x-8 items-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        
        {isLoggedIn ? (
          <>
            <Link to="/home" className="text-[0.8rem] tracking-[0.06em] uppercase text-[#6B6860] hover:text-[#5C7A4E] transition-colors">Home</Link>
            <Link to="/assessment" className="text-[0.8rem] tracking-[0.06em] uppercase text-[#6B6860] hover:text-[#5C7A4E] transition-colors">Assessment</Link>
            <Link to="/library" className="text-[0.8rem] tracking-[0.06em] uppercase text-[#6B6860] hover:text-[#5C7A4E] transition-colors">Library</Link>
            <Link to="/tracker" className="text-[0.8rem] tracking-[0.06em] uppercase text-[#6B6860] hover:text-[#5C7A4E] transition-colors">Tracker</Link>
            
            {/* Styled the Logout button to look like a subtle secondary CTA */}
            <button 
              onClick={handleLogout} 
              className="bg-transparent border border-[#5C7A4E]/30 text-[#5C7A4E] hover:border-[#5C7A4E] rounded-full px-5 py-2 text-[0.82rem] font-medium tracking-[0.04em] transition-all hover:-translate-y-[1px]"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-[0.8rem] tracking-[0.06em] uppercase text-[#6B6860] hover:text-[#5C7A4E] transition-colors">Log In</Link>
            <Link 
              to="/signup" 
              className="bg-[#5C7A4E] hover:bg-[#8BAD7A] text-white rounded-full px-6 py-2 text-[0.82rem] font-medium tracking-[0.04em] transition-all hover:-translate-y-[1px]"
            >
              Start Free Assessment
            </Link>
          </>
        )}
      </div>
      
    </nav>
  );
}