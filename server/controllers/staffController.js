// controllers/StaffController.js
const Staff = require('../models/staff.models');
const fs = require('fs');


// Get Staff profile by userId
exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await Staff.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    let base64Image = null;
    if (profile.profileImage && fs.existsSync(profile.profileImage)) {
      const imageBuffer = fs.readFileSync(profile.profileImage);
      base64Image = imageBuffer.toString("base64");
    }

    res.status(200).json({
        userId: profile.userId,
        name: profile.name,
        birthdate: profile.birthdate,
        address: profile.address,
        contactNumber: profile.contactNumber,
        profileImage: base64Image ? `data:image/png;base64,${base64Image}` : null,
      });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};


// Create profile by userId
exports.createProfile = async (req, res) => {
  try {
    const { userId, name, birthdate, contactNumber, address, profileImage } = req.body;

    let profileImagePath = null;

    if (profileImage && profileImage.startsWith('data:image')) {
      const base64Data = profileImage.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      profileImagePath = `uploads/profile_${Date.now()}.png`;
      fs.writeFileSync(profileImagePath, buffer);
    }

    const newProfile = new Staff({ // ✅ Fixed here
      userId,
      name,
      birthdate,
      contactNumber,
      address,
      profileImage: profileImagePath,
    });

    await newProfile.save();

    let base64Image = null;
    if (profileImagePath && fs.existsSync(profileImagePath)) {
      const imageBuffer = fs.readFileSync(profileImagePath);
      base64Image = imageBuffer.toString("base64");
    }

    res.status(200).json({
      userId: newProfile.userId,
      name: newProfile.name,
      birthdate: newProfile.birthdate,
      address: newProfile.address,
      contactNumber: newProfile.contactNumber,
      profileImage: base64Image ? `data:image/png;base64,${base64Image}` : null,
    });

  } catch (err) {
    console.error("Error creating profile:", err);
    res.status(500).json({ message: "Error creating profile", error: err.message });
  }
};


// Edit Dentist profile by userId
exports.editProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, birthdate, address, contactNumber, profileImage } = req.body;

  try {
    const existingProfile = await Staff.findOne({ userId }); // ✅ Fixed here

    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    let profileImagePath = existingProfile.profileImage;

    if (profileImage && profileImage.startsWith('data:image')) {
      if (profileImagePath && fs.existsSync(profileImagePath)) {
        fs.unlinkSync(profileImagePath);
      }

      const base64Data = profileImage.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      profileImagePath = `uploads/profile_${Date.now()}.png`;
      fs.writeFileSync(profileImagePath, buffer);
    }

    const updatedProfile = await Staff.findOneAndUpdate( // ✅ Fixed here
      { userId },
      {
        name,
        birthdate,
        address,
        contactNumber,
        profileImage: profileImagePath,
      },
      { new: true }
    );

    let base64Image = null;
    if (profileImagePath && fs.existsSync(profileImagePath)) {
      const imageBuffer = fs.readFileSync(profileImagePath);
      base64Image = imageBuffer.toString('base64');
    }

    res.status(200).json({
      userId: updatedProfile.userId,
      name: updatedProfile.name,
      birthdate: updatedProfile.birthdate,
      address: updatedProfile.address,
      contactNumber: updatedProfile.contactNumber,
      profileImage: base64Image ? `data:image/png;base64,${base64Image}` : null,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};


// Delete profile
exports.deleteProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const deleted = await Staff.findOneAndDelete({ userId });

    if (!deleted) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ success: true, message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Error deleting profile:", err);
    res.status(500).json({ message: "Error deleting profile", error: err.message });
  }
};
