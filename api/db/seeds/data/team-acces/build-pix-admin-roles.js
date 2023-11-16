import { DEFAULT_PASSWORD } from '../../../constants.js';
import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

function _buildCertifRole(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRole({
    firstName: 'Pix',
    lastName: 'Certif',
    email: 'pixcertif@example.net',
    rawPassword: DEFAULT_PASSWORD,
    role: ROLES.CERTIF,
  });
}

function _buildMetierRole(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRole({
    firstName: 'Pix',
    lastName: 'Metier',
    email: 'pixmetier@example.net',
    rawPassword: DEFAULT_PASSWORD,
    role: ROLES.METIER,
  });
}

function _buildSupportRole(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRole({
    firstName: 'Pix',
    lastName: 'Support',
    email: 'pixsupport@example.net',
    rawPassword: DEFAULT_PASSWORD,
    role: ROLES.SUPPORT,
  });
}

export function buildPixAdminRoles(databaseBuilder) {
  _buildSupportRole(databaseBuilder);
  _buildCertifRole(databaseBuilder);
  _buildMetierRole(databaseBuilder);
}
