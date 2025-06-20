import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Avatar, Modal } from "@mui/material";
import ClientSidebar from "./UserFiling/ClientSidebar";
import "./ManageProfilePage.css";

const ManageProfilePage = () => {
  const userId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");
  const [profile, setProfile] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("authToken");
      if (!token) return;

      try {
        // Get user info
        const userRes = await axios.get(`http://localhost:1337/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(userRes.data);

        // Get profile based on role
        const profileUrl = `http://localhost:1337/${role}/profile/user/${userId}`;
        const profileRes = await axios.get(profileUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileRes.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile(null);
        } else {
          console.error("Error loading profile:", err);
        }
      }
    };

    if (userId && role) fetchData();
  }, [userId, role]);

  const getImageSrc = (image) => {
    if (!image) return "";
    return image.startsWith("data:image") ? image : `data:image/png;base64,${image}`;
  };

  return (
    <div className="ManageProfilePage">
      <ClientSidebar />
      <div className="profile-container">
        <div className="container">
          <h2>Manage Profile</h2>
          <label htmlFor="profile-pic" className="customFile">
            <Avatar
              alt="Profile"
              src={getImageSrc(profile?.profileImage)}
              sx={{ width: 100, height: 100 }}
            />
          </label>
          <input
            type="file"
            id="profile-pic"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                setProfile((prev) => ({ ...prev, profileImage: reader.result }));
              };
              reader.readAsDataURL(file);
            }}
          />
          <TextField label="Name" fullWidth margin="dense" value={profile?.name || ""} disabled />
          <TextField
            label="Birthdate"
            type="date"
            fullWidth
            margin="dense"
            value={profile?.birthdate?.split("T")[0] || ""}
            disabled
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Contact Number"
            fullWidth
            margin="dense"
            value={profile?.contactNumber || ""}
            disabled
          />
          <TextField label="Address" fullWidth margin="dense" value={profile?.address || ""} disabled />
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenProfileModal(true)}>
            {profile ? "Edit Profile" : "Create Profile"}
          </Button>
        </div>

        <div className="container">
          <h2>Manage User Details</h2>
          <TextField label="Username" fullWidth margin="dense" value={userDetails.username || ""} disabled />
          <TextField label="Email" fullWidth margin="dense" value={userDetails.email || ""} disabled />
          <TextField label="Password" type="password" fullWidth margin="dense" value="********" disabled />
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenUserModal(true)}>
            Edit User
          </Button>
        </div>
      </div>

      <Modal open={openProfileModal} onClose={() => setOpenProfileModal(false)}>
        <Box className="modal-box">
          <Typography variant="h6">{profile ? "Edit Profile" : "Create Profile"}</Typography>
          <EditProfileForm
            profile={profile}
            setProfile={setProfile}
            userId={userId}
            role={role}
            onClose={() => setOpenProfileModal(false)}
          />
        </Box>
      </Modal>

      <Modal open={openUserModal} onClose={() => setOpenUserModal(false)}>
        <Box className="modal-box">
          <Typography variant="h6">Edit User Details</Typography>
          <EditUserForm
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            userId={userId}
            onClose={() => setOpenUserModal(false)}
          />
        </Box>
      </Modal>
    </div>
  );
};

const EditProfileForm = ({ profile, setProfile, userId, role, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    address: "",
    contactNumber: "",
    profilePicture: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        birthdate: profile.birthdate || "",
        address: profile.address || "",
        contactNumber: profile.contactNumber || "",
        profilePicture: profile.profileImage || "",
      });
    }
  }, [profile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem("authToken");
    const endpointCheck =
      role === "dentist"
        ? `http://localhost:1337/dentist/profile/user/${userId}`
        : role === "patient"
        ? `http://localhost:1337/patient/profile/${userId}`
        : role === "staff"
        ? `http://localhost:1337/staff/profile/${userId}`
        : null;


    try {
      // Check if profile exists
      const exists = await axios.get(endpointCheck, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(() => true).catch(() => false);

      const method = exists ? "PUT" : "POST";
      const url = method === "POST"
        ? `http://localhost:1337/${role}/create`
        : endpointCheck;

      const base64Data = formData.profilePicture?.startsWith("data:image")
        ? formData.profilePicture.replace(/^data:image\/\w+;base64,/, "")
        : "";

      const payload = {
        userId,
        name: formData.name,
        birthdate: formData.birthdate,
        address: formData.address,
        contactNumber: formData.contactNumber,
        profileImage: base64Data ? `data:image/png;base64,${base64Data}` : "",
      };

      const res = await axios({
        method,
        url,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        alert("Profile saved successfully!");
        setProfile(res.data);
        onClose();
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("An error occurred while saving the profile.");
    }
  };

  return (
    <>
      <input type="file" accept="image/jpeg,image/png" onChange={handleImageChange} />
      {formData.profilePicture && (
        <Avatar
          src={formData.profilePicture.startsWith("data:image") ? formData.profilePicture : `data:image/png;base64,${formData.profilePicture}`}
          sx={{ width: 100, height: 100, mt: 2 }}
        />
      )}
      <TextField label="Name" fullWidth margin="dense" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      <TextField label="Birthdate" type="date" fullWidth margin="dense" value={formData.birthdate} onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })} InputLabelProps={{ shrink: true }} />
      <TextField label="Address" fullWidth margin="dense" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
      <TextField label="Contact Number" fullWidth margin="dense" value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value.replace(/[^\d]/g, "") })} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>
        {profile ? "Save Changes" : "Create Profile"}
      </Button>
    </>
  );
};

const EditUserForm = ({ userDetails, setUserDetails, userId, onClose }) => {
  const [formData, setFormData] = useState(userDetails);

  useEffect(() => {
    setFormData(userDetails);
  }, [userDetails]);

  const handleSave = async () => {
    const token = sessionStorage.getItem("authToken");
    const payload = { userId, ...formData };
    if (!formData.password) delete payload.password;

    try {
      const res = await axios.put("http://localhost:1337/auth/user/edit", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        alert("User updated!");
        setUserDetails(res.data);
        onClose();
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user.");
    }
  };

  return (
    <>
      <TextField label="Username" fullWidth margin="dense" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
      <TextField label="Email" fullWidth margin="dense" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      <TextField label="Password" type="password" fullWidth margin="dense" value={formData.password || ""} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>Save Changes</Button>
    </>
  );
};

export default ManageProfilePage;
