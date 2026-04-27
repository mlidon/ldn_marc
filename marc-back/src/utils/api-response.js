export function ok(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({
    ok: true,
    message,
    data,
  });
}

export function fail(message = 'Error', status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}