import jwt from 'jsonwebtoken';
import ms from 'ms';

import {
  PIX_APP_USER_DATA,
  PIX_ORGA_PRO_DATA,
  PIX_ORGA_SCO_ISMANAGING_DATA,
  PIX_ORGA_SUP_ISMANAGING_DATA,
} from './db-data.js';

export type Credentials = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  rawPassword: string;
  appAndRole: string;
};
export const PIX_APP_USER_CREDENTIALS: Credentials = {
  id: PIX_APP_USER_DATA.id,
  firstName: PIX_APP_USER_DATA.firstName,
  lastName: PIX_APP_USER_DATA.lastName,
  email: PIX_APP_USER_DATA.email,
  rawPassword: PIX_APP_USER_DATA.rawPassword,
  appAndRole: 'pix-app_user',
};
export const PIX_ORGA_PRO_CREDENTIALS: Credentials = {
  id: PIX_ORGA_PRO_DATA.id,
  firstName: PIX_ORGA_PRO_DATA.firstName,
  lastName: PIX_ORGA_PRO_DATA.lastName,
  email: PIX_ORGA_PRO_DATA.email,
  rawPassword: PIX_ORGA_PRO_DATA.rawPassword,
  appAndRole: 'pix-orga_pro',
};
export const PIX_ORGA_SCO_ISMANAGING_CREDENTIALS: Credentials = {
  id: PIX_ORGA_SCO_ISMANAGING_DATA.id,
  firstName: PIX_ORGA_SCO_ISMANAGING_DATA.firstName,
  lastName: PIX_ORGA_SCO_ISMANAGING_DATA.lastName,
  email: PIX_ORGA_SCO_ISMANAGING_DATA.email,
  rawPassword: PIX_ORGA_SCO_ISMANAGING_DATA.rawPassword,
  appAndRole: 'pix-orga_sco-is-managing',
};
export const PIX_ORGA_SUP_ISMANAGING_CREDENTIALS: Credentials = {
  id: PIX_ORGA_SUP_ISMANAGING_DATA.id,
  firstName: PIX_ORGA_SUP_ISMANAGING_DATA.firstName,
  lastName: PIX_ORGA_SUP_ISMANAGING_DATA.lastName,
  email: PIX_ORGA_SUP_ISMANAGING_DATA.email,
  rawPassword: PIX_ORGA_SUP_ISMANAGING_DATA.rawPassword,
  appAndRole: 'pix-orga_sup-is-managing',
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
