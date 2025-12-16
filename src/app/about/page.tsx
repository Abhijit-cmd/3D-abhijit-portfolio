"use client";
import React, { useState, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { DiMongodb, DiPostgresql } from "react-icons/di";
import {
  FaCss3,
  FaDocker,
  FaEnvelope,
  FaGit,
  FaGithub,
  FaHtml5,
  FaLinkedin,
  FaNodeJs,
  FaPhone,
} from "react-icons/fa";
import {
  RiFirebaseFill,
  RiTailwindCssFill,
} from "react-icons/ri";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiCplusplus,
  SiC,
  SiTensorflow,
  SiPytorch,
  SiNumpy,
  SiPandas,
  SiGraphql,
  SiFigma,
  SiNextdotjs,
} from "react-icons/si";

// Contact Links Data
const CONTACT_LINKS = [
  {
    name: "Email",
    content: "abhijitdeb063@gmail.com",
    href: "mailto:abhijitdeb063@gmail.com",
    icon: <FaEnvelope />,
  },
  {
    name: "Phone",
    content: "6009144515",
    href: "tel:6009144515",
    icon: <FaPhone />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/abhi-deb/",
    content: "/Abhijit Deb",
    icon: <FaLinkedin />,
  },
  {
    name: "GitHub",
    href: "https://github.com/Abhijit-cmd",
    content: "/Abhijit Deb",
    icon: <FaGithub />,
  },
];

const TOOLS = [
  { name: "JavaScript", icon: <SiJavascript size="40px" color="#f0db4f" /> },
  { name: "TypeScript", icon: <SiTypescript size="40px" color="#007acc" /> },
  { name: "Python", icon: <SiPython size="40px" color="#3776AB" /> },
  { name: "C++", icon: <SiCplusplus size="40px" color="#00599C" /> },
  { name: "C", icon: <SiC size="40px" color="#A8B9CC" /> },
  { name: "HTML", icon: <FaHtml5 size="40px" color="#e34c26" /> },
  { name: "CSS", icon: <FaCss3 size="40px" color="#563d7c" /> },
  { name: "Next.js", icon: <SiNextdotjs size="40px" color="#fff" /> },
  { name: "Node.js", icon: <FaNodeJs size="40px" color="#6cc24a" /> },
  { name: "Docker", icon: <FaDocker size="40px" color="#2496ed" /> },
  { name: "Git", icon: <FaGit size="40px" color="#f05032" /> },
  { name: "GitHub", icon: <FaGithub size="40px" color="#fff" /> },
  { name: "PostgreSQL", icon: <DiPostgresql size="40px" color="#336791" /> },
  { name: "MongoDB", icon: <DiMongodb size="40px" color="#4db33d" /> },
  { name: "Tailwind", icon: <RiTailwindCssFill size="40px" color="#06b6d4" /> },
  { name: "Firebase", icon: <RiFirebaseFill size="40px" color="#FFCA28" /> },
  { name: "TensorFlow", icon: <SiTensorflow size="40px" color="#FF6F00" /> },
  { name: "PyTorch", icon: <SiPytorch size="40px" color="#EE4C2C" /> },
  { name: "NumPy", icon: <SiNumpy size="40px" color="#013243" /> },
  { name: "Pandas", icon: <SiPandas size="40px" color="#150458" /> },
  { name: "GraphQL", icon: <SiGraphql size="40px" color="#E10098" /> },
  { name: "Figma", icon: <SiFigma size="40px" color="#F24E1E" /> },
];

