const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
];

/**
 * Helper function to parse CLIENT_URL or ALLOWED_ORIGINS environment variables.
 * Supports comma-separated strings (e.g. "https://nivana-m95a.vercel.app, http://localhost:5173")
 * and handles missing protocol schemes (e.g. "nivana-m95a.vercel.app" -> "https://nivana-m95a.vercel.app").
 */
const getEnvOrigins = () => {
  const envUrl = process.env.CLIENT_URL || process.env.ALLOWED_ORIGINS || '';
  if (!envUrl) return [];

  return envUrl.split(',').flatMap((url) => {
    const trimmed = url.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return [trimmed];
    }

    return [`https://${trimmed}`, `http://${trimmed}`, trimmed];
  });
};

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      ...defaultAllowedOrigins,
      ...getEnvOrigins(),
    ];

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:');

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
};
