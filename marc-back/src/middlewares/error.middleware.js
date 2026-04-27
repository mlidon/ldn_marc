export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;

  if (status >= 500) {
    console.error(err);
  } else {
    console.warn(`${status} - ${err.message}`);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      ok: false,
      message: 'Ya existe un registro con ese valor único',
    });
  }

  res.status(status).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
  });
}