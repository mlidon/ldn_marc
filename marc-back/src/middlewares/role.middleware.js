export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      const error = new Error('No autenticado');
      error.status = 401;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error('No autorizado');
      error.status = 403;
      return next(error);
    }

    next();
  };
}