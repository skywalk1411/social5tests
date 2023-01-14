const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
app.set('view engine', 'ejs');
const CommentRoutes = require('./router');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'blablabla1',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*100},
  }));
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${(req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '').split(',')[0].trim()}`, req.protocol, req.method, req.url);
    next();
});
app.use('/', express.static('public'))
app.get('/', async function (req, res) {
    res.render('home/home', { received: { title: 'empty', message: 'empty' }, imagez: 'empty.png', imagez2: 'logo.png' })
});
app.use('/api',CommentRoutes.CommentRoutes);

app.listen(3002);