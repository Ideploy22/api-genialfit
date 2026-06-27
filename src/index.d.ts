// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;

    JWT_SECRET: string;

    S3: string;
    S3_AKEY: string;
    S3_SKEY: string;
    S3_BUCKET: string;
    S3_REGION: string;

    DATABASE_URL: string;
  }
}
