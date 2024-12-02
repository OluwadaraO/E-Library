require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinaryName = process.env.CLOUDINARY_NAME;
const cloudinaryAPIKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryKey = process.env.CLOUDINARY_KEY;

const nodeEnv = process.env.NODE_ENV;

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"], // Allow frontend origin
        methods: ["GET", "POST"],
        credentials: true,

    },
});
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const multer = require('multer');
const PORT = process.env.PORT;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pexelsAPI = process.env.PEXELS_API;
const saltRounds = 14;
const secretKey = process.env.JWT_SECRET_TOKEN;

const frontendAddress = process.env.FRONTEND_ADDRESS

cloudinary.config({
    cloud_name: cloudinaryName,
    api_key: cloudinaryAPIKey,
    api_secret: cloudinaryKey,
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder: 'book_images',
        allowed_formats: ['jpg', 'png'],
    },
});
const upload = multer({storage: storage})
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());  
app.use(cors({origin: `${frontendAddress}`,
            credentials: true }));

const deleteOldNotifications = async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Delete notifications older than 7 days
        const deleted = await prisma.notification.deleteMany({
            where: {
                createdAt: { lt: sevenDaysAgo },
            },
        });

        console.log(
            `Old notifications cleanup ran at ${new Date().toISOString()} - Deleted ${deleted.count} notifications`
        );
    } catch (error) {
        console.error('Error deleting old notifications:', error);
    }
};

// Schedule the task to run every day at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Starting daily notification cleanup task...');
    deleteOldNotifications();
});

// Run this function every 24 hours
setInterval(deleteOldNotifications, 24 * 60 * 60 * 1000);

app.post('/sign-up', async(req, res) => {
    const {firstName, lastName, schoolID, userName, password} = req.body;
    try{
        const existingUser = await prisma.user.findUnique({
            where: {userName}
        });
        if (existingUser){
            return res.status(400).json({message:`Oops! ${existingUser.firstName} already has an account!`});
        };
        const hashed = await bcrypt.hash(password, saltRounds);
        const newUserAccount = await prisma.user.create({
            data:{
                firstName,
                lastName,
                schoolID,
                userName,
                password: hashed
            }
        });
        res.status(201).json({message: `${newUserAccount.firstName}, your account has been created!`})
    }
    catch(error){
        console.error(`Error posting data: `, error);
        res.status(500).json({error})
    }
});

app.post('/admin-sign-up', async(req, res) => {
    const {firstName, lastName, userName, password} = req.body;
    try{
        const existingUser = await prisma.admin.findUnique({
            where: {userName}
        })
        if (existingUser){
            return res.status(400).json({message:`Oops! ${existingUser.firstName} already has an account!`});
        }
        const hashed = await bcrypt.hash(password, saltRounds);
        const newUserAccount = await prisma.admin.create({
            data:{
                firstName,
                lastName,
                userName,
                password: hashed
            }
        });
        res.status(201).json({message: `${newUserAccount.firstName}, your account has been created!`})
    }catch(error){
        console.error(`Error posting data: `, error);
        res.status(500).json({error})
    }
})

app.post('/login', async(req, res) => {
    const {userName, password} = req.body;
    try{
        const user = await prisma.user.findUnique({
            where: {userName}
        })
        if (!user){
            return res.status(400).json({message: 'Username not found. Please try a different one!'});
        }
        const matched = await bcrypt.compare(password, user.password);
        if(!matched){
            return res.status(400).json({message: 'Wrong password and username. Please try again'})
        }
        else{
            const token = jwt.sign({id: user.id}, secretKey, {expiresIn: '24h'})
            res.cookie('token', token, {
                httpOnly: true,
                secure: nodeEnv === 'production',
                sameSite: 'strict',
                maxAge: 86400000,
            })

            res.status(200).json({token, user})
        }
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Failed to log into your account. Please try again"})
    }
})

app.post('/admin-login', async(req, res) => {
    const {userName, password} = req.body;
    try{
        const user = await prisma.admin.findUnique({
            where: {userName}
        })
        if (!user){
            return res.status(400).json({message: 'Username not found. Please try a different one!'});
        }
        const matched = await bcrypt.compare(password, user.password);
        if (!matched){
            return res.status(400).json({message: 'Wrong password and username. Please try again'})
        }
        else{
            const token = jwt.sign({id: user.id}, secretKey, {expiresIn: '24h'})
            res.cookie('token', token, {
                httpOnly: true,
                secure: nodeEnv === 'production',
                sameSite: 'strict',
                maxAge: 86400000,
            })
            res.status(200).json({token, user})
        }
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Failed to log into your account. Please try again"})
    }
})

