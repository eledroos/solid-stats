import React, { useState, useEffect, useRef } from 'react';
import { Upload, Share2, MapPin, User, Sun, Moon, Flame, Loader2, X, Info, Shield, Github, Ticket, HelpCircle, ExternalLink } from 'lucide-react';

// --- Components ---

const BrutalButton = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled }) => {
  const baseStyles = "relative inline-flex items-center justify-center font-bold border-4 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#3B82F6] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#2563EB]",
    secondary: "bg-white text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} px-6 py-3 text-lg ${className}`}
    >
      {Icon && <Icon className={`mr-2 w-5 h-5 ${disabled ? 'animate-spin' : ''}`} />}
      {children}
    </button>
  );
};

const BrutalCard = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 ${className}`}>
      {title && (
        <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter border-b-4 border-black pb-2 inline-block">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

const ReceiptCard = ({ children, title }) => {
  return (
    <div className="relative drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-8">
      <div className="bg-white border-x-4 border-t-4 border-black p-6 pb-12 relative z-10 receipt-content">
        {title && (
            <div className="text-center border-b-4 border-dashed border-black pb-4 mb-4">
                <h3 className="text-2xl font-black uppercase tracking-tighter inline-flex items-center gap-2">
                <Ticket className="w-6 h-6"/> {title}
                </h3>
            </div>
        )}
        {children}
        
        {/* Jagged Edge Generator (CSS Radial Gradient) */}
        <div className="absolute -bottom-4 left-[-4px] right-[-4px] h-6 bg-white border-t-0"
             style={{
               background: "linear-gradient(135deg, transparent 10px, white 0) 0 0, linear-gradient(-135deg, transparent 10px, white 0) 0 0",
               backgroundSize: "20px 20px",
               backgroundRepeat: "repeat-x",
               filter: "drop-shadow(0px 4px 0px black)" // Outline hack for jagged edge
             }}>
        </div>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b-4 border-black bg-blue-50 sticky top-0 z-10">
          <h3 className="text-xl font-black uppercase">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 border-2 border-transparent hover:border-black transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const PieChart = ({ data }) => {
  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((slice, i) => {
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += slice.percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = slice.percent > 0.5 ? 1 : 0;
    
    const pathData = [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`
    ].join(' ');

    return (
      <path d={pathData} fill={slice.color} stroke="black" strokeWidth="0.05" key={i} className="hover:opacity-80 transition-opacity cursor-pointer" />
    );
  });

  return (
    <div className="relative w-24 h-24">
      <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full">
        {slices}
      </svg>
    </div>
  );
};

