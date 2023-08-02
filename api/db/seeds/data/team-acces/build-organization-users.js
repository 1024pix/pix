import { DEFAULT_PASSWORD } from '../../../constants.js';

export const PIX_ORGA_ALL_ORGA_ID = 10001;
export const PIX_ORGA_ADMIN_LEAVING_ID = 10002;

export function buildOrganizationUsers(databaseBuilder) {
  [
    {
      id: PIX_ORGA_ALL_ORGA_ID,
      firstName: 'Rhaenyra',
      lastName: 'Targaryen',
      email: 'allorga@example.net',
    },
    {
      id: PIX_ORGA_ADMIN_LEAVING_ID,
      firstName: 'Admin',
      lastName: 'Leaving',
      email: 'admin.leaving@example.net',
    },
  ].forEach(_buildUser(databaseBuilder));
}

function _buildUser(databaseBuilder) {
  return function ({ id, firstName, lastName, email, rawPassword = DEFAULT_PASSWORD }) {
    databaseBuilder.factory.buildUser.withRawPassword({
      id,
      firstName,
      lastName,
      email,
      rawPassword,
      cgu: true,
      pixOrgaTermsOfServiceAccepted: true,
      lastPixOrgaTermsOfServiceValidatedAt: new Date(),
    });
  };
}
