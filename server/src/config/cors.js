const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const getEnvOrigins = () => {
  const env =
    process.env.ALLOWED_ORIGINS ||
    process.env.CLIENT_URL ||
    '';

  if (!env) return [];

  return env
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, '')); // Remove trailing slash
};

export const corsOptions = {
  origin(origin, callback) {
    // Allow requests without Origin (Postman, curl, mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      ...defaultAllowedOrigins,
      ...getEnvOrigins(),
    ];

    const normalizedOrigin = origin.replace(/\/$/, '');

    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.startsWith('http://localhost:') ||
      normalizedOrigin.startsWith('http://127.0.0.1:');

    if (isAllowed) {
      return callback(null, true);
    }

    console.error('❌ CORS Blocked Origin:', normalizedOrigin);

    return callback(
      new Error(`Origin ${normalizedOrigin} is not allowed by CORS`)
    );
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],

  optionsSuccessStatus: 200,
};