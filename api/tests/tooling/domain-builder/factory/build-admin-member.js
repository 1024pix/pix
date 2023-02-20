import AdminMember from '../../../../lib/domain/models/AdminMember';
import { PIX_ADMIN } from '../../../../lib/domain/constants';

const { ROLES: ROLES } = PIX_ADMIN;

const buildAdminMember = function ({
  id = 1,
  userId = 1,
  firstName = 'Dimitri',
  lastName = 'Kramatorsk',
  email = 'dimitri.k@pix.fr',
  role = ROLES.SUPER_ADMIN,
  createdAt = new Date(2022, 4, 11),
  updatedAt,
  disabledAt,
} = {}) {
  return new AdminMember({ id, userId, firstName, lastName, email, role, createdAt, updatedAt, disabledAt });
};

buildAdminMember.withRoleSupport = function ({
  id,
  userId,
  firstName,
  lastName,
  email,
  createdAt,
  updatedAt,
  disabledAt,
} = {}) {
  return buildAdminMember({
    id,
    userId,
    firstName,
    lastName,
    email,
    createdAt,
    updatedAt,
    disabledAt,
    role: ROLES.SUPPORT,
  });
};

buildAdminMember.withRoleCertif = function ({
  id,
  userId,
  firstName,
  lastName,
  email,
  createdAt,
  updatedAt,
  disabledAt,
} = {}) {
  return buildAdminMember({
    id,
    userId,
    firstName,
    lastName,
    email,
    createdAt,
    updatedAt,
    disabledAt,
    role: ROLES.CERTIF,
  });
};

buildAdminMember.withRoleMetier = function ({
  id,
  userId,
  firstName,
  lastName,
  email,
  createdAt,
  updatedAt,
  disabledAt,
} = {}) {
  return buildAdminMember({
    id,
    userId,
    firstName,
    lastName,
    email,
    createdAt,
    updatedAt,
    disabledAt,
    role: ROLES.METIER,
  });
};

buildAdminMember.withRoleSuperAdmin = function ({
  id,
  userId,
  firstName,
  lastName,
  email,
  createdAt,
  updatedAt,
  disabledAt,
} = {}) {
  return buildAdminMember({
    id,
    userId,
    firstName,
    lastName,
    email,
    createdAt,
    updatedAt,
    disabledAt,
    role: ROLES.SUPER_ADMIN,
  });
};

export default buildAdminMember;
