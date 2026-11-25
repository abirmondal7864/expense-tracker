declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      MONGO_URI?: string;
      JWT_SECRET?: string;
      NODE_ENV?: "development" | "production" | "test";
      FRONTEND_URL?: string;
      EMAIL_HOST?: string;
      EMAIL_PORT?: string;
      EMAIL_USERNAME?: string;
      EMAIL_PASSWORD?: string;
    }
  }
}

export {};
