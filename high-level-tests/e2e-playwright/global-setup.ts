import * as path from 'node:path';

import * as fs from 'fs/promises';
import ms from 'ms';

import {
  AUTH_DIR,
  Credentials,
  getTokenForPixUser,
  PIX_APP_USER_CREDENTIALS,
  PIX_CERTIF_PRO_CREDENTIALS,
  PIX_ORGA_PRO_CREDENTIALS,
  PIX_ORGA_SCO_ISMANAGING_CREDENTIALS,
  PIX_ORGA_SUP_ISMANAGING_CREDENTIALS,
} from './helpers/auth.ts';
import { buildAuthenticatedUsers } from './helpers/db.ts';

export default async function globalSetup() {
  try {
    await buildAuthenticatedUsers({ withCguAccepted: true });

    await saveStorageState(PIX_APP_USER_CREDENTIALS);
    await saveStorageState(PIX_ORGA_PRO_CREDENTIALS);
    await saveStorageState(PIX_ORGA_SCO_ISMANAGING_CREDENTIALS);
    await saveStorageState(PIX_ORGA_SUP_ISMANAGING_CREDENTIALS);
    await saveStorageState(PIX_CERTIF_PRO_CREDENTIALS);
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    process.exit(1);
  }
}

async function saveStorageState(creds: Credentials) {
  await fs.mkdir(AUTH_DIR, { recursive: true });
  const filePath = path.join(AUTH_DIR, `${creds.label}.json`);
  const storageState = generateStorageState(creds.id, creds.appUrl);
  await fs.writeFile(filePath, JSON.stringify(storageState, null, 2));
  console.log(`✅ User auth state for ${creds.label} saved to ${filePath}`);
}

function generateStorageState(userId: number, origin: string) {
  const sessionObject = {
    authenticated: {
      authenticator: 'authenticator:oauth2',
      token_type: 'bearer',
      user_id: userId,
      access_token: getTokenForPixUser(userId, origin, '1h'),
      expires_in: ms('1h'),
      expires_at: Date.now() + ms('1h'),
    },
  };

  return {
    cookies: [],
    origins: [
      {
        origin: origin,
        localStorage: [
          {
            name: 'ember_simple_auth-session',
            value: JSON.stringify(sessionObject),
          },
        ],
      },
    ],
  };
}
