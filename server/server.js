const app = require('./app');
const { sequelize, testConnection } = require('./config/database');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log(' Starting ArtJam Server...');
  console.log('====================================');
  
  const connected = await testConnection();
  if (!connected) {
    console.error(' Server cannot start without database');
    process.exit(1);
  }

  try {
    await sequelize.sync({ alter: true });
    console.log(' Database synced - tables created/updated');
  } catch (error) {
    console.error(' Database sync failed:', error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('====================================');
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('====================================');
  });
};

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();