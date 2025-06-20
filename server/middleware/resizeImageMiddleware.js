const sharp = require('sharp');

// Utility function to resize image
const resizeImage = async (imageBuffer, quality = 80, maxFileSize = 10 * 1024 * 1024) => {
  try {
    const image = sharp(imageBuffer);

    // Check image metadata (e.g., file size)
    const metadata = await image.metadata();
    let resizedBuffer;

    if (metadata.size > maxFileSize) {
      resizedBuffer = await image
        .resize({ width: 2000 })  // Resize to a smaller width, adjusting this value as needed
        .jpeg({ quality })        // Compress with specific quality
        .toBuffer();
    } else {
      resizedBuffer = await image.toBuffer();  // If it's already small, just pass it through
    }

    return resizedBuffer.toString('base64'); // Return resized image in base64 format
  } catch (err) {
    console.error("Error resizing image:", err);
    throw new Error("Image resizing failed");
  }
};

// Middleware to process image upload
const processImage = async (req, res, next) => {
  if (req.files && req.files.length > 0) {
    try {
      // Loop through each uploaded image and resize it
      req.body.profileImages = await Promise.all(
        req.files.map(image => resizeImage(image.buffer)) // Use .buffer from Multer
      );

      next(); // Proceed to the controller
    } catch (err) {
      res.status(500).json({ message: "Error processing image", error: err.message });
    }
  } else {
    next(); // No files, proceed to controller
  }
};

module.exports = processImage;
