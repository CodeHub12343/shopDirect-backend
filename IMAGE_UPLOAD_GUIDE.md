# Product Image Upload Guide

## Overview

This guide explains how to use the image upload functionality for products in the e-commerce API.

## Features

- ✅ Upload cover image (single file)
- ✅ Upload multiple product images (up to 3 files)
- ✅ Automatic image resizing (2000x1333 pixels)
- ✅ JPEG conversion with 90% quality
- ✅ Unique filename generation
- ✅ Static file serving

## API Endpoints

### Create Product with Images

```http
POST /api/v4/products
Content-Type: multipart/form-data
Authorization: Bearer <your-jwt-token>
```

### Update Product with Images

```http
PATCH /api/v4/products/:id
Content-Type: multipart/form-data
Authorization: Bearer <your-jwt-token>
```

## Form Data Structure

### Required Fields

- `name` (text): Product name
- `description` (text): Product description
- `price` (number): Product price
- `category` (text): Category ID

### Image Fields

- `imageCover` (file): Main product image (max 1 file)
- `images` (file): Additional product images (max 3 files)

## Example Usage

### Using HTML Form

```html
<form action="/api/v4/products" method="POST" enctype="multipart/form-data">
  <input type="text" name="name" placeholder="Product Name" required />
  <input
    type="text"
    name="description"
    placeholder="Product Description"
    required
  />
  <input type="number" name="price" placeholder="Price" required />
  <input type="text" name="category" placeholder="Category ID" required />

  <input type="file" name="imageCover" accept="image/*" required />
  <input type="file" name="images" accept="image/*" multiple />

  <button type="submit">Create Product</button>
</form>
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('name', 'iPhone 15 Pro');
formData.append('description', 'Latest iPhone with advanced features');
formData.append('price', '999');
formData.append('category', '688cb3de55658900de661304');

// Add cover image
const coverImage = document.querySelector('input[name="imageCover"]').files[0];
formData.append('imageCover', coverImage);

// Add multiple images
const additionalImages = document.querySelector('input[name="images"]').files;
for (let i = 0; i < additionalImages.length; i++) {
  formData.append('images', additionalImages[i]);
}

fetch('/api/v4/products', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + token,
  },
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### Using Postman

1. Set method to `POST` or `PATCH`
2. Set URL to `/api/v4/products` or `/api/v4/products/:id`
3. Set Authorization header: `Bearer <your-jwt-token>`
4. In Body tab, select `form-data`
5. Add text fields: `name`, `description`, `price`, `category`
6. Add file fields: `imageCover` (type: File), `images` (type: File)
7. Send request

## Image Processing

### What Happens to Uploaded Images

1. **Validation**: Only image files are accepted
2. **Resizing**: Images are resized to 2000x1333 pixels
3. **Conversion**: All images are converted to JPEG format
4. **Quality**: JPEG quality is set to 90%
5. **Naming**: Unique filenames are generated using timestamps
6. **Storage**: Images are saved to `public/img/products/`

### Generated Filenames

- Cover image: `product-1234567890-cover.jpeg`
- Additional images: `product-1234567890-1.jpeg`, `product-1234567890-2.jpeg`, etc.

## Image URLs

### Accessing Uploaded Images

Images are served statically and can be accessed at:

```
http://localhost:3000/img/products/product-1234567890-cover.jpeg
http://localhost:3000/img/products/product-1234567890-1.jpeg
http://localhost:3000/img/products/product-1234567890-2.jpeg
```

### In API Response

The API response will include the image filenames:

```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "64e6c9b0bcbabb403c3f0001",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999,
      "imageCover": "product-1234567890-cover.jpeg",
      "images": ["product-1234567890-1.jpeg", "product-1234567890-2.jpeg"],
      "category": "688cb3de55658900de661304"
    }
  }
}
```

## Error Handling

### Common Errors

- **400 Bad Request**: Non-image file uploaded
- **401 Unauthorized**: Missing or invalid JWT token
- **413 Payload Too Large**: Image file too large
- **500 Internal Server Error**: Image processing failed

### Error Response Format

```json
{
  "status": "error",
  "message": "Not an image! Please upload only images."
}
```

## Security Features

### Authentication Required

- All image upload endpoints require authentication
- JWT token must be included in Authorization header

### File Validation

- Only image files are accepted
- File type validation using MIME types
- Maximum file count limits enforced

### Image Processing

- Images are processed server-side
- Original files are not stored
- Processed images are optimized for web

## Dependencies

### Required Packages

- `multer`: File upload handling
- `sharp`: Image processing and resizing

### Installation

```bash
npm install multer sharp
```

## File Structure

```
public/
  img/
    products/
      product-1234567890-cover.jpeg
      product-1234567890-1.jpeg
      product-1234567890-2.jpeg
      ...
```

## Notes

- Images are automatically optimized for web use
- Unique filenames prevent conflicts
- Static file serving enables direct image access
- All images are converted to JPEG for consistency
- Image processing is handled asynchronously
