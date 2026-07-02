const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const geographyRoutes = require('./routes/geography');
const floodRoutes = require('./routes/flood');
const populationRoutes = require('./routes/population');
const streetRoutes = require('./routes/street');
const dashboardRoutes = require('./routes/dashboard');
const priorityRoutes = require('./routes/priority');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/geo', geographyRoutes);
app.use('/api/flood', floodRoutes);
app.use('/api/population', populationRoutes);
app.use('/api/street', streetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/priority', priorityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`LIKAS Backend Server running on port ${PORT}`);
});
