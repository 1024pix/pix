import { expect } from 'chai';
import sinon from 'sinon';

import { SessionAuthorization } from '../../../../../../src/certification/results/domain/models/SessionAuthorization.js';
import { getCertificatesForSession } from '../../../../../../src/certification/results/domain/usecases/get-certificates-for-session.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';

describe('Unit | UseCase | get-certificates-for-session', function () {
  describe('when there is no session', function () {
    it('should return null', async function () {
      const expectedResponse = Symbol('promise');
      const getSessionCertificatesPDFStub = sinon.stub().resolves(expectedResponse);
      const sessionAuthorizationAdapterStub = { find: sinon.stub().resolves(null) };
      const i18n = Symbol('i18n');

      const usecaseResponse = await getCertificatesForSession({
        sessionId: 11,
        isFrenchDomainExtension: true,
        i18n,
        sessionAuthorizationAdapter: sessionAuthorizationAdapterStub,
        dependencies: {
          getSessionCertificatesPDF: getSessionCertificatesPDFStub,
        },
      });

      expect(usecaseResponse).to.equal(null);
    });
  });

  describe('when there is some sessions', function () {
    it('should return certificates pdf from session', async function () {
      // given
      const expectedResponse = Symbol('promise');
      const getSessionCertificatesPDFStub = sinon.stub().resolves(expectedResponse);

      const sessionAuthorizationAdapterStub = {
        find: sinon.stub().resolves(new SessionAuthorization({ id: 11, sessionStatus: SESSION_STATUSES.PROCESSED })),
      };
      const i18n = Symbol('i18n');

      // when
      const usecaseResponse = await getCertificatesForSession({
        sessionId: 11,
        isFrenchDomainExtension: true,
        i18n,
        sessionAuthorizationAdapter: sessionAuthorizationAdapterStub,
        dependencies: {
          getSessionCertificatesPDF: getSessionCertificatesPDFStub,
        },
      });

      // then
      expect(getSessionCertificatesPDFStub).to.be.calledOnceWith({
        sessionId: 11,
        isFrenchDomainExtension: true,
        i18n,
      });

      expect(usecaseResponse).to.equal(expectedResponse);
    });
  });
});
