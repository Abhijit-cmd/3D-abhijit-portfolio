export interface Link {
  title: string;
  href: string;
  thumbnail: string;
  target?: string;
}

// Re-export video types
export * from './video';
