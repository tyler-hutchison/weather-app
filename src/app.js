const express = require('express');
// const routes = require('./routes/routes');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api', routes);

module.exports = app;