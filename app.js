const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const path = require('path');

// Initialization of express application
const app = express();

app.use(express.json({ extended: true }));

// подключаю middlewares
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/link', require('./routes/link.routes'));
app.use('/t', require('./routes/redirect.routes'));

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = config.get('port') || 5000;

async function start() {
  try {
    await mongoose.connect(config.get('mongoUrl'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } catch (error) {
    console.log(`Server Error`, error.message);
    process.exit(1);
  }
}

start();

const server = app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});

// app.метод(маршрут, функция)
