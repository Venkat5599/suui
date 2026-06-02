/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_AUTH_KEY?: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
