const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config();

const auth = require('./routes/api/auth');
const profile = require('./routes/api/profile');
const question = require('./routes/api/question');
const answer = require('./routes/api/answer');
const search = require('./routes/api/search');
const notification = require('./routes/api/notification');
const admin = require('./routes/api/admin');
// const upload = require('./routes/api/upload');

// const notify = require('./functions/Notify');
//      triggeredBy, reaction,  type,          link,             triggeredFor
// notify('John Dee', 'Liked', 'Question', 'link/to/notification', 'Dakup Nengak');

const app = express();

// Enable cors middleware
app.use(cors());

// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').localURI;

// Connect to the mongodb
mongoose.connect(process.env.mongoURI || db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Passport Middleware
app.use(passport.initialize());
// Passport Config
require('./config/passport')(passport);

// Use Routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/question', question);
app.use('/api/answer', answer);
app.use('/api/search', search);
app.use('/api/notification', notification);
app.use('/api/admin', admin);
// app.use('/api/upload', upload);
app.use(express.static('public'));

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`App has Started on port ${port}`);
});
