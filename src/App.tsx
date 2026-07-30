import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// --- DATA TYPES & TEXT SIZES ---
type FormattedWord = { word: string; format?: 'bold' | 'italic' | 'normal' };

type CollectionImage = {
  src: string;
  title: string;
  description?: string; 
};

type CollectionData = { 
  id: string; 
  title: string; 
  description?: string; // New field added for the collection description
  images: CollectionImage[]; 
};

const CURSOR_WIDTHS: Record<string, number> = {
  "+ More": 75,
  "Close": 70,
  "Open": 65,
  "View": 65,
  "Back": 65,
  "View Collection": 140,
};

// --- SMART CDN HELPER ---
function getCDNImage(src: string, width: number = 800) {
  if (typeof window === 'undefined' || window.location.hostname === 'localhost') {
    return src;
  }
  if (window.location.hostname.includes('netlify.app')) {
    return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=80`;
  }
  if (window.location.hostname.includes('vercel.app')) {
    return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=80`;
  }
  return src;
}

// --- ROBUST CSV PARSER ---
// Safely parses CSV text, respecting commas placed inside double quotes.
function parseCSV(str: string) {
  const arr: string[][] = [];
  let quote = false;
  let row = 0, col = 0;
  for (let c = 0; c < str.length; c++) {
      const cc = str[c], nc = str[c+1];
      arr[row] = arr[row] || [];
      arr[row][col] = arr[row][col] || '';
      if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
      if (cc == '"') { quote = !quote; continue; }
      if (cc == ',' && !quote) { ++col; continue; }
      if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
      if (cc == '\n' && !quote) { ++row; col = 0; continue; }
      if (cc == '\r' && !quote) { ++row; col = 0; continue; }
      arr[row][col] += cc;
  }
  return arr;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// --- 1. CUSTOM CURSOR ---
function CustomCursor({ text }: { text: string }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice] = useState(() => typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches);

  useEffect(() => {
    if (isTouchDevice) return;
    const updateMousePosition = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [isTouchDevice]);

  if (isTouchDevice) return null; 

  const baseSize = 12; 
  const expandedWidth = text ? (CURSOR_WIDTHS[text] || 80) : baseSize; 
  const expandedHeight = text ? 32 : baseSize;

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] flex items-center justify-center overflow-hidden backdrop-blur-md shadow-sm border border-white/20 text-white font-sans text-xs tracking-wider"
      animate={{ x: mousePosition.x - expandedWidth / 2, y: mousePosition.y - expandedHeight / 2, width: expandedWidth, height: expandedHeight, backgroundColor: "rgba(0, 0, 0, 0.45)" }}
      transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {text && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap font-medium"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- 2. FAST SCRAMBLED TEXT ---
function ScrambledText({ words }: { words: FormattedWord[] }) {
  const fullText = words.map(w => w.word).join(' ');
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.split('').map((letter, index) => {
        if (index < iteration) return fullText[index];
        if (letter === ' ') return ' ';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if (iteration >= fullText.length) clearInterval(interval);
      iteration += 1; 
    }, 15);
    return () => clearInterval(interval);
  }, [fullText]);

  const displayWords = displayText.split(' ');

  return (
    <span className="inline">
      {words.map((w, i) => {
        let textStyle = "";
        if (w.format === 'bold') textStyle = "font-bold text-gray-900";
        if (w.format === 'italic') textStyle = "italic font-serif text-gray-500";
        
        return (
          <span key={i}>
            <span className={`relative inline-block mb-[0.2em] ${textStyle}`}>
              <span className="invisible">{w.word}</span>
              <span className="absolute top-0 left-0 w-full text-center">{displayWords[i] || ''}</span>
            </span>
            {' '}
          </span>
        );
      })}
    </span>
  );
}

