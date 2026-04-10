// Wraps async route handlers — no more try/catch in every controller
const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

module.exports = catchAsync;
