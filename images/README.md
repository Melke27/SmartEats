# SmartEats Images Directory

This directory contains all image assets for the SmartEats application.

## Directory Structure

- **`foods/`** - Food item images and recipe photos
- **`icons/`** - UI icons and small graphics
- **`logos/`** - SmartEats branding and logo files
- **`uploads/`** - User-uploaded images (meal photos, profile pictures)

## Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- SVG (.svg) for icons and logos

## Image Guidelines

### Food Images
- Resolution: 400x400px minimum
- Format: JPEG or WebP preferred
- File size: Under 500KB

### Icons
- Resolution: 32x32px, 64x64px, 128x128px
- Format: SVG preferred, PNG acceptable
- Transparent background recommended

### Logos
- Multiple sizes available
- SVG format for scalability
- PNG for specific sizes

### User Uploads
- Maximum size: 5MB
- Automatic resizing applied
- Compressed for optimal performance

## Usage

Images are served via the Flask backend at `/images/<path>` endpoints.

Example:
```
GET /images/foods/pizza.jpg
GET /images/icons/heart.svg
GET /images/logos/smarteats-logo.png
```
