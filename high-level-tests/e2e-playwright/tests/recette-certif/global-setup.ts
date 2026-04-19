import * as path from 'node:path';

import * as fs from 'fs/promises';

import { AUTH_DIR } from '../../helpers/auth.ts';
import { buildCertificationData } from '../../helpers/certification/db.ts';
const shouldRecordHAR = process.env.RECORD_HAR === 'true';
const HAR_DIR = path.resolve(import.meta.dirname, '../.har-record');

export default async function globalSetup() {
  try {
    if (shouldRecordHAR) {
      await fs.mkdir(HAR_DIR, { recursive: true });
    }
    await fs.mkdir(AUTH_DIR, { recursive: true });
    await buildCertificationData();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Global setup failed:', error);
    process.exit(1);
  }
}
