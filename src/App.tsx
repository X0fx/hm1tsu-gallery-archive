import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// --- DATA TYPES & TEXT SIZES ---
type FormattedWord = { word: string; format?: 'bold' | 'italic' | 'normal' };

type CollectionImage = {
  src: string;
  title: string;
};

type CollectionData = { 
  id: string; 
  title: string; 
  images: CollectionImage[]; 
};

const CURSOR_WIDTHS: Record<string, number> = {
  "+ More": 76,
  "Close": 70,
  "Open": 65,
  "View": 65,
  "Back": 65,
  "View Collection": 140,
};

// --- DATA: ARCHIVE COLLECTIONS ---
const ARCHIVE_COLLECTIONS: CollectionData[] = [
  {
    id: '2k26wrks',
    title: '2k26wrks',
    images: [
      { src: "/artworks/2k26_wrks/ciaccona.png", title: "Ciaccona" },
      { src: "/artworks/2k26_wrks/cosette.png", title: "Cosette" },
      { src: "/artworks/2k26_wrks/lewis.png", title: "Lewis" },
      { src: "/artworks/2k26_wrks/maruzen.png", title: "Maruzen" },
      { src: "/artworks/2k26_wrks/ots14.png", title: "OTS-14" },
      { src: "/artworks/2k26_wrks/pulchra.png", title: "Pulchra" },
    ]
  },
  {
    id: 'archive25',
    title: 'archive25',
    images: [
      { src: "/artworks/archive25/ache.jpg", title: "Ache" },
      { src: "/artworks/archive25/chrome.jpg", title: "Chrome" },
      { src: "/artworks/archive25/encore.jpg", title: "Encore" },
      { src: "/artworks/archive25/firefly.jpg", title: "Firefly" },
      { src: "/artworks/archive25/hkt.jpg", title: "HKT" },
      { src: "/artworks/archive25/hugo.jpg", title: "Hugo" },
      { src: "/artworks/archive25/kafka.jpg", title: "Kafka" },
      { src: "/artworks/archive25/lagrange.jpg", title: "Lagrange" },
      { src: "/artworks/archive25/maid.jpg", title: "Maid" },
      { src: "/artworks/archive25/marin.jpg", title: "Marin" },
      { src: "/artworks/archive25/mart.jpg", title: "Mart" },
      { src: "/artworks/archive25/susei.jpg", title: "Susei" },
      { src: "/artworks/archive25/wt60.jpg", title: "WT60" },
    ]
  },
  {
    id: 'makeupBA',
    title: 'SLClubDisc',
    images: [
      { src: "/artworks/slcdisc/1.jpg", title: "SL Club 1" },
      { src: "/artworks/slcdisc/2.jpg", title: "SL Club 2" },
      { src: "/artworks/slcdisc/3.jpg", title: "SL Club 3" },
      { src: "/artworks/slcdisc/4.jpg", title: "SL Club 4" },
      { src: "/artworks/slcdisc/5.jpg", title: "SL Club 5" },
      { src: "/artworks/slcdisc/6.jpg", title: "SL Club 6" },
    ]
  },
  {
    id: 'gamecollab',
    title: 'JohnBrineCollab',
    images: [
      { src: "/artworks/johnbrine/1.jpg", title: "JB Collab 1" },
      { src: "/artworks/johnbrine/2.jpg", title: "JB Collab 2" },
      { src: "/artworks/johnbrine/3.jpg", title: "JB Collab 3" },
      { src: "/artworks/johnbrine/4.jpg", title: "JB Collab 4" },
    ]
  },
  {
    id: 'evecos',
    title: 'evecos',
    images: [
      { src: "/artworks/evecos/1.jpg", title: "Eve Cosplay 1" },
      { src: "/artworks/evecos/2.jpg", title: "Eve Cosplay 2" },
      { src: "/artworks/evecos/3.jpg", title: "Eve Cosplay 3" },
      { src: "/artworks/evecos/4.jpg", title: "Eve Cosplay 4" },
    ]
  },
  {
    id: 'twt13',
    title: 'twitter_banner',
    images: [
      { src: "/artworks/twt13/1.jpg", title: "Banner 1" },
      { src: "/artworks/twt13/2.jpg", title: "Banner 2" },
      { src: "/artworks/twt13/3.jpg", title: "Banner 3" },
      { src: "/artworks/twt13/4.jpg", title: "Banner 4" },
      { src: "/artworks/twt13/5.jpg", title: "Banner 5" },
      { src: "/artworks/twt13/6.jpg", title: "Banner 6" },
      { src: "/artworks/twt13/7.jpg", title: "Banner 7" },
      { src: "/artworks/twt13/8.jpg", title: "Banner 8" },
    ]
  },
  {
    id: 'arcaeatix',
    title: 'arcaeaTicket',
    images: [
      { src: "/artworks/arcaeatx/aglskr.png", title: "Aglskr" },
      { src: "/artworks/arcaeatx/feef.png", title: "Feef" },
      { src: "/artworks/arcaeatx/tempe.png", title: "Tempe" },
    ]
  },
  {
    id: 'others',
    title: 'others',
    images: [
      { src: "/artworks/cal.jpg", title: "Cal" },
      { src: "/artworks/eve.jpg", title: "Eve" },
      { src: "/artworks/exa.jpg", title: "Exa" },
      { src: "/artworks/flame2.jpg", title: "Flame II" },
      { src: "/artworks/flamew.jpg", title: "Flame W" },
      { src: "/artworks/mare.jpg", title: "Mare" },
      { src: "/artworks/mcedit.jpg", title: "MC Edit" },
      { src: "/artworks/mel.jpg", title: "Mel" },
      { src: "/artworks/sanhua13.jpg", title: "Sanhua 13" },
    ]
  }
];

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
          <span key={i} className={`relative inline-block mr-[0.25em] mb-[0.2em] ${textStyle}`}>
            <span className="invisible">{w.word}</span>
            <span className="absolute top-0 left-0 w-full text-center">{displayWords[i] || ''}</span>
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
          <motion.span
            key={i}
            initial={{ filter: 'blur(12px)', opacity: 0 }}
            animate={isInView ? { filter: 'blur(0px)', opacity: 1 } : {}}
            transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
            className={`inline-block mr-[0.25em] mb-[0.1em] ${textStyle}`}
          >
            {w.word}
          </motion.span>
        );
      })}
    </span>
  );
}

