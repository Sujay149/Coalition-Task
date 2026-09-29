/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the patient API. */
  readonly VITE_API_BASE_URL?: string;
  /** HTTP Basic username used to authenticate against the API. */
  readonly VITE_API_USERNAME?: string;
  /** HTTP Basic password used to authenticate against the API. */
  readonly VITE_API_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
