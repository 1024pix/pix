import path from 'node:path';

import * as fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import ms from 'ms';

import {
  PIX_ADMIN_SUPPORT_DATA,
  PIX_APP_USER_DATA,
  PIX_CERTIF_PRO_DATA,
  PIX_ORGA_ADMIN_DATA,
  PIX_ORGA_MEMBER_DATA,
} from './db-data.js';

export const AUTH_DIR = path.resolve(import.meta.dirname, '../.auth');
export const shouldRecordHAR = process.env.RECORD_HAR === 'true';
export const HAR_DIR = path.resolve(import.meta.dirname, '../.har-record');

export type Credentials = {
  id: number;
  label: string;
  firstName: string;
  lastName: string;
  email: string;
  rawPassword: string;
  appUrl: string;
};

export const PIX_APP_USER_CREDENTIALS: Credentials = {
  id: PIX_APP_USER_DATA.id,
  label: 'pix-app_user',
  firstName: PIX_APP_USER_DATA.firstName,
  lastName: PIX_APP_USER_DATA.lastName,
  email: PIX_APP_USER_DATA.email,
  rawPassword: PIX_APP_USER_DATA.rawPassword,
  appUrl: process.env.PIX_APP_URL as string,
};
export const PIX_ORGA_ADMIN_CREDENTIALS: Credentials = {
  id: PIX_ORGA_ADMIN_DATA.id,
  label: 'pix-orga_pro',
  firstName: PIX_ORGA_ADMIN_DATA.firstName,
  lastName: PIX_ORGA_ADMIN_DATA.lastName,
  email: PIX_ORGA_ADMIN_DATA.email,
  rawPassword: PIX_ORGA_ADMIN_DATA.rawPassword,
  appUrl: process.env.PIX_ORGA_URL as string,
};
export const PIX_ORGA_MEMBER_CREDENTIALS: Credentials = {
  id: PIX_ORGA_MEMBER_DATA.id,
  label: 'pix-orga_sco-is-managing',
  firstName: PIX_ORGA_MEMBER_DATA.firstName,
  lastName: PIX_ORGA_MEMBER_DATA.lastName,
  email: PIX_ORGA_MEMBER_DATA.email,
  rawPassword: PIX_ORGA_MEMBER_DATA.rawPassword,
  appUrl: process.env.PIX_ORGA_URL as string,
};
export const PIX_CERTIF_PRO_CREDENTIALS: Credentials = {
  id: PIX_CERTIF_PRO_DATA.id,
  label: 'pix-certif_pro',
  firstName: PIX_CERTIF_PRO_DATA.firstName,
  lastName: PIX_CERTIF_PRO_DATA.lastName,
  email: PIX_CERTIF_PRO_DATA.email,
  rawPassword: PIX_CERTIF_PRO_DATA.rawPassword,
  appUrl: process.env.PIX_CERTIF_URL as string,
};
export const PIX_ADMIN_SUPPORT_CREDENTIALS: Credentials = {
  id: PIX_ADMIN_SUPPORT_DATA.id,
  label: 'pix-admin_support',
  firstName: PIX_ADMIN_SUPPORT_DATA.firstName,
  lastName: PIX_ADMIN_SUPPORT_DATA.lastName,
  email: PIX_ADMIN_SUPPORT_DATA.email,
  rawPassword: PIX_ADMIN_SUPPORT_DATA.rawPassword,
  appUrl: process.env.PIX_ADMIN_URL as string,
};

export function getGarTokenForNewUser(firstName: string, lastName: string, expiresIn: ms.StringValue = '1h') {
  return jwt.sign(
    {
      first_name: firstName,
      last_name: lastName,
      saml_id: `saml-id-${firstName}-${lastName}`,
      source: 'external',
    },
    process.env.AUTH_SECRET || '',
    { expiresIn },
  );
}

export function getGarTokenForExistingUser(userId: number, expiresIn: ms.StringValue = '1h') {
  return jwt.sign(
    { user_id: userId, source: 'external', aud: process.env.PIX_APP_URL },
    process.env.AUTH_SECRET || '',
    { expiresIn },
  );
}

export function getTokenForPixUser(userId: number, origin: string, expiresIn: ms.StringValue = '1h') {
  return jwt.sign({ user_id: userId, source: 'pix', aud: origin }, process.env.AUTH_SECRET || '', {
    expiresIn,
  });
}

export async function saveStorageState(creds: Credentials) {
  const filePath = path.join(AUTH_DIR, `${creds.label}.json`);
  const storageState = generateStorageState(creds.id, creds.appUrl);
  await fs.writeFile(filePath, JSON.stringify(storageState, null, 2));
  // eslint-disable-next-line no-console
  console.log(`✅ User auth state for ${creds.label} saved to ${filePath}`);
}

export function generateStorageState(userId: number, origin: string) {
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
