import { DEFAULT_PASSWORD } from '../../../constants.js';

export const PIX_ORGA_ALL_ORGA_ID = 10001;

export function buildOrganizationUsers(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: PIX_ORGA_ALL_ORGA_ID,
    firstName: 'Rhaenyra',
    lastName: 'Targaryen',
    email: 'allorga@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });
}