app.get('/protected', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json(" No token found, authorization denied")
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } })
        if (!user) {
            res.status(401).json({ message: "User not found" })
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(401).json("Oops! Token is not valid")
    }
});

app.get('/admin-protected', async(req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json(" No token found, authorization denied")
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        const user = await prisma.admin.findUnique({ where: { id: decoded.id } })
        if (!user) {
            res.status(401).json({ message: "Admin not found" })
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(401).json("Oops! Token is not valid")
    }
})

app.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json("Logged out successfully")
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.userId = decoded.id; // Attach userId to the request object
        next();
    });
};

const fetchRandomPhoto = async() => {
    try{
        const response = await fetch(`https://api.pexels.com/v1/search?query=random&per_page=1&page=${Math.floor(Math.random() * 100) + 1}`, {
            headers:{
                Authorization: pexelsAPI,
            },
        });
        const data = await response.json();
        if (!response.ok){
            throw new Error(`Error fetching data: ${data.error}`)
        }
        else{
            return data.photos[0].src.original;
        }
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Failed to get image' })
    }
}

// Toggle like for a book
app.post('/books/:id/toggle-like', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // Ensure userId is an integer

    try {
        const book = await prisma.book.findUnique({ where: { id: parseInt(id, 10) } });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        // Check if the user has already liked this book
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_bookId: {
                    userId: userId,
                    bookId: parseInt(id, 10),
                },
            },
        });

        let updatedBook;

        if (existingLike) {
            // If the like exists, remove it (unlike)
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });

            // Decrement likes, but ensure it does not go below zero
            updatedBook = await prisma.book.update({
                where: { id: parseInt(id, 10) },
                data: {
                    likes: {
                        decrement: 1,
                    },
                },
            });

            // Ensure likes is not negative
            if (updatedBook.likes < 0) {
                updatedBook = await prisma.book.update({
                    where: { id: parseInt(id, 10) },
                    data: {
                        likes: 0,
                    },
                });
            }
        } else {
            // If the like doesn’t exist, create it (like)
            await prisma.like.create({
                data: {
                    userId: userId,
                    bookId: parseInt(id, 10),
                },
            });
            updatedBook = await prisma.book.update({
                where: { id: parseInt(id, 10) },
                data: {
                    likes: {
                        increment: 1,
                    },
                },
            });

            await prisma.notification.create({
                data: {
                    userId: userId,
                    message: `You added the book "${book.title}" to your liked books!`,
                    type: 'liked',
                },
            });
    }

        res.status(200).json({ likes: updatedBook.likes, liked: !existingLike });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Failed to toggle like' });
    }
});

app.post('/upload-books', upload.single('bookImages'), async (req, res) => {
    
    const { title, author, genre, description } = req.body;
    let publishingYear = parseInt(req.body.publishingYear, 10);
    let availabilityStatus = req.body.availabilityStatus === 'true';

    try {
        // Validate publishingYear
        if (isNaN(publishingYear)) {
            return res.status(400).json({ message: 'Publishing year must be a valid integer.' });
        }

        const newBook = await prisma.book.create({
            data: {
                title,
                author,
                genre,
                description: description || '', // Provide default empty string
                publishingYear,
                availabilityStatus,
                image: req.file ? req.file.path : await fetchRandomPhoto()
            },
        });

        const notification = {
            id: newBook.id,
            message: `A new book "${newBook.title}" has been added to the library!`,
            type: 'new-book',
            read: false,
        }

        await prisma.notification.create({
            data: {
                message: notification.message,
                type: notification.type,
                userId: null,
                read: false,
            },
        });

        const admin_notification = await prisma.adminNotification.create({
            data: {
                message: `A new book "${newBook.title}" has been added to the library.`,
                type: 'book-add',
                adminId: null,
            },
        });

        // Emit WebSocket notification to connected admins
        io.emit('adminNotification', admin_notification);

        io.emit('newBook', notification)

        console.log('Notification emitted:', newBook.title);

        res.status(201).json({newBook});
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ message: 'Failed to add this book. Please try again' });
    }
});