// --- REAL USER DATA (Extracted from PDF) ---
const REAL_DATA = [
  { date: "12/31/2025", time: "3:00pm", type: "Signature50", instructor: "Jacqui Caefer", location: "MA, Arsenal Yards" },
  { date: "12/30/2025", time: "9:00am", type: "Signature50", instructor: "Evonne Archer", location: "MA, Arsenal Yards" },
  { date: "12/29/2025", time: "8:00am", type: "Signature50", instructor: "Nikki Gagliano", location: "MA, Arsenal Yards" },
  { date: "12/28/2025", time: "1:00pm", type: "Signature50", instructor: "Morgan Brown", location: "MA, Arsenal Yards" },
  { date: "12/26/2025", time: "6:00am", type: "Signature50", instructor: "Matthew Skowronek", location: "MA, Burlington" },
  { date: "12/25/2025", time: "11:00am", type: "Signature50", instructor: "Morgan Brown", location: "MA, Arsenal Yards" },
  { date: "12/24/2025", time: "12:00pm", type: "Focus50", instructor: "Paige Persky", location: "MA, Arsenal Yards" },
  { date: "12/22/2025", time: "12:00pm", type: "Signature50", instructor: "Michael Hornig", location: "MA, Arsenal Yards" },
  { date: "12/21/2025", time: "10:00am", type: "Focus50", instructor: "Julia Dwyer", location: "MA, Arsenal Yards" },
  { date: "12/20/2025", time: "8:00am", type: "Signature50", instructor: "Nikki Gagliano", location: "MA, Arsenal Yards" },
  { date: "12/17/2025", time: "8:00am", type: "Signature50", instructor: "Nikki Gagliano", location: "MA, Arsenal Yards" },
  { date: "12/16/2025", time: "8:00am", type: "Signature50", instructor: "Rachael Martinez", location: "MA, Arsenal Yards" },
  { date: "12/15/2025", time: "9:00am", type: "Signature50", instructor: "Nikki Gagliano", location: "MA, Arsenal Yards" },
  { date: "12/13/2025", time: "2:00pm", type: "Signature50", instructor: "Pooja Wadhwani", location: "MA, Arsenal Yards" },
  { date: "12/12/2025", time: "9:10am", type: "Signature50", instructor: "Katie Stephanson", location: "NY, Downtown Brooklyn" },
  { date: "12/09/2025", time: "8:00am", type: "Signature50", instructor: "Rachael Martinez", location: "MA, Arsenal Yards" },
  { date: "12/07/2025", time: "11:00am", type: "Signature50", instructor: "Bridgett DeBlasiis", location: "MA, Seaport" },
  { date: "12/06/2025", time: "9:00am", type: "Signature50", instructor: "Julia Dwyer", location: "MA, Arsenal Yards" },
  { date: "12/05/2025", time: "4:10pm", type: "Signature50", instructor: "Rachel Ivy", location: "MA, South End" }, 
  { date: "12/04/2025", time: "8:00am", type: "Signature50", instructor: "Mary Russo", location: "MA, Arsenal Yards" },
  { date: "12/01/2025", time: "12:00pm", type: "Signature50", instructor: "Michael Hornig", location: "MA, Arsenal Yards" },
  { date: "11/29/2025", time: "9:00am", type: "Signature50", instructor: "Evonne Archer", location: "MA, Arsenal Yards" },
  { date: "11/28/2025", time: "10:00am", type: "Signature50", instructor: "Emily Donovan", location: "MA, Arsenal Yards" },
  { date: "11/25/2025", time: "11:00am", type: "Signature50", instructor: "Michael Hornig", location: "MA, Arsenal Yards" },
  { date: "11/23/2025", time: "5:00pm", type: "Signature50", instructor: "Emily Donovan", location: "MA, Arsenal Yards" },
  { date: "11/22/2025", time: "8:00am", type: "Signature50", instructor: "Ayannah Lang", location: "MA, Arsenal Yards" },
  { date: "11/20/2025", time: "10:00am", type: "Signature50", instructor: "Rachael Martinez", location: "MA, Arsenal Yards" },
  { date: "11/17/2025", time: "1:00pm", type: "Signature50", instructor: "Michael Hornig", location: "MA, Arsenal Yards" },
  { date: "10/31/2025", time: "10:00am", type: "Signature50", instructor: "Nikki Gagliano", location: "MA, Arsenal Yards" },
  { date: "10/30/2025", time: "9:00am", type: "Signature50", instructor: "Ayannah Lang", location: "MA, Arsenal Yards" },
  { date: "10/28/2025", time: "9:00am", type: "Signature50", instructor: "Rachael Martinez", location: "MA, Arsenal Yards" },
  { date: "10/25/2025", time: "3:00pm", type: "Foundation50", instructor: "Kim Vaughn", location: "MA, North Station" },
  { date: "10/23/2025", time: "8:30pm", type: "Foundation50", instructor: "Christian Lopez", location: "MA, North Station" },
  { date: "10/20/2025", time: "11:00am", type: "Starter50", instructor: "Rachael Martinez", location: "MA, Arsenal Yards" },
  { date: "10/07/2025", time: "10:00am", type: "Starter50", instructor: "Michael Hornig", location: "MA, Arsenal Yards" },
];

