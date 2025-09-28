interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_S3_BUCKET_NAME: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_AWS_S3_PREFIX: string;
  readonly VITE_S3_OBJECT_ACL: string;
  readonly [key: string]: string | boolean | undefined;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}