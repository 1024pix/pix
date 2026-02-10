import * as path from 'node:path';

import * as fs from 'fs/promises';

import {
  AUTH_DIR,
  PIX_ADMIN_SUPPORT_CREDENTIALS,
  PIX_APP_USER_CREDENTIALS,
  PIX_CERTIF_PRO_CREDENTIALS,
  PIX_ORGA_ADMIN_CREDENTIALS,
  PIX_ORGA_MEMBER_CREDENTIALS,
} from './helpers/auth.ts';
import { saveStorageState } from './helpers/auth.ts';
import { buildStaticData } from './helpers/db.ts';

const shouldRecordHAR = process.env.RECORD_HAR === 'true';
const HAR_DIR = path.resolve(import.meta.dirname, '../.har-record');

export default async function globalSetup() {
  try {
    if (shouldRecordHAR) {
      await fs.mkdir(HAR_DIR, { recursive: true });
    }
    await fs.mkdir(AUTH_DIR, { recursive: true });
    await buildStaticData();

    await saveStorageState(PIX_APP_USER_CREDENTIALS);
    await saveStorageState(PIX_ORGA_ADMIN_CREDENTIALS);
    await saveStorageState(PIX_ORGA_MEMBER_CREDENTIALS);
    await saveStorageState(PIX_CERTIF_PRO_CREDENTIALS);
    await saveStorageState(PIX_ADMIN_SUPPORT_CREDENTIALS);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Global setup failed:', error);
    process.exit(1);
  }
}
