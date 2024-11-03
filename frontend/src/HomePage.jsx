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
    const {user, isAuthenticated, logout} = useAuth()
    const navigate = useNavigate()

    const userId = user.id
    useEffect(() => {
        if (!user || !isAuthenticated) {
            navigate('/'); // Redirect to /home if the user is authenticated
            return;
        }
        const fetchBooks = async(userId) => {
            try{
                const response = await fetch(`http://localhost:3000/get-books?userId=${userId}`, {
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
        fetchBooks(userId);
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
    const handleLikeToggle = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:3000/books/${bookId}/toggle-like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }), // Send userId with the request
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
                </div>
            ))}
         </div>
    </div>
)
}
export default HomePage;