app.get('/get-books', authenticateToken, async (req, res) => {
    const { title, genre, author, startYear, endYear  } = req.query; // Extract search parameters
    const userId = req.userId; // Get the userId from the token

    try {
        // Build dynamic filters for search
        const filters = {
            AND: [
                title ? { title: { contains: title, mode: 'insensitive' } } : {},
                genre ? { genre: { contains: genre, mode: 'insensitive' } } : {},
                author ? { author: { contains: author, mode: 'insensitive' } } : {},
                startYear ? { publishingYear: { gte: parseInt(startYear, 10) } } : {},
                endYear ? { publishingYear: { lte: parseInt(endYear, 10) } } : {},
            ],
        };

        // Retrieve books with the applied filters and like counts
        const books = await prisma.book.findMany({
            where: filters,
            include: {
                _count: {
                    select: { Like: true }, // Get the total count of likes for each book
                },
            },
        });

        // Check if the current user has liked each book
        const booksWithLikeStatus = await Promise.all(
            books.map(async (book) => {
                const liked = await prisma.like.findFirst({
                    where: {
                        userId: userId,
                        bookId: book.id,
                    },
                });
                return {
                    ...book,
                    likes: book._count.Like,
                    liked: !!liked, // `liked` will be true if the user has liked the book
                };
            })
        );

        res.status(200).json(booksWithLikeStatus);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Failed to fetch books' });
    }
});

