import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication";
import { useNavigate, useParams } from "react-router-dom";
import './UserProfilePage.css'
// import io from "socket.io-client";

function UserProfilePage() {
    const { id } = useParams(); // Get the user ID from the URL
    const { user, isAuthenticated } = useAuth(); // Get user and auth methods from useAuth
    const [profileData, setProfileData] = useState(null); // Store user profile data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [likedBooks, setLikedBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate("/"); // Redirect to home if unauthorized
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/${user.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // Include cookies for authentication
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user profile");
                }

                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchLikedBooks = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/${user.id}/liked-books`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                setLikedBooks(data.map((like) => like.book));
            } catch (error) {
                setError("Failed to fetch liked books.");
            }
        };

        const fetchBorrowedBooks = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/${user.id}/borrowed-books`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // Include cookies for authentication
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch borrowed books");
                }

                const data = await response.json();
                if (data.length === 0) {
                    setBorrowedBooks([]); // No borrowed books
                } else {
                    setBorrowedBooks(data); // Set borrowed books
                }
            } catch (error) {
                setError(error.message);
            }
        };

        
        fetchUserProfile();
        fetchBorrowedBooks();
        fetchLikedBooks();
        setLoading(false);

        // const socket = io("http://localhost:3000"); // Connect to the WebSocket server

        // // Listen for return notifications
        // socket.on("bookReturned", (notification) => {
        //     console.log("Book returned notification:", notification);
        //     alert(notification.message); // Show real-time notification
        // });

        // return () => {
        //     socket.disconnect(); // Cleanup when the component unmounts
        // };

    }, [isAuthenticated, navigate, user]);
    
    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>{error}</p>;
    if (!profileData) return <p>Loading user data...</p>;
    const handleEdit = () => setEditMode(true);
    const handleCancelEdit = () => setEditMode(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:3000/user/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile.");
            }

            const updatedData = await response.json();
            setProfileData(updatedData);
            setEditMode(false);
        } catch (error) {
            setError(error.message);
        }
    };
    const handleBackToHome = () => {
        navigate('/home'); // Navigate back to the home page
    }

    const handleReturnBook = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:3000/books/${bookId}/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for authentication
            });
    
            if (!response.ok) {
                throw new Error('Failed to return the book');
            }
    
            // Update the borrowedBooks state
            setBorrowedBooks((prevBooks) =>
                prevBooks.filter((book) => book.book.id !== bookId)
            );

        } catch (error) {
            console.error('Error returning book:', error);
        }
    };
    
    

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="profile-icon">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                </div>
                <h1>{profileData.firstName}'s Profile</h1>
            </header>
            <main className="profile-main">
            <section>
        {editMode ? (
            <div className="edit-mode">
                <div className="edit-field">
                    <h2>Edit Your Profile Information</h2>
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
                    <label htmlFor="schoolID">School ID:</label>
                    <input
                        id="schoolID"
                        name="schoolID"
                        value={formData.schoolID}
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
                        <label>School ID:</label>
                        <p>{profileData.schoolID}</p>
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
    </section>
                <section className="liked-books">
                    <h2>Liked Books</h2>
                    {likedBooks.length ? (
                        likedBooks.map((book) => (
                            <p key={book.id}>{book.title} by {book.author}</p>
                        ))
                    ) : (
                        <p>No liked books.</p>
                    )}
                </section>
                <section className="borrowed-books">
                    <h2>Borrowed Books</h2>
                    {borrowedBooks.length > 0 ? (
                        <ul>
                            {borrowedBooks.map((book) => (
                                <li key={book.book.id}>
                                    {book.book.title} by {book.book.author} - Due in {book.daysLeft} days
                                    <button
                                        onClick={() => handleReturnBook(book.book.id)}
                                        className="return-button"
                                    >Return</button>
                                </li>
                                
                            ))}
                        </ul>
                    ) : (
                        <p>You have no borrowed books.</p> // Friendly message when no books are borrowed
                    )}
                </section>
            </main>
            <button className="back-to-home-button" onClick={handleBackToHome}>
                Back to Home
            </button>
        </div>

        
    );
}

export default UserProfilePage;
