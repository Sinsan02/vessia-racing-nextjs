# Images for Vessia Racing Website

This folder contains static images used to enhance the visual appeal of the website.

## Folder Structure

- `/backgrounds/` - Background images for sections
- `/decorative/` - Decorative images like racing-related graphics, patterns, etc.
- `/` - General images

## Usage in Code

To use images from this folder in your React components:

```tsx
import Image from 'next/image';

// Example usage
<Image
  src="/images/decorative/racing-flag.jpg"
  alt="Racing flag"
  width={400}
  height={300}
  style={{objectFit: 'cover'}}
/>
```

Or as CSS background:

```css
.hero-section {
  background-image: url('/images/backgrounds/racing-track.jpg');
  background-size: cover;
  background-position: center;
}
```

## Image Requirements

- **Format**: JPG, PNG, WebP preferred
- **Size**: Optimize for web (usually < 1MB per image)
- **Resolution**: High enough for good quality but not too large for performance

## Examples of Images You Can Add

### Backgrounds (`/backgrounds/`)
- Racing track aerial views
- Garage/pit stop scenes
- Abstract racing patterns
- Carbon fiber textures

### Decorative (`/decorative/`)
- Racing cars
- Trophies and medals
- Racing flags (checkered, start/finish)
- Speedometer graphics
- Racing helmet designs
- Circuit diagrams

### General
- Team photos
- Sponsor logos
- Racing action shots
- Celebration moments

## Adding New Images

1. Drop your images into the appropriate subfolder
2. Use descriptive filenames (e.g., `racing-track-spa.jpg`)
3. Reference them in your code using `/images/subfolder/filename.ext`

The images will be automatically served by Next.js and can be used throughout the application.