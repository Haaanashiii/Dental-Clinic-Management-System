module.exports = errorHandler = (err, req, res, next) => {
    if (err) {
      if (err.message) {
        res.status(400).json({
          status: "Something went wrong",
          error: err.message,
        });
      } else {
        res.status(400).json({
          status: "Something went wrong",
          error: err,
        });
      }
    } else {
      next();
    }
  };
   