import './HomePage.css'
import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Authentication";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
function HomePage(){
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const {user, isAuthenticated, logout} = useAuth()
    const navigate = useNavigate()
    useEffect(() => {
        if (!user || !isAuthenticated) {
            navigate('/'); // Redirect to /home if the user is authenticated
            return;
        }
        const fetchBooks = async() => {
            try{
                const response = await fetch(`http://localhost:3000/get-books`, {
                    method: 'GET',
                    headers:  { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })
                const data = await response.json();
                setBooks(data);
                setLoading(false)
            }catch(error){
                console.error('Error fetching books: ', error)
                setError(error.message);
                setLoading(false)
            }
        }
        fetchBooks();
    }, [user, navigate, isAuthenticated])

    if (loading) {
        return <p>Loading books...</p>
    }
    
    if (error) {
        return <p>{error}</p>
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

    const openModal = (book) => {
        setSelectedBook(book);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedBook(null);
        setIsModalOpen(false);
    };


    const handleLikeToggle = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:3000/books/${bookId}/toggle-like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',// Send userId with the request
            });
            const data = await response.json();

            // Update the likes count and toggle the liked state in the frontend
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === bookId
                        ? { ...book, likes: data.likes, liked: data.liked }
                        : book
                )
            );
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };


return(
    <div>
         <h1>{user && isAuthenticated? `Welcome back, ${user.firstName}` : 'Loading...'} </h1>
         <button onClick={handleLogout}>Log out</button>
         <h1>Books Available</h1>
         <div className="book-list">
            {books.map(book => (
                <div className="book-item" key={book.id}>
                    <img src={book.image} alt={book.title} className="book-image"/>
                    <h2>{book.title}</h2>
                    <p>Author: {book.author}</p>
                    <p>Genre: {book.genre}</p>
                    <p>Published: {book.publishingYear}</p>
                    <p className='like'>Likes: {book.likes}</p>
                    <FontAwesomeIcon
                        icon={book.liked ? solidHeart : regularHeart}
                        onClick={() => handleLikeToggle(book.id)}
                        style={{
                            color: book.liked ? 'red' : 'black',
                            cursor: 'pointer',
                            fontSize: '24px',
                        }}
                        />
                    <button onClick={() => openModal(book)}>View Details</button>
                </div>
            ))}
         </div>
         {isModalOpen && selectedBook && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedBook.image} alt={selectedBook.title} className="modal-book-image" />
                        <div className="modal-book-details">
                            <h2>{selectedBook.title}</h2>
                            <p><strong>Genre:</strong> {selectedBook.genre}</p>
                            <p><strong>Published:</strong> {selectedBook.publishingYear}</p>
                            <p><strong>Description: </strong> {selectedBook.description}</p>
                        </div>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
    </div>
)
}
export default HomePage;