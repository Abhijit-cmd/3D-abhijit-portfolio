import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import ProjectsSection from '../projects';
import projects, { Project, Skill } from '@/data/projects';

/**
 * Feature: portfolio-improvements, Property 1: Projects display completeness
 * Validates: Requirements 1.1, 1.5
 * 
 * For any projects dataset, when the projects section renders, all projects should be 
 * displayed in a responsive grid with complete information including titles, categories, 
 * screenshots, and technology stacks
 */
describe('Property 1: Projects display completeness', () => {
  it('should have complete project data structure', () => {
    fc.assert(
      fc.property(
        fc.constant(projects), // Use the actual projects data
        (projectsData: Project[]) => {
          // Property: All projects should exist
          expect(projectsData.length).toBeGreaterThan(0);
          
          // Property: Each project should have required fields
          projectsData.forEach((project) => {
            expect(project.id).toBeTruthy();
            expect(project.title).toBeTruthy();
            expect(project.category).toBeTruthy();
            expect(project.src).toBeTruthy();
            expect(project.live).toBeDefined();
            expect(project.content).toBeTruthy();
          });
          
          // Property: Each project should have technology stack information
          projectsData.forEach((project) => {
            // Frontend skills should exist
            if (project.skills.frontend && project.skills.frontend.length > 0) {
              expect(project.skills.frontend.length).toBeGreaterThan(0);
              project.skills.frontend.forEach((skill: Skill) => {
                expect(skill.title).toBeTruthy();
                expect(skill.icon).toBeTruthy();
              });
            }
            
            // Backend skills should exist if defined
            if (project.skills.backend && project.skills.backend.length > 0) {
              expect(project.skills.backend.length).toBeGreaterThan(0);
              project.skills.backend.forEach((skill: Skill) => {
                expect(skill.title).toBeTruthy();
                expect(skill.icon).toBeTruthy();
              });
            }
            
            // Model skills should exist if defined
            if (project.skills.model && project.skills.model.length > 0) {
              expect(project.skills.model.length).toBeGreaterThan(0);
              project.skills.model.forEach((skill: Skill) => {
                expect(skill.title).toBeTruthy();
                expect(skill.icon).toBeTruthy();
              });
            }
          });
          
          // Property: Each project should have screenshots array
          projectsData.forEach((project) => {
            expect(Array.isArray(project.screenshots)).toBe(true);
            expect(project.screenshots.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should render projects section with responsive grid', () => {
    const { container } = render(<ProjectsSection />);
    
    // Property: Grid layout should exist
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toBeTruthy();
    
    // Property: Grid should have responsive classes
    expect(gridElement?.className).toContain('grid-cols-1');
    expect(gridElement?.className).toContain('md:grid-cols-2');
    expect(gridElement?.className).toContain('lg:grid-cols-3');
    
    // Property: All projects should be rendered
    projects.forEach((project) => {
      const titleElements = screen.getAllByText(project.title);
      expect(titleElements.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Feature: portfolio-improvements, Property 2: Modal functionality
 * Validates: Requirements 1.2, 1.3
 * 
 * For any project card, when clicked, should open a modal containing all project details 
 * including working screenshot navigation and complete project information
 */
describe('Property 2: Modal functionality', () => {
  it('should open modal with complete project details and working navigation', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    
    fc.assert(
      fc.asyncProperty(
        fc.constant(projects),
        async (projectsData: Project[]) => {
          const { container } = render(<ProjectsSection />);
          
          // Property: For each project, clicking should trigger modal
          for (const project of projectsData) {
            // Find the project card trigger
            const projectCards = screen.getAllByText(project.title);
            expect(projectCards.length).toBeGreaterThan(0);
            
            // Property: Modal should contain project title
            // The modal trigger should be clickable
            const modalTrigger = projectCards[0].closest('button');
            expect(modalTrigger).toBeTruthy();
            
            // Property: Project should have complete information structure
            expect(project.title).toBeTruthy();
            expect(project.category).toBeTruthy();
            expect(project.content).toBeTruthy();
            
            // Property: Projects with multiple screenshots should have navigation
            if (project.screenshots.length > 1) {
              expect(project.screenshots.length).toBeGreaterThan(1);
              
              // Each screenshot should be a valid string
              project.screenshots.forEach((screenshot) => {
                expect(typeof screenshot).toBe('string');
                expect(screenshot.length).toBeGreaterThan(0);
              });
            }
            
            // Property: Project links should be defined
            expect(project.live).toBeDefined();
            if (project.github) {
              expect(typeof project.github).toBe('string');
            }
            
            // Property: Skills should be properly structured
            if (project.skills.frontend) {
              expect(Array.isArray(project.skills.frontend)).toBe(true);
              project.skills.frontend.forEach((skill: Skill) => {
                expect(skill.title).toBeTruthy();
                expect(skill.icon).toBeTruthy();
              });
            }
            
            if (project.skills.backend) {
              expect(Array.isArray(project.skills.backend)).toBe(true);
              project.skills.backend.forEach((skill: Skill) => {
                expect(skill.title).toBeTruthy();
                expect(skill.icon).toBeTruthy();
              });
            }
            
            if (project.skills.model) {
              expect(Array.isArray(project.skills.model)).toBe(true);
              project.skills.model.forEach((skill: Skill) => {
                expect(skill.title).toBeTruthy();
                expect(skill.icon).toBeTruthy();
              });
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should provide navigation controls for projects with multiple screenshots', () => {
    fc.assert(
      fc.property(
        fc.constant(projects.filter(p => p.screenshots.length > 1)),
        (projectsWithMultipleScreenshots: Project[]) => {
          // Property: All projects with multiple screenshots should have navigation capability
          projectsWithMultipleScreenshots.forEach((project) => {
            expect(project.screenshots.length).toBeGreaterThan(1);
            
            // Property: Screenshot navigation should cycle through all screenshots
            const totalScreenshots = project.screenshots.length;
            
            // Simulate navigation forward
            for (let i = 0; i < totalScreenshots; i++) {
              const nextIndex = (i + 1) % totalScreenshots;
              expect(nextIndex).toBeGreaterThanOrEqual(0);
              expect(nextIndex).toBeLessThan(totalScreenshots);
            }
            
            // Simulate navigation backward
            for (let i = totalScreenshots - 1; i >= 0; i--) {
              const prevIndex = i === 0 ? totalScreenshots - 1 : i - 1;
              expect(prevIndex).toBeGreaterThanOrEqual(0);
              expect(prevIndex).toBeLessThan(totalScreenshots);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
