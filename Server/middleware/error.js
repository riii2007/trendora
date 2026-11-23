exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (err.code === 11000) { status = 400; message = 'Duplicate value, already exists'; }
  if (err.name === 'ValidationError' || err.name === 'MulterError') { status = 400; }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
