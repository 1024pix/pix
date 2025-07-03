import path from 'node:path';

import jwt from 'jsonwebtoken';
import ms from 'ms';

import { test } from './fixtures.ts';

type PixAuthType = 'pix-app' | 'pix-app-gar' | 'pix-orga';

export const LOGGED_APP_USER_ID = 1;
export const LOGGED_ORGA_USER_ID = 2;

export function getAuthStatePath(type: PixAuthType) {
  return path.join(import.meta.dirname, `../node_modules/.playwright/auth-${type}.json`);
}

export function useLoggedUser(type: PixAuthType) {
  test.use({ storageState: getAuthStatePath(type) });
  return LOGGED_APP_USER_ID;
}

export function useLoggedAppUser(type: PixAuthType) {
  test.use({ storageState: getAuthStatePath(type) });
  return LOGGED_APP_USER_ID;
}

export function useLoggedOrgaUser(type: PixAuthType) {
  test.use({ storageState: getAuthStatePath(type) });
  return LOGGED_ORGA_USER_ID;
}

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

export function getGarTokenForExistingUser(userId: string, expiresIn: ms.StringValue = '1h') {
  return jwt.sign(
    { user_id: userId, source: 'external', aud: process.env.PIX_APP_URL },
    process.env.AUTH_SECRET || '',
    { expiresIn },
  );
}
