import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (open && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-blue-800 border-b border-gray-100 shadow-sm">
      <Link to="/" className="text-xl font-bold text-amber-100">
        HealthPredict
      </Link>

      <div className="relative" ref={wrapperRef} >
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-full hover:bg-amber-100 transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-black">
            <circle cx="10" cy="4" r="1.8" />
            <circle cx="10" cy="10" r="1.8" />
            <circle cx="10" cy="16" r="1.8" />
          </svg>
        </button>

        {open && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-orange-200 rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
             Home
            </Link>
            <Link
              to="/diabetes"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              Diabetes Prediction
            </Link>
            <Link
              to="/heart-attack"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              Heart Attack Prediction
            </Link>
            <Link
              to="/history"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              History
            </Link>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
            >
              Login
            </Link>
            <Link
              to="/aboutUs"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              AboutUs
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;