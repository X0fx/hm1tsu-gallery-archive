import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// This is our custom "secret code" animation for your welcome message
function ScrambledText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((letter, index) => {
            if (index < iteration) return text[index];
            if (letter === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-serif p-8 flex flex-col items-center justify-between">
      
      {/* 1. THE ENTRANCE: Your scrambled welcome message */}
      <div className="max-w-2xl text-center mt-24">
        <h1 className="text-2xl md:text-3xl leading-relaxed tracking-wide font-normal">
          <ScrambledText text="Why keep all my favorite designs hidden away in a folder? I finally decided I shouldn't. Hey, I'm hm1tsu, and this is where I put my favorite ideas on display." />
        </h1>
      </div>

      {/* 2. THE FEATURE WALL: The frame for your 12x15 masterpiece */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="mt-28 w-full max-w-4xl border border-dashed border-gray-300 rounded-lg h-[500px] flex flex-col items-center justify-center text-gray-400 p-6 text-center"
      >
        <span className="text-lg font-sans font-medium text-gray-500">Featured Masterpiece (12x15 in)</span>
        <span className="text-sm font-sans text-gray-400 mt-2">You will attach your main artwork image here later!</span>
      </motion.div>

      {/* 3. THE DISCOVERY ROOM: The mosaic frames for your experimental art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="mt-20 mb-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="border border-dashed border-gray-200 rounded-lg h-64 flex items-center justify-center text-gray-400 p-4 font-sans text-sm">[ Experimental Art 1 ]</div>
        <div className="border border-dashed border-gray-200 rounded-lg h-80 flex items-center justify-center text-gray-400 p-4 font-sans text-sm">[ Experimental Art 2 ]</div>
        <div className="border border-dashed border-gray-200 rounded-lg h-52 flex items-center justify-center text-gray-400 p-4 font-sans text-sm">[ Experimental Art 3 ]</div>
      </motion.div>

    </div>
  );
}