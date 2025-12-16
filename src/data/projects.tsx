import React, { ReactNode } from "react";
import AceTernityLogo from "@/components/logos/aceternity";
import SlideShow from "@/components/slide-show";
import { Button } from "@/components/ui/button";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { RiNextjsFill, RiNodejsFill, RiReactjsFill } from "react-icons/ri";
import {
  SiChakraui,
  SiDocker,
  SiExpress,
  SiFirebase,
  SiJavascript,
  SiMongodb,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReactquery,
  SiSanity,
  SiShadcnui,
  SiSocketdotio,
  SiSupabase,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVuedotjs,
  SiTensorflow,
  SiOpencv,
  SiFlutter,
  SiDart,
  SiGooglemaps,
  SiRadixui,
  SiLeaflet,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { TbBrandFramerMotion } from "react-icons/tb";
const BASE_PATH = "/assets/projects-screenshots";

const ProjectsLinks = ({ repo }: { repo?: string }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-start gap-3 my-3 mb-8">
      {repo && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={repo}
        >
          <Button variant={"default"} size={"sm"}>
            Github
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export type Skill = {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
};
const PROJECT_SKILLS = {
  next: {
    title: "Next.js",
    bg: "black",
    fg: "white",
    icon: <RiNextjsFill />,
  },
  chakra: {
    title: "Chakra UI",
    bg: "black",
    fg: "white",
    icon: <SiChakraui />,
  },
  node: {
    title: "Node.js",
    bg: "black",
    fg: "white",
    icon: <RiNodejsFill />,
  },
  python: {
    title: "Python",
    bg: "black",
    fg: "white",
    icon: <SiPython />,
  },
  prisma: {
    title: "prisma",
    bg: "black",
    fg: "white",
    icon: <SiPrisma />,
  },
  postgres: {
    title: "PostgreSQL",
    bg: "black",
    fg: "white",
    icon: <SiPostgresql />,
  },
  mongo: {
    title: "MongoDB",
    bg: "black",
    fg: "white",
    icon: <SiMongodb />,
  },
  express: {
    title: "Express",
    bg: "black",
    fg: "white",
    icon: <SiExpress />,
  },
  reactQuery: {
    title: "React Query",
    bg: "black",
    fg: "white",
    icon: <SiReactquery />,
  },
  shadcn: {
    title: "ShanCN UI",
    bg: "black",
    fg: "white",
    icon: <SiShadcnui />,
  },
  aceternity: {
    title: "Aceternity",
    bg: "black",
    fg: "white",
    icon: <AceTernityLogo />,
  },
  tailwind: {
    title: "Tailwind",
    bg: "black",
    fg: "white",
    icon: <SiTailwindcss />,
  },
  docker: {
    title: "Docker",
    bg: "black",
    fg: "white",
    icon: <SiDocker />,
  },
  yjs: {
    title: "Y.js",
    bg: "black",
    fg: "white",
    icon: (
      <span>
        <strong>Y</strong>js
      </span>
    ),
  },
  firebase: {
    title: "Firebase",
    bg: "black",
    fg: "white",
    icon: <SiFirebase />,
  },
  sockerio: {
    title: "Socket.io",
    bg: "black",
    fg: "white",
    icon: <SiSocketdotio />,
  },
  js: {
    title: "JavaScript",
    bg: "black",
    fg: "white",
    icon: <SiJavascript />,
  },
  ts: {
    title: "TypeScript",
    bg: "black",
    fg: "white",
    icon: <SiTypescript />,
  },
  vue: {
    title: "Vue.js",
    bg: "black",
    fg: "white",
    icon: <SiVuedotjs />,
  },
  react: {
    title: "React.js",
    bg: "black",
    fg: "white",
    icon: <RiReactjsFill />,
  },
  sanity: {
    title: "Sanity",
    bg: "black",
    fg: "white",
    icon: <SiSanity />,
  },
  spline: {
    title: "Spline",
    bg: "black",
    fg: "white",
    icon: <SiThreedotjs />,
  },
  gsap: {
    title: "GSAP",
    bg: "black",
    fg: "white",
    icon: "",
  },
  framerMotion: {
    title: "Framer Motion",
    bg: "black",
    fg: "white",
    icon: <TbBrandFramerMotion />,
  },
  supabase: {
    title: "Supabase",
    bg: "black",
    fg: "white",
    icon: <SiSupabase />,
  },
  tensorflow: {
    title: "TensorFlow",
    bg: "black",
    fg: "white",
    icon: <SiTensorflow />,
  },
  opencv: {
    title: "OpenCV",
    bg: "black",
    fg: "white",
    icon: <SiOpencv />,
  },
  flutter: {
    title: "Flutter",
    bg: "black",
    fg: "white",
    icon: <SiFlutter />,
  },
  dart: {
    title: "Dart",
    bg: "black",
    fg: "white",
    icon: <SiDart />,
  },
  googlemaps: {
    title: "Google Maps API",
    bg: "black",
    fg: "white",
    icon: <SiGooglemaps />,
  },
  java: {
    title: "Java",
    bg: "black",
    fg: "white",
    icon: <FaJava />,
  },
  radix: {
    title: "Radix UI",
    bg: "black",
    fg: "white",
    icon: <SiRadixui />,
  },
  leaflet: {
    title: "Leaflet",
    bg: "black",
    fg: "white",
    icon: <SiLeaflet />,
  },
};
export type Project = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  skills: { frontend: Skill[]; backend: Skill[]; model?: Skill[] };
  content: React.ReactNode | any;
  github?: string;
  live: string;
};
const projects: Project[] = [
  {
    id: "campus-explorer",
    category: "Mobile Application",
    title: "Campus Explorer",
    src: "/assets/projects-screenshots/CampusExplorer/Thumbnail.png",
    screenshots: [
      "CampusExplorer/landing_page.png",
      "CampusExplorer/login_page.png",
      "CampusExplorer/home_page.png",
      "CampusExplorer/map_interface.png",
      "CampusExplorer/select_location.png",
      "CampusExplorer/quick_finds.png",
      "CampusExplorer/profile_creation.png",
      "CampusExplorer/profile_section.png",
      "CampusExplorer/settings_page.png"
    ],
    skills: {
      frontend: [
        PROJECT_SKILLS.flutter,
        PROJECT_SKILLS.dart,
        PROJECT_SKILLS.googlemaps,
      ],
      backend: [
        PROJECT_SKILLS.java,
        PROJECT_SKILLS.firebase,
      ],
    },
    live: "#",
    github: "https://github.com/Abhijit-cmd/Campus-Explorer",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono ">
            Campus Explorer is a mobile application built using Flutter SDK and Dart to streamline navigation across university campuses. Developed as part of a Capstone Project at Presidency University, the app aims to enhance the campus experience for students, faculty, and visitors by integrating real-time directions, voice guidance, and campus resource information into a single, easy-to-use platform.
          </TypographyP>
          <ProjectsLinks repo={this.github} />
          <p className="font-mono mb-2 mt-4">
            Campus Explorer simplifies navigation of large university campuses, providing an intuitive and accessible solution to campus navigation challenges for new students and individuals with disabilities.
          </p>
          <SlideShow images={[`${BASE_PATH}/CampusExplorer/landing_page.png`]} />
          <TypographyH3 className="my-4 mt-8">Authentication & Onboarding</TypographyH3>
          <p className="font-mono mb-2">
            Secure login system with user authentication powered by Firebase. New users can create personalized profiles to customize their campus navigation experience.
          </p>
          <SlideShow images={[`${BASE_PATH}/CampusExplorer/login_page.png`, `${BASE_PATH}/CampusExplorer/profile_creation.png`]} />
          <TypographyH3 className="my-4 mt-8">Interactive Campus Maps</TypographyH3>
          <p className="font-mono mb-2">
            Real-time interactive maps powered by Google Maps API allow users to zoom, pan, and explore buildings and landmarks within the campus with ease. The app provides turn-by-turn directions with real-time GPS tracking.
          </p>
          <SlideShow images={[`${BASE_PATH}/CampusExplorer/home_page.png`, `${BASE_PATH}/CampusExplorer/map_interface.png`]} />
          <TypographyH3 className="my-4 mt-8">Smart Navigation & Quick Finds</TypographyH3>
          <p className="font-mono mb-2">
            Select your destination from a comprehensive list of campus locations. The app offers voice-guided navigation for hands-free, accessible directions to any building, department, or amenity on campus.
          </p>
          <SlideShow images={[`${BASE_PATH}/CampusExplorer/select_location.png`, `${BASE_PATH}/CampusExplorer/quick_finds.png`]} />
          <TypographyH3 className="my-4 mt-8">Key Features</TypographyH3>
          <ul className="list-disc ml-6">
            <li className="font-mono mb-2"><strong>Real-time Interactive Maps:</strong> Zoom, pan, and explore campus buildings and landmarks</li>
            <li className="font-mono mb-2"><strong>Voice-Guided Directions:</strong> Hands-free navigation with voice assistance for improved accessibility</li>
            <li className="font-mono mb-2"><strong>Personalized Recommendations:</strong> Save favorite locations and track frequently visited spots</li>
            <li className="font-mono mb-2"><strong>Campus Resources:</strong> Access campus events, departments, and amenities in one place</li>
            <li className="font-mono mb-2"><strong>Secure Authentication:</strong> User data protected through Firebase authentication</li>
          </ul>
          <SlideShow images={[`${BASE_PATH}/CampusExplorer/profile_section.png`, `${BASE_PATH}/CampusExplorer/settings_page.png`]} />
          <p className="font-mono mb-2 mt-8">
            Campus Explorer was developed as a Capstone Project at Presidency University to address the real-world challenge of campus navigation, making university life easier for everyone.
          </p>
        </div>
      );
    },
  },
  {
    id: "sign-language-translator",
    category: "AI/ML Application",
    title: "Sign Language Translator",
    src: "/assets/projects-screenshots/Signlanguage translator/landing.jpeg",
    screenshots: [
      "Signlanguage translator/landing.jpeg",
      "Signlanguage translator/about.jpeg",
      "Signlanguage translator/howtouse.jpeg",
      "Signlanguage translator/languageselection.jpeg",
      "Signlanguage translator/model.jpeg",
      "Signlanguage translator/working.jpeg"
    ],
    live: "#",
    github: "https://github.com/Abhijit-cmd/Sign-Language-Translator",
    skills: {
      frontend: [
        PROJECT_SKILLS.ts,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.tailwind,
      ],
      model: [
        PROJECT_SKILLS.tensorflow,
        PROJECT_SKILLS.opencv,
      ],
      backend: [
        PROJECT_SKILLS.python,
      ],
    },
    get content(): JSX.Element {
      return (
        <div>
          <TypographyP className="font-mono ">
            Sign Language Translator is a deep learning-powered application that translates American Sign Language (ASL) gestures into text using a trained neural network model. Built with Python, TensorFlow/Keras, and OpenCV, this tool aims to improve communication for the hearing and speech impaired by recognizing hand gestures in real-time.
          </TypographyP>
          <ProjectsLinks repo={this.github} />
          <p className="font-mono mb-2 mt-4">
            The Sign Language Translator processes real-time webcam input to recognize 26 ASL alphabet gestures and converts them into corresponding English letters, enabling users to communicate without speech.
          </p>
          <SlideShow images={[`${BASE_PATH}/Signlanguage translator/landing.jpeg`]} />
          <TypographyH3 className="my-4 mt-8">About the Project</TypographyH3>
          <p className="font-mono mb-2">
            This project leverages cutting-edge machine learning techniques to bridge communication gaps. The model is trained on thousands of ASL gesture images to accurately recognize and translate hand signs into readable text.
          </p>
          <SlideShow images={[`${BASE_PATH}/Signlanguage translator/about.jpeg`]} />
          <TypographyH3 className="my-4 mt-8">How to Use</TypographyH3>
          <p className="font-mono mb-2">
            Simply allow camera access, position your hand in front of the webcam, and perform ASL gestures. The application will instantly recognize and display the corresponding letter on screen.
          </p>
          <SlideShow images={[`${BASE_PATH}/Signlanguage translator/howtouse.jpeg`]} />
          <TypographyH3 className="my-4 mt-8">Language Selection & Model</TypographyH3>
          <p className="font-mono mb-2">
            Choose from multiple sign language systems and customize your translation experience. The interface supports various regional sign language variations. The deep learning model is trained on thousands of ASL gesture images to accurately recognize and translate hand signs.
          </p>
          <SlideShow images={[`${BASE_PATH}/Signlanguage translator/languageselection.jpeg`, `${BASE_PATH}/Signlanguage translator/model.jpeg`]} />
          <TypographyH3 className="my-4 mt-8">Real-Time Recognition</TypographyH3>
          <p className="font-mono mb-2">
            Watch the magic happen as the application processes your gestures in real-time. The neural network analyzes hand positions, shapes, and movements to accurately identify each letter of the ASL alphabet.
          </p>
          <SlideShow images={[`${BASE_PATH}/Signlanguage translator/working.jpeg`]} />
          <p className="font-mono mb-2 mt-8">
            This project demonstrates the power of AI in breaking down communication barriers and making technology more accessible for everyone. It&apos;s not just code—it&apos;s about creating meaningful impact.
          </p>
        </div>
      );
    },
  },
  {
    id: "weatherly",
    category: "Weather Application",
    title: "Weatherly",
    src: "/assets/projects-screenshots/Weatherly/Design.png",
    screenshots: [
      "Weatherly/Design.png",
      "Weatherly/landing page in dark bg.png",
      "Weatherly/landing page in light bg.png"
    ],
    live: "#",
    github: "#",
    skills: {
      frontend: [
        PROJECT_SKILLS.ts,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.tailwind,
        PROJECT_SKILLS.radix,
        PROJECT_SKILLS.leaflet,
      ],
      backend: [],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono ">
            Weatherly is a comprehensive weather application that provides real-time updates, forecasts, and detailed weather metrics. Built with modern web technologies to deliver a seamless and engaging user experience with accessibility at its core.
          </TypographyP>
          <ProjectsLinks repo={this.github} />
          <p className="font-mono mb-2 mt-4">
            Stay informed with accurate weather data, air quality monitoring, UV index tracking, and interactive maps—all in a beautiful, responsive interface that adapts to your preferences.
          </p>
          <SlideShow images={[`${BASE_PATH}/Weatherly/Design.png`]} />
          <TypographyH3 className="my-4 mt-8">Key Features</TypographyH3>
          <ul className="list-disc ml-6">
            <li className="font-mono mb-2"><strong>Real-time Weather Updates:</strong> Get current weather conditions and accurate forecasts</li>
            <li className="font-mono mb-2"><strong>Detailed Metrics:</strong> Temperature, humidity, wind speed, and atmospheric pressure</li>
            <li className="font-mono mb-2"><strong>Air Quality & UV Index:</strong> Monitor air quality levels and UV radiation</li>
            <li className="font-mono mb-2"><strong>Interactive Maps:</strong> Visualize weather patterns with React Leaflet integration</li>
            <li className="font-mono mb-2"><strong>Theme Support:</strong> Switch between light and dark modes seamlessly</li>
            <li className="font-mono mb-2"><strong>Multi-language Support:</strong> Access weather data in your preferred language</li>
            <li className="font-mono mb-2"><strong>Responsive Design:</strong> Optimized for all devices and screen sizes</li>
            <li className="font-mono mb-2"><strong>Accessibility-Focused:</strong> Built with comprehensive accessibility features</li>
          </ul>
          <TypographyH3 className="my-4 mt-8">Light & Dark Themes</TypographyH3>
          <p className="font-mono mb-2">
            Weatherly features a beautiful theme system powered by next-themes, allowing users to switch between light and dark modes based on their preference or system settings.
          </p>
          <SlideShow
            images={[
              `${BASE_PATH}/Weatherly/landing page in light bg.png`,
              `${BASE_PATH}/Weatherly/landing page in dark bg.png`,
            ]}
          />
          <TypographyH3 className="my-4 mt-8">Tech Stack</TypographyH3>
          <ul className="list-disc ml-6">
            <li className="font-mono mb-2"><strong>Frontend:</strong> Next.js, React, TypeScript, Tailwind CSS</li>
            <li className="font-mono mb-2"><strong>UI Components:</strong> Radix UI for accessible, unstyled components</li>
            <li className="font-mono mb-2"><strong>Icons:</strong> Lucide React for beautiful, consistent icons</li>
            <li className="font-mono mb-2"><strong>Charts:</strong> Recharts for composable data visualization</li>
            <li className="font-mono mb-2"><strong>Maps:</strong> React Leaflet for interactive weather maps</li>
            <li className="font-mono mb-2"><strong>API:</strong> OpenWeather API for accurate weather data</li>
            <li className="font-mono mb-2"><strong>Error Handling:</strong> React Error Boundary for robust error management</li>
          </ul>
          <p className="font-mono mb-2 mt-8">
            Weatherly demonstrates modern web development practices with a focus on performance, accessibility, and user experience. The application is optimized for all devices and provides accurate weather information in an intuitive, visually appealing interface.
          </p>
        </div>
      );
    },
  },
  {
    id: "portfolio",
    category: "Portfolio",
    title: "My Portfolio",
    src: "/assets/projects-screenshots/portfolio/landing.png",
    screenshots: ["portfolio/1.png"],
    live: "#",
    github:"#",
    skills: {
      frontend: [
        PROJECT_SKILLS.ts,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.shadcn,
        PROJECT_SKILLS.aceternity,
        PROJECT_SKILLS.framerMotion,
        PROJECT_SKILLS.tailwind,
        PROJECT_SKILLS.spline,
      ],
      backend: [],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono ">
            Welcome to my digital playground, where creativity meets code in the
            dopest way possible.
          </TypographyP>
          <ProjectsLinks repo={this.github} />
          <TypographyH3 className="my-4 mt-8">
            Beautiful 3D Objects{" "}
          </TypographyH3>
          <p className="font-mono mb-2">
            Did you see that 3D keyboard modal? Yeah! I made that. That
            interactive keyboard is being rendered in 3D on a webpage 🤯, and
            pressing each keycap reveals a skill in a goofy way. It&apos;s like
            typing, but make it art.
          </p>
          <SlideShow
            images={[
              `${BASE_PATH}/portfolio/landing.png`,
              `${BASE_PATH}/portfolio/skills.png`,
            ]}
          />
          <TypographyH3 className="my-4 ">Space Theme</TypographyH3>
          <p className="font-mono mb-2">
            Dark background + floating particles = out-of-this-world cool.
          </p>
          <SlideShow images={[`${BASE_PATH}/portfolio/navbar.png`]} />
          <TypographyH3 className="my-4 mt-8">Projects</TypographyH3>

          <p className="font-mono mb-2">
            My top personal and freelance projects — no filler, all killer.
          </p>
          <SlideShow
            images={[
              `${BASE_PATH}/portfolio/projects.png`,
              `${BASE_PATH}/portfolio/project.png`,
            ]}
          />
          <p className="font-mono mb-2 mt-8 text-center">
            This site&apos;s not just a portfolio — it&apos;s a whole vibe.
          </p>
        </div>
      );
    },
  },
  {
    id: "ghostchat",
    category: "Anonymous chat",
    title: "GhostChat",
    src: "/assets/projects-screenshots/ghostchat/1.png",
    screenshots: [
      "ghostchat/1.png",
      "ghostchat/2.png",
      "ghostchat/3.png",
      "ghostchat/4.png"
    ],
    live: "#",
    github:"#",
    skills: {
      frontend: [PROJECT_SKILLS.js, PROJECT_SKILLS.next, PROJECT_SKILLS.chakra],
      backend: [PROJECT_SKILLS.supabase],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono ">
            Ghostchat is your go-to spot for sending anonymous messages without
            leaving a trace. Powered by Supabase, it&apos;s all about keeping things
            low-key and secure. Whether you&apos;re sharing secrets, giving feedback,
            or just having some fun, Ghostchat ensures your identity stays
            hidden, while your voice is heard. Say what you want, without the
            worry.
          </TypographyP>
          <ProjectsLinks repo={this.github} />
          <SlideShow
            images={[
              `${BASE_PATH}/ghostchat/1.png`,
              `${BASE_PATH}/ghostchat/2.png`,
              `${BASE_PATH}/ghostchat/3.png`,
              `${BASE_PATH}/ghostchat/4.png`,
            ]}
          />
        </div>
      );
    },
  },
  {
    id: "demo-ai",
    category: "AI Voice Assistant",
    title: "Demo AI",
    src: "/assets/projects-screenshots/Demoaibot/Thumbnail.png",
    screenshots: [
      "Demoaibot/Thumbnail.png",
      "Demoaibot/logo.png",
      "Demoaibot/vsign-150w.png"
    ],
    live: "#",
    github: "#",
    skills: {
      frontend: [
        PROJECT_SKILLS.python,
      ],
      model: [
        PROJECT_SKILLS.tensorflow,
        PROJECT_SKILLS.opencv,
      ],
      backend: [
        PROJECT_SKILLS.python,
      ],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono ">
            DEMO AI (Waifu) is an AI-powered voice assistant that combines the charm of anime VTuber characters with cutting-edge AI technologies. This project creates an engaging, real-time interactive experience where you can converse with your desired character without requiring powerful hardware.
          </TypographyP>
          <ProjectsLinks repo={this.github} />
          <p className="font-mono mb-2 mt-4">
            Experience the future of AI interaction with a virtual character that listens, responds, and even lip-syncs while talking—all powered by advanced speech recognition, natural language processing, and text-to-speech technologies.
          </p>
          <SlideShow images={[`${BASE_PATH}/Demoaibot/Thumbnail.png`]} />
          <TypographyH3 className="my-4 mt-8">Key Features</TypographyH3>
          <ul className="list-disc ml-6">
            <li className="font-mono mb-2"><strong>Voice Interaction:</strong> Speak to your AI assistant and get instant responses with multiple speech recognition options</li>
            <li className="font-mono mb-2"><strong>AI Chatbot Integration:</strong> Powered by OpenAI&apos;s GPT-3.5-turbo for engaging, dynamic conversations</li>
            <li className="font-mono mb-2"><strong>Text-to-Speech:</strong> Hear responses with natural-sounding voices using Google TTS or ElevenLabs</li>
            <li className="font-mono mb-2"><strong>VTube Studio Integration:</strong> Seamless connection with VTube Studio for lifelike visual interactions</li>
            <li className="font-mono mb-2"><strong>Lip Sync Animation:</strong> Character mouth movements synchronized with speech</li>
            <li className="font-mono mb-2"><strong>Memory System:</strong> Remembers previous conversations for contextual interactions</li>
            <li className="font-mono mb-2"><strong>Customizable Personality:</strong> Configure character behavior and personality traits</li>
          </ul>
          <SlideShow images={[`${BASE_PATH}/Demoaibot/logo.png`, `${BASE_PATH}/Demoaibot/vsign-150w.png`]} />
          <TypographyH3 className="my-4 mt-8">Speech Recognition Options</TypographyH3>
          <ul className="list-disc ml-6">
            <li className="font-mono mb-2"><strong>OpenAI Whisper:</strong> Premium speech recognition with high accuracy</li>
            <li className="font-mono mb-2"><strong>Google Speech Recognition:</strong> Free alternative for voice input</li>
            <li className="font-mono mb-2"><strong>Console Mode:</strong> Type prompts directly if you prefer keyboard input</li>
          </ul>
          <TypographyH3 className="my-4 mt-8">Text-to-Speech Options</TypographyH3>
          <ul className="list-disc ml-6">
            <li className="font-mono mb-2"><strong>Google TTS:</strong> Free and simple text-to-speech solution</li>
            <li className="font-mono mb-2"><strong>ElevenLabs:</strong> Premium quality with a wide variety of natural voices</li>
            <li className="font-mono mb-2"><strong>Console Output:</strong> Text-only responses for testing</li>
          </ul>
          <TypographyH3 className="my-4 mt-8">Technologies Used</TypographyH3>
          <ul className="list-disc ml-6">
            <li className="font-mono mb-2"><strong>Python:</strong> Core programming language</li>
            <li className="font-mono mb-2"><strong>OpenAI GPT-3.5-turbo:</strong> Natural language processing and conversation</li>
            <li className="font-mono mb-2"><strong>OpenAI Whisper:</strong> Advanced speech recognition</li>
            <li className="font-mono mb-2"><strong>Google Speech Recognition:</strong> Alternative voice input</li>
            <li className="font-mono mb-2"><strong>Google TTS / ElevenLabs:</strong> Text-to-speech synthesis</li>
            <li className="font-mono mb-2"><strong>VTube Studio API:</strong> Character animation and lip sync</li>
            <li className="font-mono mb-2"><strong>TensorFlow/OpenCV:</strong> Computer vision and model processing</li>
          </ul>
          <p className="font-mono mb-2 mt-8">
            DEMO AI represents the convergence of AI, voice technology, and virtual character animation, creating an immersive experience that brings anime characters to life through intelligent conversation and realistic visual feedback.
          </p>
        </div>
      );
    },
  },
];
export default projects;
