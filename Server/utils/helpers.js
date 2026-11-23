// wrapper so we don't need try/catch in every controller
exports.asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// create an error with a status code
exports.createError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};
