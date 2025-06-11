module.exports = function checkRole(role) {
  return function (req, res, next) {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
  };
};
