"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "../ui/animated-modal";
import { FloatingDock } from "../ui/floating-dock";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import SmoothScroll from "../smooth-scroll";
import projects, { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

const ProjectsSection = () => {
  return (
    <section id="projects" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <Link href={"#projects"}>
        <h2
          className={cn(
            "bg-clip-text text-4xl text-center text-transparent md:text-7xl pt-16",
            "bg-gradient-to-b from-black/80 to-black/50",
            "dark:bg-gradient-to-b dark:from-white/80 dark:to-white/20 dark:bg-opacity-50 mb-16 md:mb-32"
          )}
        >
          Projects
        </h2>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {projects.map((project) => (
          <Modall key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
};
const Modall = ({ project }: { project: Project }) => {
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  
  const nextScreenshot = () => {
    setCurrentScreenshotIndex((prev) => 
      prev === project.screenshots.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevScreenshot = () => {
    setCurrentScreenshotIndex((prev) => 
      prev === 0 ? project.screenshots.length - 1 : prev - 1
    );
  };

  return (
    <div className="flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-transparent flex justify-center group/modal-btn w-full">
          <div
            className="relative w-full max-w-[400px] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
            style={{ aspectRatio: "3/2" }}
          >
            <Image
              className={cn(
                "hover:scale-[1.05] transition-all duration-300",
                project.id === "demo-ai"
                  ? "object-contain bg-zinc-900"
                  : "object-cover",
                project.id === "portfolio" ? "object-top" : "object-center"
              )}
              style={
                project.id === "portfolio"
                  ? { objectPosition: "30% top" }
                  : undefined
              }
              src={project.src}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
            />
            <div className="absolute w-full h-1/2 bottom-0 left-0 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none">
              <div className="flex flex-col h-full items-start justify-end p-4 md:p-6">
                <div className="text-base md:text-lg text-left font-semibold text-white">
                  {project.title}
                </div>
                <div className="text-xs bg-white text-black rounded-lg w-fit px-2 py-1 mt-1">
                  {project.category}
                </div>
              </div>
            </div>
          </div>
        </ModalTrigger>
        <ModalBody className="md:max-w-4xl md:max-h-[80%] overflow-auto">
          <SmoothScroll isInsideModal={true}>
            <ModalContent>
              <ProjectContents 
                project={project} 
                currentScreenshotIndex={currentScreenshotIndex}
                onNextScreenshot={nextScreenshot}
                onPrevScreenshot={prevScreenshot}
              />
            </ModalContent>
          </SmoothScroll>
          <ModalFooter className="gap-4">
            <button className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28 hover:bg-gray-300 dark:hover:bg-gray-900 transition-colors">
              Close
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
};
export default ProjectsSection;

interface ProjectContentsProps {
  project: Project;
  currentScreenshotIndex: number;
  onNextScreenshot: () => void;
  onPrevScreenshot: () => void;
}

const ProjectContents = ({ 
  project, 
  currentScreenshotIndex,
  onNextScreenshot,
  onPrevScreenshot 
}: ProjectContentsProps) => {
  const hasMultipleScreenshots = project.screenshots.length > 1;
  
  return (
    <>
      <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
        {project.title}
      </h4>
      
      {/* Screenshot Navigation */}
      {hasMultipleScreenshots && (
        <div className="relative w-full max-w-2xl mx-auto mb-8 rounded-lg overflow-hidden">
          <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={`${project.src.split(project.screenshots[0])[0]}${project.screenshots[currentScreenshotIndex]}`}
              alt={`${project.title} screenshot ${currentScreenshotIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={onPrevScreenshot}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onNextScreenshot}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            aria-label="Next screenshot"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Screenshot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {project.screenshots.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentScreenshotIndex
                    ? "bg-white w-8"
                    : "bg-white/50"
                )}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Tech Stack */}
      <div className="flex flex-col md:flex-row md:justify-evenly max-w-screen overflow-hidden md:overflow-visible">
        {project.skills.frontend?.length > 0 && (
          <div className="flex flex-row md:flex-col-reverse justify-center items-center gap-2 text-3xl mb-8">
            <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-500">
              Frontend
            </p>
            <FloatingDock items={project.skills.frontend} />
          </div>
        )}
        {project.skills.model && project.skills.model.length > 0 && (
          <div className="flex flex-row md:flex-col-reverse justify-center items-center gap-2 text-3xl mb-8">
            <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-500">
              Model
            </p>
            <FloatingDock items={project.skills.model} />
          </div>
        )}
        {project.skills.backend?.length > 0 && (
          <div className="flex flex-row md:flex-col-reverse justify-center items-center gap-2 text-3xl mb-8">
            <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-500">
              Backend
            </p>
            <FloatingDock items={project.skills.backend} />
          </div>
        )}
      </div>
      
      {/* Project Links */}
      {(project.github || project.live) && (
        <div className="flex gap-4 justify-center mb-8">
          {project.github && project.github !== "#" && (
            <Link
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              View on GitHub
            </Link>
          )}
          {project.live && project.live !== "#" && (
            <Link
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Live Demo
            </Link>
          )}
        </div>
      )}
      
      {/* Project Content */}
      {project.content}
    </>
  );
};
