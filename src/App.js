import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { FiMenu } from 'react-icons/fi';

const coursesData = [
  {
    id: 1,
    title: 'React Basics',
    lessons: [
      { id: 'r1', title: 'Intro to React', videoId: 'dGcsHMXbSOA' },
      { id: 'r2', title: 'State and Props', videoId: 'w7ejDZ8SWv8' },
      { id: 'r3', title: 'Hooks Overview', videoId: 'TNhaISOUy6Q' }
    ]
  },
  {
    id: 2,
    title: 'Advanced React',
    lessons: [
      { id: 'a1', title: 'Context API', videoId: '35lXWvCuM8o' },
      { id: 'a2', title: 'React Router', videoId: 'Law7wfdg_ls' },
      { id: 'a3', title: 'Performance Optimization', videoId: '0ZJgIjIuY7U' }
    ]
  }
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('completed') || '[]'));
  const [currentLesson, setCurrentLesson] = useState(coursesData[0].lessons[0]);
  const [darkMode, setDarkMode] = useState(true);
  const playerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('completed', JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('player', {
        height: '390',
        width: '640',
        videoId: currentLesson.videoId,
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              if (!completed.includes(currentLesson.id)) {
                setCompleted([...completed, currentLesson.id]);
              }
            }
          },
        },
      });
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(currentLesson.videoId);
    }
  }, [currentLesson]);

  const downloadCertificate = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Certificate of Completion', 20, 30);
    doc.setFontSize(16);
    doc.text(`Awarded to You`, 20, 50);
    doc.text(`For completing all courses!`, 20, 65);
    doc.save('certificate.pdf');
  };

  const totalLessons = coursesData.reduce((sum, course) => sum + course.lessons.length, 0);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
        <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">E-Learn</h1>
          <div className="hidden md:flex gap-4">
            <button onClick={() => setDarkMode(!darkMode)}>Toggle Theme</button>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <FiMenu size={24} />
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col gap-2">
            <button onClick={() => setDarkMode(!darkMode)}>Toggle Theme</button>
          </div>
        )}

        <div className="max-w-5xl mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
          <div id="player" className="w-full aspect-video bg-black mb-4"></div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completed.length / totalLessons) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {coursesData.map((course) => (
            <div key={course.id} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {course.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`p-4 rounded-lg shadow-md cursor-pointer ${
                      completed.includes(lesson.id) ? 'bg-green-100 dark:bg-green-700' : 'bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => setCurrentLesson(lesson)}
                  >
                    <h4 className="font-bold">{lesson.title}</h4>
                    {completed.includes(lesson.id) && <p className="text-green-500 text-sm">Completed</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {completed.length === totalLessons && (
            <button
              onClick={downloadCertificate}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
            >
              Download Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}