// --- 3. STORYTELLER TEXT ---
function BlurText({ words }: { words: FormattedWord[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <span ref={ref} className="inline">
      {words.map((w, i) => {
        let textStyle = "";
        if (w.format === 'bold') textStyle = "font-bold text-gray-900";
        if (w.format === 'italic') textStyle = "italic text-gray-500";

        return (
          <span key={i}>
            <motion.span
              initial={{ filter: 'blur(12px)', opacity: 0 }}
              animate={isInView ? { filter: 'blur(0px)', opacity: 1 } : {}}
              transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
              className={`inline-block mb-[0.1em] ${textStyle}`}
            >
              {w.word}
            </motion.span>
            {' '}
          </span>
        );
      })}
    </span>
  );
}

// --- 4. TEXT EFFECT SLIDE ---
function SlideText({ text }: { text: string }) {
  return (
    <motion.h2 
      className="text-3xl md:text-5xl font-serif text-gray-900 mb-10 md:mb-16 flex flex-wrap"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
      }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          variants={{
            hidden: { y: 20, opacity: 0, filter: 'blur(4px)' },
            visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { type: 'spring', damping: 12, stiffness: 150 } }
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h2>
  );
}

// --- TEXT SHIMMER COMPONENT ---
function TextShimmer({ 
  children, 
  className = '', 
  duration = 2 
}: { 
  children: string; 
  className?: string; 
  duration?: number 
}) {
  return (
    <motion.span
      className={`inline-block bg-clip-text text-transparent bg-[length:250%_100%] ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(110deg, rgba(255,255,255,0.25) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.25) 65%)',
      }}
      initial={{ backgroundPosition: '0% 0%' }}
      animate={{ backgroundPosition: '100% 0%' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}

// --- 5. MAGNETIC BUTTON ---
function MagneticButton({ children, href }: { children: React.ReactNode, href: string }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isTouchDevice] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches
  );

  const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isTouchDevice) return; 
    const { clientX, clientY } = e;
    const { height, width, left, top } = e.currentTarget.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 }); 
  };
  
  const reset = () => {
    if (isTouchDevice) return;
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    if (isRedirecting) return;
    
    setIsRedirecting(true);
    
    setTimeout(() => {
      window.open(href, '_blank', 'noopener,noreferrer');
      setIsRedirecting(false);
    }, 2000);
  };

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-flex px-10 py-4 bg-gray-900 rounded-full cursor-none relative items-center justify-center hover:bg-black transition-colors overflow-hidden text-white"
>
      {isRedirecting ? (
        <TextShimmer duration={1.2} className="relative z-10 font-sans tracking-wide text-sm font-medium">
          Redirecting...
        </TextShimmer>
      ) : (
        <span className="relative z-10 inline-block font-sans tracking-wide text-sm font-medium">
          {children}
        </span>
      )}
    </motion.a> 
  );
}

// --- 6. IN-VIEW MASONRY IMAGE ---
function MasonryImage({ 
  img, setCursorText, onImageClick
}: { 
  img: CollectionImage, setCursorText: (text: string) => void, onImageClick: (img: CollectionImage) => void
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      ref={ref}
      onClick={() => onImageClick(img)}
      onMouseEnter={() => setCursorText("+ More")}
      onMouseLeave={() => setCursorText("")}
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full mb-3 md:mb-6 break-inside-avoid overflow-hidden rounded-xl cursor-none group shadow-sm hover:shadow-md transition-shadow duration-300 bg-gray-100"
    >
      <div className={`absolute inset-0 bg-gray-200 transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'}`} />

      <img 
        src={getCDNImage(img.src, 800)} 
        alt={img.title} 
        loading="lazy" 
        decoding="async" 
        onLoad={() => setIsLoaded(true)}
        className={`relative z-10 w-full h-auto block transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
      />
      
      <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none flex flex-col justify-end z-20">
        <div 
          className="absolute inset-0 z-0 opacity-100 md:opacity-0 group-hover:opacity-100 backdrop-blur-[12px] md:backdrop-blur-[16px] transition-all duration-500 ease-out"
          style={{
            maskImage: 'linear-gradient(to top, black 10%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 100%)'
          }}
        />
        <div className="relative z-20 p-3 md:p-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out flex justify-between items-end">
          <span className="text-white font-sans font-medium tracking-wide text-xs md:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate pr-2">
            {img.title}
          </span>
          <span className="md:hidden flex-shrink-0 bg-black/45 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[9px] font-sans tracking-wider border border-white/20 shadow-sm">
            + More
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// --- 6B. SLIDER ITEM ---
function SliderItem({ 
  img, setCursorText, onImageClick 
}: { 
  img: CollectionImage, setCursorText: (text: string) => void, onImageClick: (img: CollectionImage) => void 
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={() => onImageClick(img)}
      onMouseEnter={() => setCursorText("+ More")}
      onMouseLeave={() => setCursorText("")}
      className="relative h-[250px] md:h-[500px] aspect-[4/5] flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 cursor-none bg-gray-100 group"
    >
      <div className={`absolute inset-0 bg-gray-200 transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'}`} />

      <img 
        src={getCDNImage(img.src, 600)} 
        alt={img.title} 
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`relative z-10 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
      />
      
      <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none flex flex-col justify-end z-20">
        <div 
          className="absolute inset-0 z-0 opacity-100 md:opacity-0 group-hover:opacity-100 backdrop-blur-[16px] md:backdrop-blur-[24px] transition-all duration-500 ease-out"
          style={{
            maskImage: 'linear-gradient(to top, black 10%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 100%)'
          }}
        />
        <div className="relative z-20 p-4 md:p-8 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out flex justify-between items-end">
          <span className="text-white font-sans font-medium tracking-wider text-xs md:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate pr-2">
            {img.title}
          </span>
          <span className="md:hidden flex-shrink-0 bg-black/45 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-sans tracking-wider border border-white/20 shadow-sm">
            + More
          </span>
        </div>
      </div>
    </div>
  );
}

// --- 7. INFINITE SLIDER ---
function InfiniteSlider({ 
  images, setCursorText, onImageClick
}: { 
  images: CollectionImage[], setCursorText: (text: string) => void, onImageClick: (img: CollectionImage) => void
}) {
  const [isHovered, setIsHovered] = useState(false);
  const duplicatedImages = [...images, ...images, ...images];

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] -ml-6 md:-ml-8 mt-10 md:mt-20 mb-10 overflow-hidden py-10 cursor-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCursorText(""); }}
    >
      <motion.div
        className="flex gap-4 md:gap-6 pr-4 md:pr-6 min-w-max"
        animate={{ x: ["0%", "-33.333333%"] }}
        transition={{ duration: isHovered ? 80 : 20, ease: "linear", repeat: Infinity }}
      >
        {duplicatedImages.map((img, index) => (
          <SliderItem 
            key={index} 
            img={img} 
            setCursorText={setCursorText} 
            onImageClick={onImageClick} 
          />
        ))}
      </motion.div>
    </div>
  );
}

// --- 8. COLLECTION ACCORDION COMPONENT ---
function CollectionAccordion({ 
  collection, setCursorText, onImageClick 
}: { 
  collection: CollectionData, setCursorText: (text: string) => void, onImageClick: (img: CollectionImage) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full border-b border-gray-100 py-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setCursorText(isOpen ? "Close" : "Open")}
        onMouseLeave={() => setCursorText("")}
        className="w-full py-6 flex items-center justify-between outline-none cursor-none group"
      >
        <div className="flex items-center gap-4 text-gray-400 group-hover:text-gray-900 transition-colors">
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" /></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
          )}
          <span className="text-xl md:text-2xl font-sans tracking-wide text-gray-800">{collection.title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-gray-300 group-hover:text-gray-900 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            {/* Grid Layout */}
            <div className="columns-2 md:columns-3 lg:columns-3 gap-3 md:gap-6 pt-6 pb-6 px-1 md:px-2">
              {collection.images.map((img, index) => (
                <MasonryImage
                  key={index}
                  img={img}
                  setCursorText={setCursorText}
                  onImageClick={onImageClick}
                />
              ))}
            </div>
            
            {/* Collection Description Displayed Underneath */}
            {collection.description && (
              <div className="pt-6 pb-10 mb-2 border-t border-gray-100 px-2 flex justify-start">
                <p className="text-gray-500 font-sans text-sm md:text-base tracking-wide leading-relaxed max-w-3xl border-l-2 border-gray-800 pl-4">
                  {collection.description}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN GALLERY APP ---

const FEATURED_COLLECTION_ID = '2k26wrks'; 

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'collections'>('home');
  const [cursorText, setCursorText] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState<CollectionImage | null>(null);
  const [isModalImageLoaded, setIsModalImageLoaded] = useState(false);
  
  // --- NEW: ASYNC DATA STATE ---
  const [archiveCollections, setArchiveCollections] = useState<CollectionData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- DATA FETCHING EFFECT ---
  useEffect(() => {
    fetch('/collections.csv')
      .then(response => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.text();
      })
      .then(csvText => {
        const rows = parseCSV(csvText).slice(1); // Parse and skip header
        
        // Group rows by Collection ID
        const collectionsMap = new Map<string, CollectionData>();
        
        rows.forEach(row => {
          if (row.length < 5) return; // Skip broken or empty rows
          const [colId, colTitle, colDesc, imgSrc, imgTitle, imgDesc] = row;
          
          if (!collectionsMap.has(colId)) {
            collectionsMap.set(colId, {
              id: colId,
              title: colTitle,
              description: colDesc || undefined,
              images: []
            });
          }
          
          collectionsMap.get(colId)!.images.push({
            src: imgSrc,
            title: imgTitle,
            description: imgDesc || undefined
          });
        });

        setArchiveCollections(Array.from(collectionsMap.values()));
        setIsLoadingData(false);
      })
      .catch(error => {
        console.error("Failed to load CSV:", error);
        setIsLoadingData(false);
      });
  }, []);

  // Use useMemo so sliders dynamically react when the CSV data loads
  const featuredSliderImages = useMemo(() => {
    if (!archiveCollections.length) return [];
    const selectedCollection = archiveCollections.find(c => c.id === FEATURED_COLLECTION_ID) || archiveCollections[0];
    return selectedCollection.images;
  }, [archiveCollections]);

  const randomMasonryImages = useMemo(() => {
    if (!archiveCollections.length) return [];
    const allAvailableImages = archiveCollections.flatMap(collection => collection.images);
    const filteredImages = allAvailableImages.filter(
      img => !featuredSliderImages.some(featuredImg => featuredImg.src === img.src)
    );
    return shuffleArray(filteredImages).slice(0, 8);
  }, [archiveCollections, featuredSliderImages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  const handleArtworkSelect = (img: CollectionImage) => {
    setIsModalImageLoaded(false); 
    setSelectedArtwork(img);      
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedArtwork(null);
        setCursorText("");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const welcomeWords: FormattedWord[] = [
    { word: "Why" }, { word: "keep" }, { word: "all" }, { word: "my" }, { word: "favorite", format: "italic" },
    { word: "designs" }, { word: "hidden" }, { word: "away" }, { word: "in" }, { word: "a" }, { word: "folder?" },
    { word: "I" }, { word: "finally" }, { word: "decided" }, { word: "I" }, { word: "shouldn't.", format: "bold" },
    { word: "Hey," }, { word: "I'm" }, { word: "hm1tsu,", format: "bold" },
    { word: "and" }, { word: "this" }, { word: "is" }, { word: "where" }, { word: "I" }, { word: "put" }, { word: "my" },
    { word: "favorite", format: "italic" }, { word: "ideas" }, { word: "on" }, { word: "display." }
  ];

  const aboutWords: FormattedWord[] = [
    { word: "I" }, { word: "operate" }, { word: "as" }, { word: "a" }, { word: "one-person" },
    { word: "department", format: "bold" }, { word: "of", format: "bold" }, { word: "creative.", format: "bold" },
    { word: "This" }, { word: "is" }, { word: "where" },
    { word: "experimental", format: "italic" }, { word: "ideas" }, { word: "and" }, { word: "digital" }, { word: "craftsmanship" },
    { word: "come" }, { word: "together." }
  ];

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-700 font-serif p-6 md:p-8 flex flex-col items-center justify-between relative overflow-x-hidden cursor-none select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      
      <style dangerouslySetInnerHTML={{__html: `
        html, body { -ms-overflow-style: none; scrollbar-width: none; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
      `}} />

      <CustomCursor text={cursorText} />

      {/* CLOSER LOOK MODAL */}
      <AnimatePresence>
        {selectedArtwork && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-none">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-md"
              onClick={() => { setSelectedArtwork(null); setCursorText(""); }}
              onMouseEnter={() => setCursorText("Close")}
              onMouseLeave={() => setCursorText("")}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full h-[90vh] flex flex-col items-center justify-center p-4 pointer-events-none"
            >
                <div className="w-full h-[80%] flex items-center justify-center relative">
                   {!isModalImageLoaded && (
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
                     </div>
                   )}
                   <img 
                     src={getCDNImage(selectedArtwork.src, 1600)} 
                     alt={selectedArtwork.title} 
                     decoding="async"
                     onLoad={() => setIsModalImageLoaded(true)}
                     onClick={(e) => {
                       e.stopPropagation();
                       if (currentView === 'home') {
                         setCurrentView('collections');
                         setSelectedArtwork(null);
                         setCursorText("");
                       } else {
                         setSelectedArtwork(null);
                         setCursorText("");
                       }
                     }}
                     onMouseEnter={() => setCursorText(currentView === 'home' ? "View Collection" : "Close")}
                     onMouseLeave={() => setCursorText("")}
                     className={`max-h-full max-w-full object-contain shadow-2xl cursor-none pointer-events-auto transition-opacity duration-700 ${isModalImageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                   />
                </div>
                
                <div 
                  className="text-center mt-6 pointer-events-auto max-w-xl mx-auto px-4"
                  onMouseEnter={() => setCursorText("Close")}
                  onMouseLeave={() => setCursorText("")}
                >
                    <h3 className="text-xl md:text-2xl font-serif text-gray-900">
                       {selectedArtwork.title}
                    </h3>
                    <p className="text-gray-500 font-sans mt-2 text-xs md:text-sm tracking-wide leading-relaxed">
                      {selectedArtwork.description || (currentView === 'home' ? 'Tap the image to view the full collection archive.' : 'A closer look at the details and digital framework.')}
                    </p>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONDITIONAL VIEWS --- */}
      {currentView === 'home' ? (
        <>
          <div className="w-full mt-16 md:mt-24 mb-10 flex justify-center px-2 md:px-4">
            <div className="w-full">
              <h1 className="text-xl md:text-3xl leading-relaxed tracking-wide font-normal text-justify">
                <ScrambledText words={welcomeWords} />
              </h1>
            </div>
          </div>

          <div className="w-full flex flex-col mt-8 md:mt-12">
            <span className="text-center text-[10px] md:text-xs font-sans tracking-widest text-gray-400 uppercase">Featured Works</span>
            <InfiniteSlider images={featuredSliderImages} setCursorText={setCursorText} onImageClick={handleArtworkSelect} />
          </div>

          <div className="mt-20 md:mt-32 w-full max-w-6xl px-2 md:px-4">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-[10px] md:text-xs font-sans tracking-widest text-gray-400 uppercase">Experimental Archive</span>
            </div>
            
            <div className="columns-2 md:columns-3 lg:columns-3 gap-3 md:gap-6">
              {randomMasonryImages.map((art, index) => (
                <MasonryImage key={index} img={art} setCursorText={setCursorText} onImageClick={handleArtworkSelect} />
              ))}
            </div>
          </div>

          <div className="mt-32 md:mt-40 mb-32 md:mb-40 flex flex-col items-center justify-center w-full max-w-3xl text-center px-4">
            <h2 className="text-[10px] md:text-sm font-sans tracking-widest text-gray-400 uppercase mb-8">About the Artist</h2>
            <p className="text-xl md:text-3xl font-serif text-gray-700 leading-relaxed text-justify">
              <BlurText words={aboutWords} />
            </p>
          </div>

          <div className="mt-10 mb-20 md:mb-32 flex flex-col items-center">
            <p className="text-gray-400 font-sans mb-8 text-sm md:text-base">Have an idea in mind?</p>
            <MagneticButton href="https://mail.google.com/mail/?view=cm&fs=1&to=hm1tsv@gmail.com">Let's Talk Design</MagneticButton>
          </div>
        </>
      ) : (
        <div className="w-full max-w-5xl mt-12 px-2 md:px-4 flex flex-col items-start min-h-[80vh] mb-32">
          
          <button 
            onClick={() => {
              setCurrentView('home');
              setCursorText("");
            }}
            onMouseEnter={() => setCursorText("Back")}
            onMouseLeave={() => setCursorText("")}
            className="mb-10 md:mb-16 flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-colors cursor-none outline-none group"
          >
            <svg className="transform group-hover:-translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span className="font-sans text-xs md:text-sm tracking-widest uppercase">Return to Gallery</span>
          </button>

          <SlideText text="Collections" />

          <div className="w-full flex flex-col">
            {archiveCollections.map((collection) => (
               <CollectionAccordion 
                 key={collection.id} 
                 collection={collection} 
                 setCursorText={setCursorText} 
                 onImageClick={handleArtworkSelect}
               />
            ))}
          </div>

        </div>
      )}

      {/* FOOTER SECTION */}
      <footer className="w-full mt-auto pt-10 pb-4 text-center z-10">
        <span className="text-[10px] md:text-xs font-sans tracking-widest text-gray-400 uppercase">
          ©2025 hm1tsu. All rights reserved.
        </span>
      </footer>

    </div>
  );
}