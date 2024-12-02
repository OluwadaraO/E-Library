import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProfilePage.css"; // Custom styles

function AdminProfilePage() {
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        schoolID: "",
        userName: "",
    });

    const [formData, setFormData] = useState({ ...profileData });
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate()

    // Fetch profile data on component load
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("http://localhost:3000/admin/profile", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // Include authentication cookies
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                    setFormData(data); // Initialize formData for editing
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || "Failed to fetch profile data");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("An error occurred while fetching the profile.");
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setFormData(profileData); // Reset form data to the original profile data
        setError("");
        setSuccessMessage("");
    };

    const handleSave = async () => {
        try {
            const response = await fetch("http://localhost:3000/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedData = await response.json();
                setProfileData(updatedData); // Update the profileData state
                setEditMode(false); // Exit edit mode
                setSuccessMessage("Profile updated successfully!");
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            setError("An error occurred while updating the profile.");
        }
    };
    const handleBackToHome = () => {
        navigate('/admin-home'); // Navigate back to the home page
    }

    return (
        <main className="profile-main">
            <header className="profile-header">
                <div className="profile-icon">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                </div>
                <h1>{profileData.firstName}'s Profile</h1>
            </header>
            <section>
                {editMode ? (
                    <div className="edit-mode">
                        <h2>Edit Your Profile Information</h2>
                        <div className="edit-field">
                            <label htmlFor="firstName">First Name:</label>
                            <input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="edit-field">
                            <label htmlFor="lastName">Last Name:</label>
                            <input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="edit-field">
                            <label htmlFor="userName">Username:</label>
                            <input
                                id="userName"
                                name="userName"
                                value={formData.userName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="edit-buttons">
                            <button onClick={handleSave} className="save-button">
                                Save
                            </button>
                            <button onClick={handleCancelEdit} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                        {error && <p className="error">{error}</p>}
                        {successMessage && <p className="success">{successMessage}</p>}
                    </div>
                ) : (
                    <div className="view-mode">
                        <h2>Your Profile Information</h2>
                        <div className="profile-info">
                            <div className="profile-field">
                                <label>First Name:</label>
                                <p>{profileData.firstName}</p>
                            </div>
                            <div className="profile-field">
                                <label>Last Name:</label>
                                <p>{profileData.lastName}</p>
                            </div>
                            <div className="profile-field">
                                <label>Username:</label>
                                <p>{profileData.userName}</p>
                            </div>
                            <button onClick={handleEdit} className="edit-button">
                                Edit
                            </button>
                        </div>
                    </div>
                )}
                
                <button className="back-to-home-button" onClick={handleBackToHome}>
                    Back to Home
                </button>
            </section>
        </main>
    );
}

export default AdminProfilePage;