app.get('/user/:id', authenticateToken, async (req, res) => {
    try {
        // Ensure the user is accessing their own profile
        if (parseInt(req.params.id) !== req.userId) {
            return res.status(403).json({ message: 'Access forbidden: You can only access your own profile' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId }, // Use req.userId from the middleware
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Return an error if the user doesn't exist
        }

        res.status(200).json(user); // Send the user data as JSON
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});

app.post('/books/:id/borrow', authenticateToken, async (req, res) => {
    const { id } = req.params; // Book ID
    const userId = req.userId; // Authenticated user's ID

    try {
        // Check if the book is available
        const book = await prisma.book.findUnique({
            where: { id: parseInt(id) },
        });

        if (!book || !book.availabilityStatus) {
            return res.status(400).json({ message: 'Book is not available for borrowing' });
        }

        // Mark the book as unavailable and create a BorrowedBook entry
        const borrowedBook = await prisma.borrowedBook.create({
            data: {
                userId: userId,
                bookId: parseInt(id),
                returnDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
            },
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        // Update the book's availability status
        await prisma.book.update({
            where: { id: parseInt(id) },
            data: { availabilityStatus: false },
        });

        await prisma.notification.create({
            data: {
                userId,
                message: `You borrowed "${book.title}". Return it in 30 days.`,
                type: 'borrowed',
            },
        });

        const notification = await prisma.adminNotification.create({
            data: {
                message: `${user.firstName} borrowed the book "${book.title}".`,
                type: 'book-borrow',
                adminId: null,
            },
        });

        // Emit WebSocket notification to connected admins
        io.emit('adminNotification', notification);

        res.status(201).json({ message: 'Book borrowed successfully', borrowedBook });
    } catch (error) {
        console.error('Error borrowing book:', error); // Log the actual error
        res.status(500).json({ message: 'Failed to borrow the book' });
    }
});




app.put('/books/:id', async (req, res) => {
    const { id } = req.params;
    
    
    const { title, author, genre, description, publishingYear, availabilityStatus } = req.body;

    try {
        const updatedBook = await prisma.book.update({
            where: { id: parseInt(id, 10) },
            data: {
                title,
                author,
                genre,
                publishingYear: parseInt(publishingYear, 10),
                availabilityStatus: Boolean(availabilityStatus),
                description: description || '',
            },
        });

        const notification = await prisma.adminNotification.create({
            data: {
                message: `The book "${updatedBook.title}" has been updated.`,
                type: 'book-update',
                adminId: null,
            },
        });

        // Emit WebSocket notification to connected admins
        io.emit('adminNotification', notification);
        res.status(200).json(updatedBook);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Failed to update book' });
    }
});

app.get('/user/:id/borrowed-books', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // Ensure the user can only access their own borrowed books
    if (parseInt(id) !== req.userId) {
        return res.status(403).json({ message: "Access forbidden: You can only view your own borrowed books" });
    }

    try {
        const borrowedBooks = await prisma.borrowedBook.findMany({
            where: { userId: parseInt(id, 10) },
            include: { book: true }, // Include book details
        });

        if (!borrowedBooks.length) {
            return res.status(200).json([]); // Return an empty array
        }

        // Calculate daysLeft for each borrowed book
        const booksWithDaysLeft = borrowedBooks.map((borrowedBook) => {
            const daysLeft = Math.max(
                Math.ceil((new Date(borrowedBook.returnDueDate) - new Date()) / (1000 * 60 * 60 * 24)),
                0
            );
            return {
                ...borrowedBook,
                daysLeft,
            };
        });

        res.status(200).json(booksWithDaysLeft);
    } catch (error) {
        console.error("Error fetching borrowed books:", error);
        res.status(500).json({ message: "Failed to fetch borrowed books" });
    }
});


app.put('/user/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, schoolID, userName } = req.body;

    if (parseInt(id) !== req.userId) {
        return res.status(403).json({ message: "You can only edit your own profile." });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                firstName,
                lastName,
                schoolID,
                userName,
            },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Failed to update user information." });
    }
});


app.get('/user/:id/liked-books', authenticateToken, async (req, res) => {
    const { id } = req.params;

    if (parseInt(id) !== req.userId) {
        return res.status(403).json({ message: "You can only view your own liked books." });
    }

    try {
        const likedBooks = await prisma.like.findMany({
            where: { userId: parseInt(id) },
            include: { book: true }, // Include book details
        });

        res.status(200).json(likedBooks);
    } catch (error) {
        console.error("Error fetching liked books:", error);
        res.status(500).json({ message: "Failed to fetch liked books." });
    }
});

app.get('/admin/notifications', authenticateToken, async (req, res) => {
    const adminId = req.userId; // Authenticated admin's ID

    try {
        // Fetch admin-specific and global notifications
        const adminNotifications = await prisma.adminNotification.findMany({
            where: {
                OR: [
                    { adminId: adminId }, // Specific to the authenticated admin
                    { adminId: null },    // Global notifications
                ],
            },
            orderBy: { createdAt: 'desc' }, // Sort by newest first
        });

        res.status(200).json(adminNotifications);
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        res.status(500).json({ message: 'Failed to fetch admin notifications' });
    }
});





app.get('/user/:id/notifications', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // Validate that the user is only fetching their own notifications
    if (parseInt(id, 10) !== req.userId) {
        return res.status(403).json({ message: "Access forbidden: You can only view your own notifications." });
    }

    try {
        // Fetch user-specific notifications and global notifications
        const userNotifications = await prisma.notification.findMany({
            where: {
                userId: parseInt(id, 10),
            },
            orderBy: { createdAt: 'desc' },
        });

        const globalNotifications = await prisma.notification.findMany({
            where: { userId: null },
            orderBy: { createdAt: 'desc' },
        });

        // Combine both notifications
        const notifications = [
            ...userNotifications,
            ...globalNotifications,
        ];

        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
});



app.patch('/notifications/:id/toggle-read', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await prisma.notification.findUnique({ where: { id: parseInt(id, 10) } });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Skip userId check for global notifications
        if (notification.userId !== null && notification.userId !== req.userId) {
            return res.status(403).json({ message: "You don't have access to this notification" });
        }

        // Handle global notifications
        if (notification.userId === null) {
            // Check if GlobalNotificationRead entry exists
            const globalNotificationRead = await prisma.globalNotificationRead.findUnique({
                where: {
                    userId_notificationId: {
                        userId: req.userId,
                        notificationId: notification.id,
                    },
                },
            });

            if (globalNotificationRead) {
                // Toggle the read status for the global notification
                const updatedGlobalNotificationRead = await prisma.globalNotificationRead.update({
                    where: {
                        id: globalNotificationRead.id,
                    },
                    data: {
                        read: !globalNotificationRead.read,
                    },
                });

                return res.status(200).json(updatedGlobalNotificationRead);
            } else {
                // If entry doesn't exist, create one and mark it as read
                const newGlobalNotificationRead = await prisma.globalNotificationRead.create({
                    data: {
                        userId: req.userId,
                        notificationId: notification.id,
                        read: true,
                    },
                });

                return res.status(200).json(newGlobalNotificationRead);
            }
        }

        // Handle user-specific notifications
        const updatedNotification = await prisma.notification.update({
            where: { id: parseInt(id, 10) },
            data: { read: !notification.read },
        });

        res.status(200).json(updatedNotification);
    } catch (error) {
        console.error('Error toggling read status:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
});


app.delete('/notifications/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await prisma.notification.findUnique({ where: { id: parseInt(id, 10) } });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if it's a global notification
        if (notification.userId === null) {
            // Mark the global notification as deleted for the user
            const globalNotificationRead = await prisma.globalNotificationRead.findUnique({
                where: {
                    userId_notificationId: {
                        userId: req.userId,
                        notificationId: notification.id,
                    },
                },
            });

            if (!globalNotificationRead) {
                return res.status(404).json({ message: 'Global notification read status not found' });
            }

            // Soft delete the notification for the user
            await prisma.globalNotificationRead.update({
                where: { id: globalNotificationRead.id },
                data: { deleted: true },
            });

            return res.status(200).json({ message: 'Global notification marked as deleted for the user' });
        }

        // Handle user-specific notifications
        if (notification.userId !== req.userId) {
            return res.status(403).json({ message: "You don't have access to this notification" });
        }

        // Delete the user-specific notification
        await prisma.notification.delete({ where: { id: parseInt(id, 10) } });

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
});

