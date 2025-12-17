"use client";

import { useInView } from "framer-motion";
import React, { useRef } from "react";
import { Button } from "../ui/button";
import { SiGithub, SiLinkedin, SiDiscord, SiInstagram } from "react-icons/si";
import { Linkedin } from "lucide-react";
import { config } from "@/data/config";
import Link from "next/link";

const BUTTONS = [
  {
    name: "Github",
    href: config.social.github,
    icon: <SiGithub size={"24"} color={"#fff"} />,
  },
  {
    name: "LinkedIn",
    href: config.social.linkedin,
    icon: <SiLinkedin size={"24"} color={"#fff"} />,
  },
  {
    name: "Discord",
    // Changed to use config.social.discord and SiDiscord icon
    href: config.social.discord, 
    icon: <SiDiscord size={"24"} color={"#fff"} />,
  },
  {
    name: "Instagram",
    href: config.social.instagram,
    icon: <SiInstagram size={"24"} color={"#fff"} />,
  },
];

const SocialMediaButtons = () => {
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex gap-2 relative z-20">
      {show &&
        BUTTONS.map((button) => (
          <a 
            href={button.href} 
            key={button.name} 
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${button.name}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 w-10 relative z-20"
          >
            {button.icon}
          </a>
        ))}
    </div>
  );
};

export default SocialMediaButtons;
