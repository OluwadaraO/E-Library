import './AdminHomePage.css'
import React, {useState, useEffect} from 'react';
import { useAuth } from "./Authentication";
import { useNavigate } from "react-router-dom";
function AdminHomePage(){
    const {user, isAuthenticated, logout} = useAuth()
    const navigate = useNavigate()
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [bookDetails, setBookDetails] = useState({
        title: '',
        author: '',
        genre: '',
        publishingYear: '',
        availabilityStatus: true,
        image: null,
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const userId = user.id
    const openModal = () => setIsModalOpen(true);

    const closeModal = () => {
        setIsModalOpen(false)
        setError(null)
        setSuccessMessage(null)
        setBookDetails({
            title: '',
            author: '',
            genre: '',
            publishingYear: '',
            availabilityStatus: true,
            image: null,
        });
    }

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setBookDetails({...bookDetails, [name]: value});
    }

    const handleFileChange = (e) => {
        setBookDetails({...bookDetails, image: e.target.files[0]});
    }

    const fetchBooks = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/get-books?userId=${userId}`, {
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
    };

    useEffect(() => {
        fetchBooks(userId);
    }, []);
    const handleSubmit = async(e) => {
        e.preventDefault();

        // Create form data without parsing on the frontend
        const formData = new FormData();
        formData.append('title', bookDetails.title);
        formData.append('author', bookDetails.author);
        formData.append('genre', bookDetails.genre);
        formData.append('publishingYear', bookDetails.publishingYear); // Send as is
        formData.append('availabilityStatus', bookDetails.availabilityStatus);
        if (bookDetails.image) {
            formData.append('bookImages', bookDetails.image);
        }

        try{
            const response = await fetch(`http://localhost:3000/upload-books`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok){
                throw new Error(data.message || 'Failed to add the book')
            }
            setSuccessMessage(data.message);
            setBooks((prevBooks) => [...prevBooks, data]);
            closeModal();
        }catch(error){
            console.error(error);
            setError(error.message);
        }
    }
    
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

    return (
        <div>
            <h1>Admin Home Page</h1>
            <h1>{user && isAuthenticated ? `Welcome back, ${user.firstName}` : 'Loading...'}</h1>
            <button onClick={handleLogout}>Log out</button>
            <button onClick={openModal}>Add Book</button>

            {isModalOpen && (
                <div className='modal-overlay' onClick={closeModal}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <h2>Add a New Book</h2>
                        {error && <p style={{color: 'red'}}>{error}</p>}
                        {successMessage && <p style={{color: 'green'}}>{successMessage}</p>}
                        <form onSubmit={handleSubmit}>
                            <label>Title: 
                                <input type='text' name="title" value={bookDetails.title} onChange={handleInputChange} required/>
                            </label>
                            <label>Author: 
                                <input type='text' name="author" value={bookDetails.author} onChange={handleInputChange} required/>
                            </label>
                            <label>Genre: 
                                <input type='text' name="genre" value={bookDetails.genre} onChange={handleInputChange} required/>
                            </label>
                            <label>Publishing Year:
                                <input type='number' name="publishingYear" value={bookDetails.publishingYear} onChange={handleInputChange} />
                            </label>
                            <label>Availability Status: 
                                <select name='availabilityStatus' value={bookDetails.availabilityStatus} onChange={handleInputChange}>
                                    <option value="true">Available</option>
                                    <option value="false">Unavailable</option>
                                </select>
                            </label>
                            <label>
                                Image(optional): 
                                <input type='file' name="image" onChange={handleFileChange} accept='image/*'/>
                            </label>
                            <button type='submit'>Add Book</button>
                            <button type='button' onClick={closeModal}>Cancel</button>
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
                    </div>
                ))}
            </div>
        </div>
    )
}
export default AdminHomePage