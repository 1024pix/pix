import { existsSync } from 'node:fs';
import * as url from 'node:url';

const envFilePath = url.fileURLToPath(new URL('../../.env', import.meta.url));

export function loadEnvFileIfExists() {
  console.log('loading env file from ', envFilePath)
  if (existsSync(envFilePath)) {
    process.loadEnvFile(envFilePath);
  }
}
