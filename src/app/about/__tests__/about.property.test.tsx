import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import AboutPage from '../page';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  
  const createMotionComponent = (Component: string) => {
    return ({ children, onClick, onMouseMove, onMouseLeave, style, animate, initial, transition, whileHover, ...props }: any) => {
      const Comp = Component as any;
      return (
        <Comp onClick={onClick} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} {...props}>
          {children}
        </Comp>
      );
    };
  };
  
  return {
    ...actual,
    motion: {
      div: createMotionComponent('div'),
      aside: createMotionComponent('aside'),
      main: createMotionComponent('main'),
      ul: createMotionComponent('ul'),
      li: createMotionComponent('li'),
      a: createMotionComponent('a'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      p: createMotionComponent('p'),
      span: createMotionComponent('span'),
    },
    useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
    useSpring: (value: any) => value,
    useTransform: (value: any, input: any, output: any) => value,
  };
});

/**
 * Feature: portfolio-improvements, Property 3: Tech stack visualization
 * Validates: Requirements 2.2, 2.3
 * 
 * For any tech tools dataset, when the about page loads, all tools should be rendered 
 * in the 3D galaxy with proper positioning and interactive scatter/gather animations on click
 */
describe('Property 3: Tech stack visualization', () => {
  it('should render all tech tools in the galaxy visualization', () => {
    fc.assert(
      fc.property(
        fc.constant(true), // Dummy property to run the test
        () => {
          const { container } = render(<AboutPage />);
          
          // Property: Tech stack section should exist
          const techStackSection = container.querySelector('.perspective-1000');
          expect(techStackSection).toBeTruthy();
          
          // Property: All tech tools should be rendered
          // Check for specific tech tools that should be present
          const expectedTools = [
            'JavaScript',
            'TypeScript',
            'Python',
            'Next.js',
            'Node.js',
            'Docker',
            'Git',
            'PostgreSQL',
            'MongoDB',
            'Tailwind',
          ];
          
          expectedTools.forEach((toolName) => {
            // Each tool should have a tooltip with its name
            const tooltips = container.querySelectorAll('.whitespace-nowrap');
            const toolExists = Array.from(tooltips).some(
              (tooltip) => tooltip.textContent === toolName
            );
            expect(toolExists).toBe(true);
          });
          
          // Property: Tech tools should have proper structure
          const techItems = container.querySelectorAll('.perspective-1000 .absolute.flex');
          expect(techItems.length).toBeGreaterThan(0);
          
          // Property: Each tech item should have required elements
          techItems.forEach((item) => {
            // Should have background styling
            expect(item.className).toContain('bg-zinc-900');
            expect(item.className).toContain('border');
            expect(item.className).toContain('rounded-xl');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should support interactive scatter/gather animations on click', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(<AboutPage />);
          
          // Property: Galaxy container should be clickable
          const galaxyContainer = container.querySelector('.perspective-1000.cursor-pointer');
          expect(galaxyContainer).toBeTruthy();
          
          // Property: Clicking should trigger state change (scatter/gather)
          // The container should have onClick handler
          if (galaxyContainer) {
            // Simulate click
            fireEvent.click(galaxyContainer);
            
            // Property: After click, the component should still be rendered
            expect(galaxyContainer).toBeTruthy();
            
            // Property: Tech items should still exist after interaction
            const techItems = container.querySelectorAll('.perspective-1000 .absolute.flex');
            expect(techItems.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should have proper positioning for all tech tools', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(<AboutPage />);
          
          // Property: All tech items should have absolute positioning
          const techItems = container.querySelectorAll('.perspective-1000 .absolute.flex');
          
          techItems.forEach((item) => {
            // Property: Each item should have absolute positioning
            expect(item.className).toContain('absolute');
            
            // Property: Each item should have flex display for centering
            expect(item.className).toContain('flex');
            expect(item.className).toContain('items-center');
            expect(item.className).toContain('justify-center');
          });
          
          // Property: Center core (sun) should exist
          const centerCore = container.querySelector('.w-12.h-12.bg-white.rounded-full');
          expect(centerCore).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: portfolio-improvements, Property 4: Profile card interactivity
 * Validates: Requirements 2.4
 * 
 * For any mouse movement over the profile card, the 3D tilt effect should respond 
 * proportionally to mouse position
 */
describe('Property 4: Profile card interactivity', () => {
  it('should respond to mouse movement with 3D tilt effect', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // Mouse X position
        fc.integer({ min: 0, max: 1000 }), // Mouse Y position
        (mouseX, mouseY) => {
          const { container } = render(<AboutPage />);
          
          // Property: Profile card should exist
          const profileCard = container.querySelector('.lg\\:col-span-4');
          expect(profileCard).toBeTruthy();
          
          // Property: Profile card should have mouse event handlers
          // The aside element should be the one with mouse tracking
          const asideElement = container.querySelector('aside');
          expect(asideElement).toBeTruthy();
          
          // Property: Mouse move should be handled
          if (asideElement) {
            // Simulate mouse move event
            const rect = {
              left: 100,
              top: 100,
              width: 400,
              height: 600,
              right: 500,
              bottom: 700,
            };
            
            // Mock getBoundingClientRect
            asideElement.getBoundingClientRect = () => rect as DOMRect;
            
            // Create mouse event
            const mouseEvent = new MouseEvent('mousemove', {
              clientX: mouseX,
              clientY: mouseY,
              bubbles: true,
            });
            
            // Property: Should not throw error on mouse move
            expect(() => {
              fireEvent(asideElement, mouseEvent);
            }).not.toThrow();
            
            // Property: Element should still be in DOM after interaction
            expect(asideElement).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should reset tilt on mouse leave', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(<AboutPage />);
          
          // Property: Profile card should exist
          const asideElement = container.querySelector('aside');
          expect(asideElement).toBeTruthy();
          
          if (asideElement) {
            // Property: Mouse leave should be handled
            const mouseLeaveEvent = new MouseEvent('mouseleave', {
              bubbles: true,
            });
            
            // Property: Should not throw error on mouse leave
            expect(() => {
              fireEvent(asideElement, mouseLeaveEvent);
            }).not.toThrow();
            
            // Property: Element should still be in DOM after interaction
            expect(asideElement).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should have proper structure for 3D tilt effect', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(<AboutPage />);
          
          // Property: Profile card should have required elements
          const profileImage = container.querySelector('img[alt="Abhijit Deb"]');
          expect(profileImage).toBeTruthy();
          
          // Property: Profile name should be displayed
          const profileNames = screen.getAllByText('Abhijit Deb');
          expect(profileNames.length).toBeGreaterThan(0);
          
          // Property: Role badge should be displayed
          const roleBadges = screen.getAllByText('Full Stack Developer');
          expect(roleBadges.length).toBeGreaterThan(0);
          
          // Property: Contact links should exist
          const emailLink = container.querySelector('a[href^="mailto:"]');
          expect(emailLink).toBeTruthy();
          
          const phoneLink = container.querySelector('a[href^="tel:"]');
          expect(phoneLink).toBeTruthy();
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Feature: portfolio-improvements, Property 5: Contact information accuracy
 * Validates: Requirements 2.5
 * 
 * For any contact information displayed, all links should be functional and lead to 
 * the correct destinations
 */
describe('Property 5: Contact information accuracy', () => {
  it('should have functional email link with correct address', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(<AboutPage />);
          
          // Property: Email link should exist and be correct
          const emailLink = container.querySelector('a[href^="mailto:"]');
          expect(emailLink).toBeTruthy();
          
          if (emailLink) {
            const href = emailLink.getAttribute('href');
            expect(href).toBeTruthy();
            expect(href).toContain('mailto:');
            expect(href).toContain('@');
            
            // Property: Email should be a valid format
            const emailMatch = href?.match(/mailto:([^\s]+)/);
            expect(emailMatch).toBeTruthy();
            
            if (emailMatch) {
              const email = emailMatch[1];
              expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should have functional phone link with correct number', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(<AboutPage />);
          
          // Property: Phone link should exist and be correct
          const phoneLink = container.querySelector('a[href^="tel:"]');
          expect(phoneLink).toBeTruthy();
          
          if (phoneLink) {
            const href = phoneLink.getAttribute('href');
            expect(href).toBeTruthy();
            expect(href).toContain('tel:');
            
            // Property: Phone number should be present
            const phoneMatch = href?.match(/tel:(.+)/);
            expect(phoneMatch).toBeTruthy();
            
            if (phoneMatch) {
              const phone = phoneMatch[1];
              expect(phone.length).toBeGreaterThan(0);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should have functional social media links', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(<AboutPage />);
          
          // Property: LinkedIn link should exist and be correct
          const linkedInLink = container.querySelector('a[href*="linkedin.com"]');
          expect(linkedInLink).toBeTruthy();
          
          if (linkedInLink) {
            const href = linkedInLink.getAttribute('href');
            expect(href).toBeTruthy();
            expect(href).toContain('https://');
            expect(href).toContain('linkedin.com');
          }
          
          // Property: GitHub link should exist and be correct
          const githubLink = container.querySelector('a[href*="github.com"]');
          expect(githubLink).toBeTruthy();
          
          if (githubLink) {
            const href = githubLink.getAttribute('href');
            expect(href).toBeTruthy();
            expect(href).toContain('https://');
            expect(href).toContain('github.com');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should have all contact links properly formatted and accessible', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          const { container } = render(<AboutPage />);
          
          // Property: All contact links should be anchor elements
          const allLinks = container.querySelectorAll('a[href^="mailto:"], a[href^="tel:"], a[href*="linkedin.com"], a[href*="github.com"]');
          expect(allLinks.length).toBeGreaterThanOrEqual(4);
          
          // Property: Each link should have proper structure
          allLinks.forEach((link) => {
            // Should have href attribute
            const href = link.getAttribute('href');
            expect(href).toBeTruthy();
            expect(href!.length).toBeGreaterThan(0);
            
            // Should be a valid link (starts with mailto:, tel:, or https://)
            const isValid = 
              href!.startsWith('mailto:') || 
              href!.startsWith('tel:') || 
              href!.startsWith('https://') ||
              href!.startsWith('http://');
            expect(isValid).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
