import { normalizePatients, type Patient } from "./patient";

/*
 * The API endpoint and its keys live in the environment (see `.env` /
 * `.env.example`), never in the source. Vite inlines every `VITE_*` variable
 * into the bundle at build time.
 */
function getApiConfig(): { url: string; authHeader: string } {
  const url = import.meta.env.VITE_API_BASE_URL;
  const username = import.meta.env.VITE_API_USERNAME;
  const password = import.meta.env.VITE_API_PASSWORD;

  if (!url || !username || !password) {
    throw new Error(
      "Missing API configuration. Copy .env.example to .env and set VITE_API_BASE_URL, VITE_API_USERNAME and VITE_API_PASSWORD."
    );
  }

  return {
    url,
    authHeader: `Basic ${btoa(`${username}:${password}`)}`,
  };
}

/**
 * Loads the patients from the API and maps the response onto the `Patient`
 * model. No value is ever invented here: anything the API omits stays absent
 * and is rendered as `N/A` by the UI.
 */
export async function fetchPatients(): Promise<Patient[]> {
  const { url, authHeader } = getApiConfig();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch patient data");
  }

  return normalizePatients(await response.json());
}

