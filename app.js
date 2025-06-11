require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth'); // JWT verify karega

const app = express();



app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // JWT cookie ko read karne ke liye
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(authRoutes)



// 1. MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// 2. Note Model (userId include kiya)
const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  userId: String, // important!
});
const Note = mongoose.model('Note', noteSchema);

// 3. Dashboard - Protected
app.get('/', authMiddleware, async (req, res) => {
  const notes = await Note.find({ userId: req.userId }); // Sirf usi user ke notes
  res.render('index', { notes });
});

// 4. Add Note - Protected
app.post('/add', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  await Note.create({ title, content, userId: req.userId });
  res.redirect('/');
});

// 5. Edit Note - Protected
app.get('/edit/:id', authMiddleware, async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
  res.render('edit', { note });
});

app.post('/update/:id', authMiddleware, async (req, res) => {
  await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { title: req.body.title, content: req.body.content }
  );
  res.redirect('/');
});

// 6. Delete Note - Protected
app.post('/delete/:id', authMiddleware, async (req, res) => {
  await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

