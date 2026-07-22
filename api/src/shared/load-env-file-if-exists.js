import * as url from 'node:url';

const envFilePath = url.fileURLToPath(new URL('../../.env', import.meta.url));

export function loadEnvFileIfExists() {
  try {
    process.loadEnvFile(envFilePath);
  } catch {
    // we ignore the error when file does not exist
  }
}
