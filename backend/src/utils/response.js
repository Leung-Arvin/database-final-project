exports.success = (res, data, message = null, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
};

exports.error = (res, message = 'Error', status = 500) => {
  return res.status(status).json({
    success: false,
    error: message,
  });
};