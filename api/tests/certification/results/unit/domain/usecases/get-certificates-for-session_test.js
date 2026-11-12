import { expect } from 'chai';
import sinon from 'sinon';

import { SessionAuthorization } from '../../../../../../src/certification/results/domain/models/SessionAuthorization.js';
import { getCertificatesForSession } from '../../../../../../src/certification/results/domain/usecases/get-certificates-for-session.js';
import {
  SESSION_STATUSES,
  SessionStatus,
} from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';

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

  it('when the session has processed status should return certificates pdf from session', async function () {
    // given
    const expectedResponse = Symbol('promise');
    const getSessionCertificatesPDFStub = sinon.stub().resolves(expectedResponse);

    const sessionAuthorizationAdapterStub = {
      find: sinon.stub().resolves(
        new SessionAuthorization({
          id: 11,
          sessionStatus: new SessionStatus({ status: SESSION_STATUSES.PROCESSED }),
        }),
      ),
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

  [
    { status: SESSION_STATUSES.CREATED, expectedResponse: null },
    { status: SESSION_STATUSES.STARTED, expectedResponse: null },
    { status: SESSION_STATUSES.TO_FINALIZE, expectedResponse: null },
    { status: SESSION_STATUSES.FINALIZED, expectedResponse: null },
    { status: SESSION_STATUSES.IN_PROCESS, expectedResponse: null },
  ].forEach(({ status, expectedResponse }) => {
    it(`when the status is ${status}, should return null`, async function () {
      // given
      const getSessionCertificatesPDFStub = sinon.stub();

      const sessionAuthorizationAdapterStub = {
        find: sinon
          .stub()
          .resolves(new SessionAuthorization({ id: 11, sessionStatus: new SessionStatus({ status: status }) })),
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
      expect(getSessionCertificatesPDFStub).to.be.not.called;

      expect(usecaseResponse).to.equal(expectedResponse);
    });
  });
});
