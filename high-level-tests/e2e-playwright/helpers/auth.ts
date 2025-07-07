import path from 'node:path';

import jwt from 'jsonwebtoken';
import ms from 'ms';

import {
  PIX_APP_USER_DATA,
  PIX_CERTIF_PRO_DATA,
  PIX_ORGA_PRO_DATA,
  PIX_ORGA_SCO_ISMANAGING_DATA,
  PIX_ORGA_SUP_ISMANAGING_DATA,
} from './db-data.js';

export const AUTH_DIR = path.resolve(import.meta.dirname, '../.auth');
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
export const PIX_ORGA_PRO_CREDENTIALS: Credentials = {
  id: PIX_ORGA_PRO_DATA.id,
  label: 'pix-orga_pro',
  firstName: PIX_ORGA_PRO_DATA.firstName,
  lastName: PIX_ORGA_PRO_DATA.lastName,
  email: PIX_ORGA_PRO_DATA.email,
  rawPassword: PIX_ORGA_PRO_DATA.rawPassword,
  appUrl: process.env.PIX_ORGA_URL as string,
};
export const PIX_ORGA_SCO_ISMANAGING_CREDENTIALS: Credentials = {
  id: PIX_ORGA_SCO_ISMANAGING_DATA.id,
  label: 'pix-orga_sco-is-managing',
  firstName: PIX_ORGA_SCO_ISMANAGING_DATA.firstName,
  lastName: PIX_ORGA_SCO_ISMANAGING_DATA.lastName,
  email: PIX_ORGA_SCO_ISMANAGING_DATA.email,
  rawPassword: PIX_ORGA_SCO_ISMANAGING_DATA.rawPassword,
  appUrl: process.env.PIX_ORGA_URL as string,
};
export const PIX_ORGA_SUP_ISMANAGING_CREDENTIALS: Credentials = {
  id: PIX_ORGA_SUP_ISMANAGING_DATA.id,
  label: 'pix-orga_sup-is-managing',
  firstName: PIX_ORGA_SUP_ISMANAGING_DATA.firstName,
  lastName: PIX_ORGA_SUP_ISMANAGING_DATA.lastName,
  email: PIX_ORGA_SUP_ISMANAGING_DATA.email,
  rawPassword: PIX_ORGA_SUP_ISMANAGING_DATA.rawPassword,
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
