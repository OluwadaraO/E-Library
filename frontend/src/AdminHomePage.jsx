import './AdminHomePage.css'
import React, {useState, useEffect} from 'react';
import { useAuth } from "./Authentication";
import { useNavigate } from "react-router-dom";
function AdminHomePage(){
    const {user, isAuthenticated, logout} = useAuth()
    const navigate = useNavigate()
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [bookDetails, setBookDetails] = useState({
        title: '',
        author: '',
        genre: '',
        publishingYear: '',
        availabilityStatus: true, // Make sure this is a boolean
        image: null,
        description: ''
    });
    const [selectedBookId, setSelectedBookId] = useState(null)
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const openModal = (book = null) => {
        if (book) {
            // Editing existing book
            setIsEditing(true);
            setSelectedBookId(book.id);
            setBookDetails({
                title: book.title || '',
                author: book.author || '',
                genre: book.genre || '',
                publishingYear: book.publishingYear || '',
                availabilityStatus: typeof book.availabilityStatus === 'boolean' ? book.availabilityStatus : true,
                image: null,
                description: book.description || '',
            });
        } else {
            // Adding new book
            setIsEditing(false);
            setSelectedBookId(null);
            setBookDetails({
                title: '',
                author: '',
                genre: '',
                publishingYear: '',
                availabilityStatus: true,
                image: null,
                description: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false)
        setError(null)
        setSuccessMessage(null)
        setSelectedBookId(null)
    }
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Special handling for availabilityStatus
        const processedValue = name === 'availabilityStatus' 
            ? value === 'true'  // Convert to boolean
            : value;
        setBookDetails(prev => ({ ...prev, [name]: processedValue }));
    };
    const handleFileChange = (e) => {
        setBookDetails({...bookDetails, image: e.target.files[0]});
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submission - isEditing:', isEditing); // Debug log
    
        try {
            if (!bookDetails.title || !bookDetails.author || !bookDetails.genre) {
                setError('Please fill in all required fields');
                return;
            }
    
            const formData = new FormData();
            formData.append('title', bookDetails.title);
            formData.append('author', bookDetails.author);
            formData.append('genre', bookDetails.genre);
            formData.append('publishingYear', bookDetails.publishingYear.toString());
            formData.append('availabilityStatus', bookDetails.availabilityStatus.toString());
            formData.append('description', bookDetails.description || '');
            if (bookDetails.image) {
                formData.append('bookImages', bookDetails.image);
            }
    
            let response;
            if (isEditing) {
                // For editing existing book
                response = await fetch(`http://localhost:3000/books/${selectedBookId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: bookDetails.title,
                        author: bookDetails.author,
                        genre: bookDetails.genre,
                        publishingYear: parseInt(bookDetails.publishingYear),
                        availabilityStatus: Boolean(bookDetails.availabilityStatus),
                        description: bookDetails.description || '',
                    }),
                });
            } else {
                // For adding new book
                response = await fetch('http://localhost:3000/upload-books', {
                    method: 'POST',
                    body: formData,
                });
            }
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save book');
            }
    
            // Update the books list accordingly
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save book');
            }
            
            // Update the books list
            if (isEditing) {
                // For editing, replace the updated book in the list
                setBooks(prevBooks =>
                    prevBooks.map(book => (book.id === selectedBookId ? data : book))
                );
                setSuccessMessage('Book updated successfully!');
            } else {
                // For adding, append the new book to the list
                setBooks(prevBooks => [...prevBooks, data.newBook]); // Use data.newBook
                setSuccessMessage('Book added successfully!');
            }
            
    
            closeModal();
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        }
    };

    const handleLogout = async() => {
        try{
            await logout();
            alert('Logged out successfully');
            navigate('/')
        }
        catch(error){
            console.error(error);
        }
    }




    useEffect(() => {
        if (!isAuthenticated){
            navigate('/admin-login');
            return;
        }
        const fetchBooks = async () => {
            try {
                const response = await fetch(`http://localhost:3000/get-books`, {
                    method: 'GET',
                    headers:  { 'Content-Type': 'application/json' },
                    credentials: 'include', 
                });
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch books');
                }
                
                setBooks(data);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        }

        fetchBooks()
    }, [isAuthenticated]);
    
    const handleProfileClick = () => {
        navigate(`/admin/notification`); // Navigate to the user's profile page
    };
    
    // 

    return (
        <div>
            <h1>Admin Home Page</h1>
            <h1>{user && isAuthenticated ? `Welcome back, ${user.firstName}` : 'Loading...'}</h1>
            <div
                className="admin-icon"
                onClick={() => navigate('/admin/profile')}
                title="Go to Profile"
                style={{
                    cursor: 'pointer',
                    backgroundColor: '#007bff',
                    color: 'white',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '20px',
                    marginBottom: '20px',
                }}
            >
                {user && user.firstName.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout}>Log out</button>
            <button onClick={() => openModal()}>Add Book</button>
            <button onClick={handleProfileClick} className="notification-bell">
                    🔔 Notifications
            </button>


            {isModalOpen && (
                <div className='modal-overlay' onClick={closeModal}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <h2>{isEditing ? 'Edit Book' : 'Add a New Book'}</h2>
                        {error && <p style={{color: 'red'}}>{error}</p>}
                        {successMessage && <p style={{color: 'green'}}>{successMessage}</p>}
                        <form onSubmit={handleSubmit}>
                            <label>
                                Title:
                                <input
                                    type="text"
                                    name="title"
                                    value={bookDetails.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                            <label>
                                Author:
                                <input
                                    type="text"
                                    name="author"
                                    value={bookDetails.author}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                            <label>
                                Genre:
                                <input
                                    type="text"
                                    name="genre"
                                    value={bookDetails.genre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                            <label>
                                Publishing Year:
                                <input
                                    type="number"
                                    name="publishingYear"
                                    value={bookDetails.publishingYear}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                Availability Status:
                                <select
                                    name="availabilityStatus"
                                    value={bookDetails.availabilityStatus}
                                    onChange={handleInputChange}
                                >
                                    <option value="true">Available</option>
                                    <option value="false">Unavailable</option>
                                </select>
                            </label>
                            <label>
                                Description:
                                <textarea
                                    name="description"
                                    value={bookDetails.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                ></textarea>
                            </label>
                            <label>
                                Image (optional):
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </label>
                            <button type="submit">{isEditing ? 'Save Changes' : 'Add Book'}</button>
                            <button type="button" onClick={closeModal}>Cancel</button>
                        </form>

                    </div>
                </div>
            )}
            <h2>Available Books</h2>
            <div className="book-list">
                {books.map((book) => (
                    <div className="book-item" key={book.id}>
                        <img src={book.image} alt={book.title} className="book-image" />
                        <h3>{book.title}</h3>
                        <p>Author: {book.author}</p>
                        <p>Genre: {book.genre}</p>
                        <p>Published: {book.publishingYear}</p>
                        <span className="three-dots" onClick={() => openModal(book)}>•••</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default AdminHomePage