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
    const {user, isAuthenticated, logout} = useAuth();
    const [searchQuery, setSearchQuery] = useState({ title: '', genre: '', author: '', dateRange: '' });
    const navigate = useNavigate();

    const fetchBooks = async (queryParams = '') => {
        try {
            const response = await fetch(`http://localhost:3000/get-books${queryParams}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const data = await response.json();
            setBooks(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching books: ', error);
            setError(error.message);
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!user || !isAuthenticated) {
            navigate('/'); // Redirect to /home if the user is authenticated
            return;
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

    const handleProfileClick = () => {
        navigate(`/user/${user.id}`); // Navigate to the user's profile page
    };

    const handleSearchChange = (e) => {
        setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        let { dateRange, ...otherQueries } = searchQuery;

        // Map the date range to startYear and endYear
        let startYear, endYear;
        if (dateRange === '<1800') {
            endYear = 1799;
        } else if (dateRange === '1801-1900') {
            startYear = 1801;
            endYear = 1900;
        } else if (dateRange === '1901-2000') {
            startYear = 1901;
            endYear = 2000;
        } else if (dateRange === '2001-2020') {
            startYear = 2001;
            endYear = 2020;
        } else if (dateRange === '2020+') {
            startYear = 2021;
        }

        // Build query string from other fields and date range
        const queryParams = Object.entries(otherQueries)
            .filter(([key, value]) => value.trim()) // Include only non-empty fields
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        // Add startYear and endYear to the query
        const dateParams = [
            startYear ? `startYear=${startYear}` : null,
            endYear ? `endYear=${endYear}` : null,
        ]
            .filter(Boolean)
            .join('&');

        // Combine both query strings
        const fullQuery = [queryParams, dateParams].filter(Boolean).join('&');

        fetchBooks(fullQuery ? `?${fullQuery}` : '');
    };

    const handleBorrowBook = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:3000/books/${bookId}/borrow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Include cookies for authentication
            });
    
            if (!response.ok) {
                throw new Error("Failed to borrow book");
            }
    
            const data = await response.json();
            alert(data.message); // Notify the user of success
    
            // Refresh books to update availability status
            fetchBooks();
        } catch (error) {
            console.error("Error borrowing book:", error);
        }
    };


return(
    <div>
        <div className="header">
            <h1>
                {user && isAuthenticated ? `Welcome back, ${user.firstName}` : 'Loading...'}
            </h1>
            <div className="header-right">
                <button className="logout-button" onClick={handleLogout}>
                    Log out
                </button>
                <div className="profile-icon" onClick={handleProfileClick}>
                    {user?.firstName?.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>

         <button onClick={handleLogout}>Log out</button>
         <h1>Books Available</h1>
         <div className="search-bar">
            <input
                type="text"
                name="title"
                placeholder="Search by Title"
                value={searchQuery.title}
                onChange={handleSearchChange}
            />
            <input
                type="text"
                name="genre"
                placeholder="Search by Genre"
                value={searchQuery.genre}
                onChange={handleSearchChange}
            />
            <input
                type="text"
                name="author"
                placeholder="Search by Author"
                value={searchQuery.author}
                onChange={handleSearchChange}
            />
            <select
                    name="dateRange"
                    value={searchQuery.dateRange}
                    onChange={handleSearchChange}
            >
                    <option value="">Select Date Range</option>
                    <option value="<1800">Before 1800</option>
                    <option value="1801-1900">1801 - 1900</option>
                    <option value="1901-2000">1901 - 2000</option>
                    <option value="2001-2020">2001 - 2020</option>
                    <option value="2020+">After 2020</option>
            </select>
            <button onClick={handleSearch}>Search</button>
         </div>
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
                    <p>Status: {book.availabilityStatus ? "Available" : "Not Available"}</p>
                    {book.availabilityStatus && (
                        <button onClick={() => handleBorrowBook(book.id)}>Borrow</button>
                    )}
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