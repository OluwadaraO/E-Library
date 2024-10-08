require('dotenv').config();
const express = require('express');
const app = express();

const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinaryName = process.env.CLOUDINARY_NAME;
const cloudinaryAPIKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryKey = process.env.CLOUDINARY_KEY;

const nodeEnv = process.env.NODE_ENV;

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

app.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json("Logged out successfully")
});

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

app.post('/upload-books', upload.single('bookImages'), async(req, res) => {
    const {title, author, genre, publishingYear, availabilityStatus} = req.body;
    try{
        const existingBook = await prisma.book.findUnique({
            where: {title}
        })
        if (existingBook){
            res.status(400).json({message: "Oops! Book has already been added"})
        }
        let imageUrl;
        if (req.file) {
            imageUrl = req.file.path
        }
        else if (!req.file) {
            imageUrl = await fetchRandomPhoto();
        }
        const newBook = await prisma.book.create({
            data:{
                title,
                author,
                image: imageUrl,
                genre,
                publishingYear,
                availabilityStatus
            }
        })
        res.status(201).json({message: `${newBook.title}, book has been added!`})
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Failed to add this book. Please try again"})
    }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});