const express = require('express');
const cors = require('cors');
const path = require('path'); 
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cross-Origin-Opener-Policy', 'unsafe-none');
  }
}));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const submissionRoutes = require('./routes/submissionRoutes');
app.use('/api/submissions', submissionRoutes);

const voteRoutes = require('./routes/voteRoutes');
app.use('/api/votes', voteRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const jamRoutes = require('./routes/jamRoutes');
app.use('/api/jams', jamRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const followRoutes = require('./routes/followRoutes');
app.use('/api/users', followRoutes);

const tagRoutes = require('./routes/tagRoutes');
app.use('/api/tags', tagRoutes);


app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});
app.get('/', (req, res) => {
  res.json({
    message: 'ArtJam API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (requires auth token)'
      },
      submissions: {
        list: 'GET /api/submissions',
        create: 'POST /api/submissions (requires auth + image)',
        detail: 'GET /api/submissions/:id',
        update: 'PUT /api/submissions/:id (requires auth)',
        delete: 'DELETE /api/submissions/:id (requires auth)'
      },
      votes: {
        cast: 'POST /api/votes (requires auth)',
        get: 'GET /api/votes/submission/:submission_id',
        myVotes: 'GET /api/votes/user/me (requires auth)',
        delete: 'DELETE /api/votes/:id (requires auth)'
      },
      comments: {
        create: 'POST /api/comments (requires auth)',
        get: 'GET /api/comments/submission/:submission_id',
        update: 'PUT /api/comments/:id (requires auth)',
        delete: 'DELETE /api/comments/:id (requires auth)'
      },
      jams: {
        create: 'POST /api/jams (requires auth)',
        list: 'GET /api/jams',
        detail: 'GET /api/jams/:id',
        update: 'PUT /api/jams/:id (requires auth)',
        delete: 'DELETE /api/jams/:id (requires auth)'
      }
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;