const getHour = (timeStr) => {
  const [time, modifier] = timeStr.split(/(am|pm)/);
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '0';
  if (modifier === 'pm') hours = parseInt(hours, 10) + 12;
  return parseInt(hours, 10);
};

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState('landing'); 
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'about' | 'privacy' | 'howto'
  
  const cardRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpload = () => {
    setView('processing');
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 10;
      if (p >= 100) {
        clearInterval(interval);
        calculateStats();
        setView('results');
      } else {
        setProgress(p);
      }
    }, 200);
  };

  const calculateStats = () => {
    const totalClasses = REAL_DATA.length;
    const totalMinutes = totalClasses * 50;

    const instructorCounts = REAL_DATA.reduce((acc, curr) => {
      const name = curr.instructor.split('-')[0].trim();
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    const sortedInstructors = Object.entries(instructorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const locationCounts = REAL_DATA.reduce((acc, curr) => {
      const loc = curr.location.replace('MA, ', '').replace('NY, ', '');
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});
    const topLocation = Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b);

    const monthlyActivity = new Array(12).fill(0);
    REAL_DATA.forEach(d => {
      const month = parseInt(d.date.split('/')[0]) - 1;
      monthlyActivity[month]++;
    });

    let morning = 0;
    let afternoon = 0;
    let evening = 0;
    
    REAL_DATA.forEach(d => {
      const hour = getHour(d.time);
      if (hour < 12) morning++;
      else if (hour < 17) afternoon++;
      else evening++;
    });

    const timeData = [
      { name: 'Morning', value: morning, color: '#3B82F6', percent: morning/totalClasses },
      { name: 'Afternoon', value: afternoon, color: '#93C5FD', percent: afternoon/totalClasses },
      { name: 'Evening', value: evening, color: '#1E40AF', percent: evening/totalClasses }
    ].filter(d => d.value > 0);

    const typeCounts = REAL_DATA.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});

    const sortedDates = REAL_DATA.map(d => new Date(d.date)).sort((a,b) => a-b);
    let maxStreak = 1;
    let currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const diffTime = Math.abs(sortedDates[i] - sortedDates[i - 1]);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays === 1) {
            currentStreak++;
        } else if (diffDays > 1) {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
        }
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    setStats({
      totalClasses,
      totalMinutes,
      sortedInstructors,
      topLocation,
      monthlyActivity,
      timeData,
      typeCounts,
      maxStreak
    });
  };

  const handleShare = async () => {
    if (!window.html2canvas) {
      alert("Generator is still loading... try again in a second.");
      return;
    }
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await window.html2canvas(cardRef.current, {
        scale: 2, 
        backgroundColor: '#F8FAFC',
        logging: false
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "MySolidStats2025.png", { type: "image/png" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'My SolidStats 2025',
              text: 'Check out my 2025 Solidcore stats! #SolidStats'
            });
          } catch (error) {
            if (error.name !== 'AbortError') triggerDownload(blob);
          }
        } else {
          triggerDownload(blob);
        }
        setIsSharing(false);
      });
    } catch (err) {
      setIsSharing(false);
      alert("Could not generate image. Please try screenshotting manually!");
    }
  };

  const triggerDownload = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MySolidStats2025.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Views ---

  const LandingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="mb-8 p-8 bg-[#DBEAFE] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full rotate-[-2deg] animate-fade-in-up">
        <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-black leading-[0.85]">
          Core<br/><span className="text-[#3B82F6]">Wrapped</span>
        </h1>
        <div className="text-2xl font-black italic bg-black text-white inline-block px-3 py-1 rotate-2">
          UNOFFICIAL 2025
        </div>
      </div>

      <p className="text-xl font-bold mb-10 max-w-md border-l-8 border-black pl-6 text-left animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        Ready to see your 2025 stats?
        <br/><span className="text-base font-normal mt-3 block text-gray-600">Based on your upload: <b>Account | Mindbody.pdf</b></span>
      </p>

      <div className="w-full max-w-sm group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <label 
          className="flex flex-col items-center justify-center w-full h-40 bg-[#EFF6FF] border-4 border-black cursor-pointer shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          onClick={handleUpload}
        >
          <div className="flex flex-col items-center justify-center">
            <p className="mb-2 text-xl font-black text-black uppercase">GENERATE REPORT</p>
            <p className="text-xs text-gray-500 font-bold">1 FILE SELECTED</p>
          </div>
        </label>
      </div>

      <button 
        onClick={() => setActiveModal('howto')}
        className="mt-6 flex items-center gap-2 text-sm font-bold bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all animate-fade-in-up"
        style={{animationDelay: '0.3s'}}
      >
        <HelpCircle size={16}/> How do I get my PDF?
      </button>
    </div>
  );

  const ProcessingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <h2 className="text-4xl font-black mb-8 uppercase text-center italic animate-pulse">Extracting<br/>Shakes...</h2>
      <div className="w-full max-w-md h-16 border-4 border-black p-2 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div 
          className="h-full bg-blue-500 transition-all duration-200 ease-linear border-r-4 border-black"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      <p className="mt-6 font-mono font-bold text-xl">{Math.floor(progress)}%</p>
    </div>
  );

  const ResultsView = () => (
    <div className="w-full max-w-4xl mx-auto pb-12 flex flex-col md:flex-row gap-8 items-start animate-fade-in-up">
      
      {/* LEFT COLUMN: The Visual "Wrapped" Card */}
      <div className="w-full md:w-[420px] flex-shrink-0 mx-auto">
         <div className="mb-4 flex justify-between items-center md:hidden">
             <h2 className="text-2xl font-black uppercase">Your Card</h2>
             <span className="text-xs font-bold bg-blue-100 px-2 py-1 border-2 border-black">PREVIEW</span>
         </div>

        {/* This div is the "Image" users would share */}
        <div ref={cardRef} className="bg-[#F8FAFC] border-4 border-black p-0 overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative aspect-[9/16] flex flex-col text-black group">
          
          {/* Header Section */}
          <div className="bg-black p-5 flex justify-between items-end border-b-4 border-black">
            <div>
              <h3 className="text-white text-4xl font-black uppercase tracking-tighter leading-none">
                Solid<br/><span className="text-[#3B82F6]">Stats</span>
              </h3>
            </div>
            <div className="text-right">
               <div className="text-[#3B82F6] font-black text-2xl">2025</div>
               <div className="text-white text-[10px] uppercase font-bold tracking-widest bg-gray-800 px-1">Unofficial</div>
            </div>
          </div>

          {/* MAIN STAT HERO */}
          <div className="p-5 border-b-4 border-black bg-[#DBEAFE] grid grid-cols-2 gap-2">
             <div className="col-span-1">
                 <div className="text-[10px] font-bold uppercase mb-1 tracking-widest text-gray-600">Total Classes</div>
                 <div className="text-6xl font-black text-black leading-[0.8] tracking-tight animate-scale-in origin-left">{stats.totalClasses}</div>
             </div>
             <div className="col-span-1 border-l-4 border-black pl-4 flex flex-col justify-center">
                 <div className="text-[10px] font-bold uppercase mb-1 tracking-widest text-gray-600">Minutes Shaking</div>
                 <div className="text-2xl font-black text-[#2563EB] animate-slide-in-right">{stats.totalMinutes.toLocaleString()}</div>
             </div>
          </div>

          {/* INSTRUCTOR LEADERBOARD */}
          <div className="p-5 border-b-4 border-black">
             <div className="flex items-center gap-2 mb-3">
                 <div className="bg-black text-white p-1"><User size={14} /></div>
                 <div className="text-xs font-black uppercase tracking-wider">Top Coaches</div>
             </div>
             <div className="space-y-3">
                {stats.sortedInstructors.map(([name, count], idx) => (
                    <div key={name} className="flex items-center justify-between animate-slide-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                        <div className="flex items-center gap-3">
                            <div className={`font-black w-6 h-6 flex items-center justify-center text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${idx===0 ? 'bg-[#3B82F6] text-white' : 'bg-white'}`}>
                                {idx + 1}
                            </div>
                            <span className="font-bold text-lg uppercase truncate max-w-[140px] tracking-tight">{name}</span>
                        </div>
                        <div className="text-[10px] font-bold bg-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{count} Classes</div>
                    </div>
                ))}
             </div>
          </div>

          {/* PIE CHART SECTION */}
          <div className="grid grid-cols-2 border-b-4 border-black flex-grow">
              
              {/* TIME OF DAY PIE CHART */}
              <div className="p-4 border-r-4 border-black flex flex-col items-center justify-center bg-white">
                 <div className="text-[10px] font-black uppercase tracking-wider mb-3 self-start w-full border-b-2 border-gray-100 pb-1">Time of Day</div>
                 <div className="scale-110 mb-2 animate-spin-slow-enter">
                   <PieChart data={stats.timeData} />
                 </div>
                 <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
                    {stats.timeData.map(d => (
                        <div key={d.name} className="flex items-center gap-1">
                            <div className="w-2 h-2 border border-black" style={{backgroundColor: d.color}}></div>
                            <span className="text-[8px] font-bold uppercase">{d.name}</span>
                        </div>
                    ))}
                 </div>
              </div>

              {/* CLASS TYPES */}
              <div className="p-4 flex flex-col bg-[#EFF6FF]">
                 <div className="text-[10px] font-black uppercase tracking-wider mb-3 border-b-2 border-gray-200 pb-1">Format Split</div>
                 <div className="space-y-2 flex-grow overflow-y-auto custom-scrollbar">
                     {Object.entries(stats.typeCounts).sort(([,a], [,b]) => b - a).map(([type, count], idx) => (
                         <div key={type} className="flex flex-col animate-grow-width" style={{animationDelay: `${0.3 + (idx * 0.1)}s`}}>
                             <div className="flex justify-between text-[9px] font-bold uppercase mb-0.5">
                                 <span>{type}</span>
                                 <span>{Math.round((count/stats.totalClasses)*100)}%</span>
                             </div>
                             <div className="w-full h-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
                                 <div className="h-full bg-[#3B82F6] animate-fill-bar" style={{width: `${(count/stats.totalClasses)*100}%`}}></div>
                             </div>
                         </div>
                     ))}
                 </div>
              </div>
          </div>

          {/* MONTHLY GRAPH */}
          <div className="p-5 bg-white h-32 relative">
             <div className="text-[10px] font-black uppercase tracking-wider mb-2 absolute top-3 left-5">Consistency (2025)</div>
             <div className="flex items-end justify-between h-full pt-6 gap-1">
                 {stats.monthlyActivity.map((count, i) => {
                     const max = Math.max(...stats.monthlyActivity);
                     const height = max > 0 ? (count / max) * 100 : 0;
                     return (
                         <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                             {count > 0 && (
                                <div className="text-[6px] font-black mb-0.5 animate-fade-in-up" style={{animationDelay: `${0.5 + (i * 0.05)}s`}}>
                                    {count}
                                </div>
                             )}
                             <div 
                                className={`w-full border-2 border-black min-h-[2px] transition-all hover:bg-black ${count > 0 ? 'bg-[#3B82F6]' : 'bg-gray-100'}`} 
                                style={{height: `${Math.max(height, 2)}%`}}
                             >
                             </div>
                             <div className="text-[6px] font-bold mt-1 text-gray-400">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</div>
                         </div>
                     )
                 })}
             </div>
          </div>

          {/* FOOTER */}
          <div className="p-3 bg-black text-white text-center flex flex-col gap-1 border-t-4 border-black">
              <div className="text-[10px] font-bold uppercase tracking-widest">SolidStats.app</div>
              <div className="text-[8px] text-gray-400 uppercase leading-tight px-4">
                  Fan project. Not affiliated with Solidcore.
              </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
            <BrutalButton 
              variant="primary" 
              icon={isSharing ? Loader2 : Share2} 
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 text-sm w-full"
            >
              {isSharing ? 'Generating...' : 'Share Story'}
            </BrutalButton>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Dashboard / Table */}
      <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black italic uppercase">The<br/>Receipts</h2>
            <BrutalButton variant="secondary" onClick={() => setView('landing')} className="text-xs px-3 py-2">
            Reset
            </BrutalButton>
          </div>

          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
              <BrutalCard className="bg-[#BFDBFE]">
                  <div className="text-xs font-bold uppercase opacity-60 mb-1">Top Studio</div>
                  <div className="text-xl font-black truncate leading-tight">{stats.topLocation}</div>
                  <div className="mt-3 text-[10px] font-bold border-t-2 border-black pt-2 inline-flex items-center gap-1">
                      <MapPin size={10}/> Most Visited
                  </div>
              </BrutalCard>
              <BrutalCard className="bg-[#FCA5A5] !border-black">
                  <div className="text-xs font-bold uppercase opacity-60 mb-1">Longest Streak</div>
                  <div className="text-2xl font-black leading-tight">{stats.maxStreak} Days</div>
                  <div className="mt-3 text-[10px] font-bold border-t-2 border-black pt-2 inline-flex items-center gap-1">
                      <Flame size={10}/> Ouch
                  </div>
              </BrutalCard>
          </div>

          {/* Raw Data Receipt */}
          <ReceiptCard title="Transaction History">
            <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                <tr className="border-b-4 border-dashed border-black">
                    <th className="p-2 font-black uppercase text-[10px] bg-white">Date</th>
                    <th className="p-2 font-black uppercase text-[10px] bg-white">Item</th>
                    <th className="p-2 font-black uppercase text-[10px] bg-white">Coach</th>
                    <th className="p-2 font-black uppercase text-[10px] bg-white text-right">Loc</th>
                </tr>
                </thead>
                <tbody className="font-mono text-[10px] uppercase">
                {REAL_DATA.map((row, i) => (
                    <tr key={i} className="border-b border-dashed border-gray-300 hover:bg-gray-50 transition-colors">
                    <td className="p-2 font-bold">{row.date.slice(0, 5)}</td>
                    <td className="p-2 whitespace-nowrap">{row.type.replace('50','')}</td>
                    <td className="p-2 truncate max-w-[80px]">{row.instructor.split('-')[0]}</td>
                    <td className="p-2 truncate max-w-[80px] text-right">{row.location.replace('MA, ','').replace('NY, ','')}</td>
                    </tr>
                ))}
                </tbody>
                <tfoot className="border-t-4 border-dashed border-black">
                   <tr>
                       <td colSpan={4} className="p-3 text-center text-[10px] font-bold">
                           TOTAL ITEMS: {stats.totalClasses}
                       </td>
                   </tr>
                </tfoot>
            </table>
            </div>
          </ReceiptCard>
      </div>
      
      {/* CSS Styles for Animations & Backgrounds */}
      <style>{`
        .bg-dot-pattern {
            background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
            background-size: 20px 20px;
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scale-in {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
            animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes slide-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up {
            animation: slide-in-up 0.4s ease-out forwards;
            opacity: 0; /* Starts hidden */
        }
        @keyframes fill-bar {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }
        .animate-fill-bar {
            animation: fill-bar 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes spin-enter {
            from { transform: rotate(-90deg) scale(0); opacity: 0; }
            to { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        .animate-spin-slow-enter {
            animation: spin-enter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] bg-dot-pattern text-black font-sans selection:bg-[#3B82F6] selection:text-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b-4 border-black bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter flex items-center gap-2">
            <div className="w-6 h-6 bg-[#3B82F6] border-2 border-black"></div>
            CORE.WRAPPED
          </div>
          <div className="flex gap-6">
             <button onClick={() => setActiveModal('about')} className="font-bold hover:underline decoration-2 text-sm uppercase">About</button>
             <button onClick={() => setActiveModal('privacy')} className="font-bold hover:underline decoration-2 text-sm uppercase">Privacy</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-8 flex-grow">
        {view === 'landing' && <LandingView />}
        {view === 'processing' && <ProcessingView />}
        {view === 'results' && stats && <ResultsView />}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white p-8 mt-12 border-t-4 border-black">
         <div className="max-w-4xl mx-auto text-center">
            <p className="font-black uppercase text-lg mb-2">Disclaimer</p>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
              This is an unofficial fan project and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Solidcore, Mindbody, or any of their subsidiaries or its affiliates. All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
            </p>
         </div>
      </footer>

      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'about'} 
        onClose={() => setActiveModal(null)} 
        title="About Project"
      >
         <p className="mb-4 font-bold text-lg">Built for the shaking community.</p>
         <p className="mb-4 text-gray-700">
           SolidStats is a fun, fan-made tool designed to help you visualize your year in workouts. 
           Whether you're hitting [solidcore] once a week or every day, you deserve to see your progress in style.
         </p>
         <p className="text-gray-700">
           This tool works by parsing the PDF schedule export from the Mindbody website. It calculates your top stats locally in your browser and generates a shareable image for your socials.
         </p>
         <div className="mt-6 pt-4 border-t-2 border-gray-200">
           <a href="#" className="inline-flex items-center font-bold text-blue-600 hover:underline">
             <Github className="w-4 h-4 mr-2"/> View Source Code
           </a>
         </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)} 
        title="Privacy Policy"
      >
         <div className="flex items-center gap-3 mb-6 bg-blue-50 p-4 border-2 border-blue-200">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="font-bold text-blue-800">100% Client-Side Processing</h4>
              <p className="text-xs text-blue-600 font-bold">Your data never leaves your device.</p>
            </div>
         </div>
         
         <p className="mb-4 text-gray-700">
           <strong>We do not store your data.</strong> When you upload your PDF, it is read by JavaScript running directly in your web browser. 
           It is never uploaded to any server, database, or cloud storage.
         </p>
         <p className="mb-4 text-gray-700">
           Once you close this tab or refresh the page, all data is permanently wiped from your browser's memory.
         </p>
         <p className="text-gray-700 text-sm">
           <strong>Note:</strong> Because we don't store data, we cannot "recover" your stats later. You will need to re-upload your PDF if you want to view your stats again.
         </p>
      </Modal>

      <Modal
        isOpen={activeModal === 'howto'}
        onClose={() => setActiveModal(null)}
        title="Get Your Stats"
      >
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">1</div>
                <div>
                    <p className="font-bold mb-1">Log in to Mindbody</p>
                    <p className="text-sm text-gray-600 mb-2">Go to the schedule page on the desktop website (not the app).</p>
                    <a 
                        href="https://www.mindbodyonline.com/explore/account/schedule" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-sm font-bold text-white bg-[#3B82F6] px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Open Mindbody <ExternalLink size={14} className="ml-2"/>
                    </a>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">2</div>
                <div>
                    <p className="font-bold mb-1">Find your history</p>
                    <p className="text-sm text-gray-600">
                        Click the <span className="font-bold bg-gray-200 px-1">Schedule</span> tab, then click <span className="font-bold bg-gray-200 px-1">Completed</span>.
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">3</div>
                <div>
                    <p className="font-bold mb-1">Load 2025 classes</p>
                    <p className="text-sm text-gray-600">
                        Scroll to the bottom and click <span className="font-bold bg-gray-200 px-1">View More</span> repeatedly until you see classes from January 2025.
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">4</div>
                <div>
                    <p className="font-bold mb-1">Print to PDF</p>
                    <p className="text-sm text-gray-600">
                        Right click anywhere and select <strong>Print</strong>. Change the destination printer to <strong>"Save as PDF"</strong> and save the file.
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">5</div>
                <div>
                    <p className="font-bold mb-1">Upload here</p>
                    <p className="text-sm text-gray-600">
                        Come back to this page and upload that PDF file to see your stats!
                    </p>
                </div>
            </div>
        </div>
      </Modal>

    </div>
  );
};

export default App;