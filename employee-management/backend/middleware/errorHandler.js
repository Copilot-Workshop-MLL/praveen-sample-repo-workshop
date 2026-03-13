function errorHandler(err, req, res, next) {
  // Log full stack trace in development only
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.status || 500} - ${err.message}`);
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
}

module.exports = errorHandler;