// --- 4. MAGNETIC BUTTON ---
function MagneticButton({ children, href }: { children: React.ReactNode, href: string }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = e.currentTarget.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 }); 
  };
  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.a
      href={href}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block px-10 py-4 bg-gray-900 text-white rounded-full font-sans tracking-wide text-sm hover:bg-black transition-colors cursor-none"
    >
      {children}
    </motion.a>
  );
}

// --- 5. IN-VIEW MASONRY IMAGE WITH PROGRESSIVE BLUR ---
function MasonryImage({ 
  src, alt, setCursorText, onImageClick
}: { 
  src: string, alt: string, setCursorText: (text: string) => void, onImageClick: (src: string) => void
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      onClick={() => onImageClick(src)}
      onMouseEnter={() => setCursorText("+ More")}
      onMouseLeave={() => setCursorText("")}
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full mb-6 break-inside-avoid overflow-hidden rounded-xl cursor-none group shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full h-auto block bg-gray-50" />
      
      {/* PERFECTED PROGRESSIVE BLUR LAYER (No Black Gradient, No Jumping) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none flex flex-col justify-end">
        <div 
          className="absolute inset-0 z-0 backdrop-blur-none group-hover:backdrop-blur-[16px] transition-all duration-500 ease-out"
          style={{
            maskImage: 'linear-gradient(to top, black 10%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 100%)'
          }}
        />
        {/* Title Text */}
        <div className="relative z-20 p-5 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
          {/* Added a heavy drop shadow so the white text stays readable against light images without needing a dark gradient */}
          <span className="text-white font-sans font-medium tracking-wide text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {alt}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// --- 6. INFINITE SLIDER WITH PROGRESSIVE BLUR ---
function InfiniteSlider({ 
  images, setCursorText, onImageClick
}: { 
  images: CollectionImage[], setCursorText: (text: string) => void, onImageClick: (src: string) => void
}) {
  const [isHovered, setIsHovered] = useState(false);
  const duplicatedImages = [...images, ...images, ...images];

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="w-full mt-20 mb-10 overflow-hidden py-10 relative cursor-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCursorText(""); }}
    >
      <motion.div
        className="flex gap-6 min-w-max px-3"
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: isHovered ? 80 : 20, ease: "linear", repeat: Infinity }}
      >
        {duplicatedImages.map((img, index) => (
          <div 
            key={index} 
            onClick={() => onImageClick(img.src)}
            onMouseEnter={() => setCursorText("+ More")}
            onMouseLeave={() => setCursorText("")}
            className="relative h-[350px] md:h-[500px] aspect-[4/5] flex-shrink-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 cursor-none bg-gray-50 group"
          >
            <img src={img.src} alt={img.title} decoding="async" className="w-full h-full object-cover" />
            
            {/* PERFECTED PROGRESSIVE BLUR LAYER (No Black Gradient, No Jumping) */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none flex flex-col justify-end">
              <div 
                className="absolute inset-0 z-0 backdrop-blur-none group-hover:backdrop-blur-[24px] transition-all duration-500 ease-out"
                style={{
                  maskImage: 'linear-gradient(to top, black 10%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 100%)'
                }}
              />
              <div className="relative z-20 p-6 md:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                <span className="text-white font-sans font-medium tracking-wider text-base md:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {img.title}
                </span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// --- 7. COLLECTION ACCORDION COMPONENT ---
function CollectionAccordion({ 
  collection, setCursorText, onImageClick 
}: { 
  collection: CollectionData, setCursorText: (text: string) => void, onImageClick: (src: string) => void 
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
          <span className="text-2xl font-sans tracking-wide text-gray-800">{collection.title}</span>
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
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pt-8 pb-12 px-2">
              {collection.images.map((img, index) => (
                <MasonryImage
                  key={index}
                  src={img.src}
                  alt={img.title}
                  setCursorText={setCursorText}
                  onImageClick={onImageClick}
                />
              ))}
            </div>
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
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);

  const [featuredSliderImages] = useState<CollectionImage[]>(() => {
    const selectedCollection = ARCHIVE_COLLECTIONS.find(c => c.id === FEATURED_COLLECTION_ID) || ARCHIVE_COLLECTIONS[0];
    return selectedCollection.images;
  });

  const [randomMasonryImages] = useState<CollectionImage[]>(() => {
    const allAvailableImages = ARCHIVE_COLLECTIONS.flatMap(collection => collection.images);
    const shuffledImages = shuffleArray(allAvailableImages);
    return shuffledImages.slice(0, 8);
  });

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

  return (
    <div className="min-h-screen bg-white text-gray-700 font-serif p-8 flex flex-col items-center justify-between relative overflow-x-hidden cursor-none select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      
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
              className="absolute inset-0 bg-white/85 backdrop-blur-sm"
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
                <div className="w-full h-[80%] flex items-center justify-center overflow-hidden">
                   <img 
                     src={selectedArtwork} 
                     alt="Expanded Artwork" 
                     decoding="async"
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
                     className="max-h-full max-w-full object-contain shadow-2xl cursor-none pointer-events-auto" 
                   />
                </div>
                
                <div 
                  className="text-center mt-6 pointer-events-auto"
                  onMouseEnter={() => setCursorText("Close")}
                  onMouseLeave={() => setCursorText("")}
                >
                    <h3 className="text-2xl font-serif text-gray-900">
                       {currentView === 'home' ? 'Featured Exhibition' : 'Archive Detail'}
                    </h3>
                    <p className="text-gray-500 font-sans mt-2 text-sm tracking-wide">
                      {currentView === 'home' ? 'Click the image to view the full collection archive.' : 'A closer look at the details and digital framework.'}
                    </p>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONDITIONAL VIEWS --- */}
      {currentView === 'home' ? (
        <>
          <div className="max-w-2xl mt-24 mb-10 w-full text-center">
            <h1 className="text-2xl md:text-3xl leading-relaxed tracking-wide font-normal">
              <ScrambledText words={welcomeWords} />
            </h1>
          </div>

          <div className="w-full max-w-[100vw] flex flex-col items-center mt-12">
            <span className="text-xs font-sans tracking-widest text-gray-400 uppercase">Featured Works</span>
            <InfiniteSlider images={featuredSliderImages} setCursorText={setCursorText} onImageClick={setSelectedArtwork} />
          </div>

          <div className="mt-32 w-full max-w-6xl px-4">
            <div className="text-center mb-16">
              <span className="text-xs font-sans tracking-widest text-gray-400 uppercase">Experimental Archive</span>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {randomMasonryImages.map((art, index) => (
                <MasonryImage key={index} src={art.src} alt={art.title} setCursorText={setCursorText} onImageClick={setSelectedArtwork} />
              ))}
            </div>
          </div>

          <div className="mt-40 mb-40 flex flex-col items-center justify-center w-full max-w-3xl text-center px-4">
            <h2 className="text-sm font-sans tracking-widest text-gray-400 uppercase mb-8">About the Artist</h2>
            <p className="text-2xl md:text-3xl font-serif text-gray-700 leading-relaxed">
              <BlurText words={aboutWords} />
            </p>
          </div>

          <div className="mt-10 mb-32 flex flex-col items-center">
            <p className="text-gray-400 font-sans mb-8">Have an idea in mind?</p>
            <MagneticButton href="mailto:hello@example.com">Let's Talk Design</MagneticButton>
          </div>
        </>
      ) : (
        <div className="w-full max-w-5xl mt-12 px-4 flex flex-col items-start min-h-[80vh] mb-32">
          
          <button 
            onClick={() => {
              setCurrentView('home');
              setCursorText("");
            }}
            onMouseEnter={() => setCursorText("Back")}
            onMouseLeave={() => setCursorText("")}
            className="mb-16 flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-colors cursor-none outline-none group"
          >
            <svg className="transform group-hover:-translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span className="font-sans text-sm tracking-widest uppercase">Return to Gallery</span>
          </button>

          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-16">Collections</h2>

          <div className="w-full flex flex-col">
            {ARCHIVE_COLLECTIONS.map((collection) => (
               <CollectionAccordion 
                 key={collection.id} 
                 collection={collection} 
                 setCursorText={setCursorText} 
                 onImageClick={setSelectedArtwork}
               />
            ))}
          </div>

        </div>
      )}

    </div>
  );
}