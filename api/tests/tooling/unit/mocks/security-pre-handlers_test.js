import sinon from 'sinon';

import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';
import { getAdminRoleStub } from '../../../tooling/mocks/security-pre-handlers.mock.js';
import { catchErrSync } from '../../../tooling/test-utils/error.js';

describe('Unit | Tooling | Mocks | SecurityPreHandlersHelpers', function () {
  describe('#getAdminRoleStub', function () {
    it('should throw if role does not exist', function () {
      const error = catchErrSync(getAdminRoleStub)('WRONG_ROLE');

      expect(error).to.exist;
      expect(error.message).to.equal('Role is not supported');
    });

    it('should return checkAdminMemberHasRoleCertif stub if role CERTIF is provided', function () {
      // when
      const stub = getAdminRoleStub('CERTIF');
      const hResponseSpy = sinon.spy(hFake, 'response');
      securityPreHandlers.checkAdminMemberHasRoleCertif(null, hFake);

      // then
      expect(stub).to.have.been.calledOnce;
      expect(hResponseSpy).to.have.been.calledOnceWith(true);
    });

    it('should return checkAdminMemberHasRoleCertif stub if role METIER is provided', function () {
      // when
      const stub = getAdminRoleStub('METIER');
      const hResponseSpy = sinon.spy(hFake, 'response');
      securityPreHandlers.checkAdminMemberHasRoleMetier(null, hFake);

      // then
      expect(stub).to.have.been.calledOnce;
      expect(hResponseSpy).to.have.been.calledOnceWith(true);
    });

    it('should return checkAdminMemberHasRoleCertif stub if role SUPPORT is provided', function () {
      // when
      const stub = getAdminRoleStub('SUPPORT');
      const hResponseSpy = sinon.spy(hFake, 'response');
      securityPreHandlers.checkAdminMemberHasRoleSupport(null, hFake);

      // then
      expect(stub).to.have.been.calledOnce;
      expect(hResponseSpy).to.have.been.calledOnceWith(true);
    });

    it('should return checkAdminMemberHasRoleCertif stub if role SUPER_ADMIN is provided', function () {
      // when
      const stub = getAdminRoleStub('SUPER_ADMIN');
      const hResponseSpy = sinon.spy(hFake, 'response');
      securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(null, hFake);

      // then
      expect(stub).to.have.been.calledOnce;
      expect(hResponseSpy).to.have.been.calledOnceWith(true);
    });
  });
});
