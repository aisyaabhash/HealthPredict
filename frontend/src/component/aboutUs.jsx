import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function AboutUs() {
  const cardsRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardsRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }
    );
  }, []);

  const team = [
    { name: 'Anand Kumar Sahoo', email: 'anandksahoo04@gmail.com' },
    { name: 'Aisya Abhash Behera', email: 'aisyaabhashbehera@gmail.com' },
    { name: 'Asman Nayak', email: 'asmannayak2005@gmail.com' },
    { name: 'Ayush Biswal', email: 'ayushbiswal@gmail.com' },
  ];

  return (
    <div className="min-h-screen px-6 py-16 bg-[#E0F2FE]">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          About Us
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          We're a team of students who built this diabetes and heart attack
          risk predictor as our college mini project, combining React,
          Node js and machine learning.
        </p>
      </div>

      <div
        ref={cardsRef}
        className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {team.map((member) => (
          <div
            key={member.email}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <a
                href={`mailto:${member.email}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {member.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AboutUs;