function Page() {
  // Mouse tracking for 3D tilt effect on Profile Card
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 150, damping: 20 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="container mx-auto px-4 md:px-[50px] xl:px-[100px] text-zinc-300 pt-24 pb-24 perspective-2000 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: 3D Tilt Profile Card */}
        {/* Left: 3D Tilt Profile Card - FIXED Z-INDEX */}
        <motion.aside 
          className="lg:col-span-4 xl:col-span-4 flex flex-col gap-6 relative z-0" 
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-8 rounded-[1.8rem] bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 shadow-2xl flex flex-col items-center">
              {/* Profile Image with Float Animation */}
              <motion.div 
                className="relative w-56 h-56 mb-8"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
                <img
                  className="relative w-full h-full object-cover rounded-3xl shadow-2xl border-2 border-zinc-700/50"
                  alt="Abhijit Deb"
                  src="/assets/me.jpg"
                />
              </motion.div>
              
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                  Abhijit Deb
                </h2>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-sm font-semibold text-zinc-300 shadow-inner">
                  Full Stack Developer
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-8"></div>

              <ul className="w-full flex flex-col gap-3">
                {CONTACT_LINKS.map((link, idx) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <a
                      href={link.href}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-all duration-300 group border border-transparent hover:border-zinc-700/50"
                    >
                      <div className="p-2.5 rounded-lg bg-zinc-800 group-hover:bg-blue-600/20 text-zinc-400 group-hover:text-blue-400 transition-all duration-300">
                        {React.cloneElement(link.icon as React.ReactElement, { size: "18px" })}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider group-hover:text-zinc-400">{link.name}</span>
                        <span className="text-sm text-zinc-300 font-medium group-hover:text-white transition-colors">{link.content}</span>
                      </div>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.aside>

        {/* Right Content Area */}
        <main className="lg:col-span-8 xl:col-span-8 flex flex-col gap-10">
          
          {/* About Section - Glassmorphism Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative p-8 md:p-12 rounded-[1.8rem] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50">
              <h1 className="text-4xl md:text-5xl font-bold mb-8 flex items-center gap-4 text-white">
                 <span className="text-4xl animate-bounce">About Me</span>
              </h1>
              <div className="space-y-6 text-lg text-zinc-400 leading-relaxed font-light">
                <p>
                  Hey there! I’m Abhijit the full-stack developer who wrestles bugs at 3 AM, redesigns entire systems out of boredom, and ships “temporary fixes” that somehow become production features.</p>
                <p>
                 I build immersive digital experiences mostly because the real world is too laggy.</p>
                <p>
                  Elegant solutions? Efficient systems? Yeah, that’s just me trying to avoid future me yelling at past me.
                   If you're looking for someone who solves problems, breaks things creatively, and occasionally pretends to be a gamer… congratulations, you found your guy.
                </p>
                <div className="flex flex-wrap gap-3 pt-4">
                  {['If it works,Dont ask why'].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-xs font-mono text-zinc-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tech Stack - 3D Scatter Animation - NO BACKGROUND CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative min-h-[600px] w-full flex flex-col items-center justify-center overflow-visible" // Removed bg/border/backdrop-blur
          >
            <h2 className="absolute top-0 left-0 text-3xl font-bold flex items-center gap-3 text-white z-10 pointer-events-none">
              <span className="text-blue-500">My Galaxy </span>
            </h2>
            <div className="absolute top-0 right-0 text-xs text-zinc-500 z-10 pointer-events-none">
              Trigger the inevitable
            </div>
            
            <TechCosmos tools={TOOLS} />
          </motion.div>

        </main>
      </div>
    </div>
  );
}

// 3D Cosmos/Scatter Component
const TechCosmos = ({ tools }: { tools: typeof TOOLS }) => {
  const [isScattered, setIsScattered] = useState(false);

  // Pre-calculate random positions for the "Galaxy Cloud" effect
  // These positions are static until scattered
  const cloudPositions = useMemo(() => {
    return tools.map(() => ({
      x: (Math.random() - 0.5) * 500, // Spread across width (Increased for larger canvas)
      y: (Math.random() - 0.5) * 400, // Spread across height
      z: (Math.random() - 0.5) * 300, // Depth
      rotation: Math.random() * 360,
    }));
  }, [tools]);

  return (
    <div 
      className="relative w-full h-[600px] flex items-center justify-center perspective-1000 cursor-pointer"
      onClick={() => {
        setIsScattered(!isScattered);
      }}
    >
      <div className="relative w-full h-full transform-style-3d flex items-center justify-center">
        {tools.map((tool, index) => {
          const pos = cloudPositions[index];
          
          return (
            <motion.div
              key={tool.name}
              className="absolute flex items-center justify-center p-3 rounded-xl bg-zinc-900/90 border border-zinc-700/50 shadow-lg backdrop-blur-md group"
              
              // Initial state: Floating Galaxy Cloud
              initial={{ 
                x: pos.x, 
                y: pos.y, 
                z: pos.z, 
                opacity: 0 
              }}
              
              // Animation States
              animate={{ 
                x: isScattered 
                    ? pos.x * 2.5 // Blast outward! (Expand 2.5x)
                    : pos.x,      // Return to Cloud
                y: isScattered 
                    ? pos.y * 2.5 
                    : [pos.y - 15, pos.y + 15, pos.y - 15], // Stronger float when idle
                z: isScattered 
                    ? pos.z * 1.5 
                    : pos.z,
                opacity: 1,
                rotateZ: isScattered ? pos.rotation + 720 : pos.rotation, // Crazy spin on blast
                scale: isScattered ? 1.2 : 1, // Pulse up on blast
              }}
              
              transition={{
                // Blast is snappy (spring), Float is slow (linear loop)
                x: { type: "spring", stiffness: 60, damping: 10 }, // More bounce
                y: isScattered 
                   ? { type: "spring", stiffness: 60, damping: 10 }
                   : { duration: 4 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" }, // Random float speed
                z: { type: "spring", stiffness: 60, damping: 10 },
                opacity: { duration: 0.5 },
                rotateZ: { duration: 1.5, ease: "circOut" },
                scale: { duration: 0.4 }
              }}

              style={{ transformStyle: "preserve-3d" }}
              whileHover={{ scale: 1.8, zIndex: 100, backgroundColor: "#3b82f6" }} // Highlight blue on hover
            >
              <div className="transform transition-transform">
                {tool.icon}
              </div>
              
              {/* Tooltip */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/80 px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none transition-opacity z-50">
                {tool.name}
              </div>
            </motion.div>
          );
        })}
        
        {/* Center Core (The "Sun" or Center of Galaxy) - Clickable Target */}
        <motion.div 
             className="absolute w-12 h-12 bg-white rounded-full blur-md cursor-pointer z-0"
             animate={{ 
               scale: isScattered ? [1, 0.5, 1] : [1, 1.2, 1], 
               opacity: isScattered ? 0.8 : 0.3 
             }}
             transition={{ duration: 1.5, repeat: Infinity }}
        >
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;