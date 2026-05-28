import sinon from 'sinon';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { PIX_ADMIN } from '../../../src/shared/domain/constants.js';

const getAdminRoleStub = (role) => {
  const pixAdminRole = PIX_ADMIN.ROLES[role];

  if (pixAdminRole === undefined) {
    throw new Error('Role is not supported');
  }

  let stub;

  switch (role) {
    case PIX_ADMIN.ROLES.CERTIF:
      stub = sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif');
      break;
    case PIX_ADMIN.ROLES.METIER:
      stub = sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier');
      break;
    case PIX_ADMIN.ROLES.SUPPORT:
      stub = sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport');
      break;
    case PIX_ADMIN.ROLES.SUPER_ADMIN:
      stub = sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
      break;
  }

  stub.callsFake((_, h) => {
    return h.response(true);
  });
  return stub;
};

export { getAdminRoleStub };
