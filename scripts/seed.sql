-- Insert sample videos into the database
INSERT INTO videos (id, title, description, filename, "originalName", "mimeType", size, duration, thumbnail, tags, category, "isPublic", "viewCount", "uploadDate", "lastModified")
VALUES 
  (
    'sample-video-1',
    'Epic Gaming Moment #1',
    'An amazing gameplay highlight from my latest stream',
    'sample-1.mp4',
    'epic-moment-1.mp4',
    'video/mp4',
    15000000,
    120,
    'https://via.placeholder.com/640x360/1a1a2e/16213e?text=Epic+Gaming+Moment',
    ARRAY['gaming', 'highlight', 'epic'],
    'gameplay',
    true,
    42,
    NOW(),
    NOW()
  ),
  (
    'sample-video-2',
    'Funny Fails Compilation',
    'The funniest moments from this week',
    'sample-2.mp4',
    'funny-fails.mp4',
    'video/mp4',
    20000000,
    180,
    'https://via.placeholder.com/640x360/1a1a2e/16213e?text=Funny+Fails',
    ARRAY['funny', 'fails', 'compilation'],
    'funny_moments',
    true,
    128,
    NOW(),
    NOW()
  ),
  (
    'sample-video-3',
    'Pro Gameplay Strategy',
    'Advanced tactics and strategies for competitive play',
    'sample-3.mp4',
    'pro-strategy.mp4',
    'video/mp4',
    25000000,
    300,
    'https://via.placeholder.com/640x360/1a1a2e/16213e?text=Pro+Strategy',
    ARRAY['strategy', 'competitive', 'tutorial'],
    'gameplay',
    true,
    256,
    NOW(),
    NOW()
  );