// Fetch admin profile
app.get('/admin/profile', authenticateToken, async (req, res) => {
    try {
        const admin = await prisma.admin.findUnique({
            where: { id: req.userId }, // Use the authenticated admin's ID
        });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json(admin); // Return the admin's data
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Failed to fetch admin profile' });
    }
});

// Update admin profile
app.put('/admin/profile', authenticateToken, async (req, res) => {
    const { firstName, lastName, userName } = req.body;

    try {
        const updatedAdmin = await prisma.admin.update({
            where: { id: req.userId }, // Use the authenticated admin's ID
            data: {
                firstName,
                lastName,
                userName,
            },
        });

        res.status(200).json(updatedAdmin); // Return the updated admin data
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ message: 'Failed to update admin profile' });
    }
});

app.post('/books/:id/return', authenticateToken, async (req, res) => {
    const { id } = req.params; // Book ID
    const userId = req.userId; // Authenticated user's ID

    try {
        // Find the borrowed book record
        const borrowedBook = await prisma.borrowedBook.findFirst({
            where: {
                bookId: parseInt(id),
                userId: userId,
            },
            include: {
                book: true, // Include book details in the result
            },
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!borrowedBook) {
            return res.status(404).json({ message: 'Borrowed book record not found' });
        }

        // Update the book to make it available again
        await prisma.book.update({
            where: { id: parseInt(id) },
            data: { availabilityStatus: true },
        });

        // Delete the borrowed book record
        await prisma.borrowedBook.delete({
            where: { id: borrowedBook.id },
        });

        // Create a notification for the user
        await prisma.notification.create({
            data: {
                message: `You have successfully returned the book "${borrowedBook.book.title}".`,
                type: 'return',
                userId: userId, // Associate the notification with the user
            },
        });

        const notification = await prisma.adminNotification.create({
            data: {
                message: `${user.firstName} returned the book "${borrowedBook.book.title}".`,
                type: 'book-return',
                adminId: null,
            },
        });

        // Emit WebSocket notification to connected admins
        io.emit('adminNotification', notification);

        res.status(200).json({ message: 'Book returned successfully' });
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({ message: 'Failed to return the book' });
    }
});


app.patch('/admin/notifications/:id/toggle-read', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await prisma.adminNotification.findUnique({ where: { id: parseInt(id, 10) } });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const updatedNotification = await prisma.adminNotification.update({
            where: { id: parseInt(id, 10) },
            data: { read: !notification.read },
        });

        res.status(200).json(updatedNotification);
    } catch (error) {
        console.error('Error toggling read status:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
});


app.delete('/admin/notifications/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await prisma.adminNotification.findUnique({ where: { id: parseInt(id, 10) } });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await prisma.adminNotification.delete({
            where: { id: parseInt(id, 10) },
        });

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
});

server.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });