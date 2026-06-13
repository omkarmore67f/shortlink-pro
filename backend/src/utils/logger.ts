import winston from 'winston';

/**
 * Centralized logger using Winston.
 *
 * Why Winston?
 * - Structured logging (JSON in production) makes logs easy to ship
 *   to services like CloudWatch, Datadog, or ELK.
 * - Console transport with colorization in development improves DX.
 * - Having a single logger module means every controller/service logs
 *   consistently instead of using raw console.log scattered everywhere.
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, ...meta }) =>
              `${timestamp} [${level}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`
          )
        )
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
