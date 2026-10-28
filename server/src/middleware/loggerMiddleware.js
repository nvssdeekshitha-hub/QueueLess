/**
 * Custom request logger middleware
 * Demonstrates Express middleware request processing and performance timing
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const userRole = req.user ? `[${req.user.role}:${req.user._id}]` : '[Guest]';
    
    // Choose console level based on HTTP status
    if (statusCode >= 500) {
      console.error(`[HTTP] ${method} ${originalUrl} ${statusCode} - ${duration}ms ${userRole}`);
    } else if (statusCode >= 400) {
      console.warn(`[HTTP] ${method} ${originalUrl} ${statusCode} - ${duration}ms ${userRole}`);
    } else if (process.env.NODE_ENV !== 'test') {
      console.log(`[HTTP] ${method} ${originalUrl} ${statusCode} - ${duration}ms ${userRole}`);
    }
  });

  next();
};
