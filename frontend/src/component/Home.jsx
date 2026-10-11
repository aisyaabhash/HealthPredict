import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

function Home() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      heroRef.current.children,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.2, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-red-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      <div className="absolute inset-0 bg-black/40"></div>

      <div ref={heroRef} className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
          Know Your Risk. <span className="text-blue-400">Protect Your Heart.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
          Early warning signs of diabetes and heart attack often go unnoticed
          until it's too late. Enter a few basic health metrics and get an
          instant, AI-powered risk assessment — so you can act before a small
          risk becomes a real emergency.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/diabetes')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-colors"
          >
            Check Diabetes Risk
          </button>
          <button
            onClick={() => navigate('/heart-attack')}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-colors"
          >
            Check Heart Attack Risk
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-8">
          This is an educational demo, not a medical diagnosis tool.
        </p>
      </div>
    </div>
  );
}

export default Home;