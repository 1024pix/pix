import { expect } from 'chai';
import sinon from 'sinon';

import { NoCertificationResultsToDownloadError } from '../../../../../../src/certification/results/domain/errors.js';
import { SessionAuthorization } from '../../../../../../src/certification/results/domain/models/SessionAuthorization.js';
import { getCertificatesForSession } from '../../../../../../src/certification/results/domain/usecases/get-certificates-for-session.js';
import {
  SESSION_STATUSES,
  SessionStatus,
} from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-certificates-for-session', function () {
  describe('when there is no session', function () {
    it('should throw NoCertificationResultsToDownloadError', async function () {
      const expectedResponse = Symbol('promise');
      const getSessionCertificatesPDFStub = sinon.stub().resolves(expectedResponse);
      const sessionAuthorizationAdapterStub = { find: sinon.stub().resolves(null) };
      const i18n = Symbol('i18n');

      const err = await catchErr(getCertificatesForSession)({
        sessionId: 11,
        isFrenchDomainExtension: true,
        i18n,
        sessionAuthorizationAdapter: sessionAuthorizationAdapterStub,
        dependencies: {
          getSessionCertificatesPDF: getSessionCertificatesPDFStub,
        },
      });

      expect(err).to.be.instanceOf(NoCertificationResultsToDownloadError);
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
    { status: SESSION_STATUSES.CREATED },
    { status: SESSION_STATUSES.STARTED },
    { status: SESSION_STATUSES.TO_FINALIZE },
    { status: SESSION_STATUSES.FINALIZED },
    { status: SESSION_STATUSES.IN_PROCESS },
  ].forEach(({ status }) => {
    it(`when the status is ${status}, should throw NoCertificationResultsToDownloadError`, async function () {
      // given
      const getSessionCertificatesPDFStub = sinon.stub();

      const sessionAuthorizationAdapterStub = {
        find: sinon
          .stub()
          .resolves(new SessionAuthorization({ id: 11, sessionStatus: new SessionStatus({ status: status }) })),
      };
      const i18n = Symbol('i18n');

      // when
      const err = await catchErr(getCertificatesForSession)({
        sessionId: 11,
        isFrenchDomainExtension: true,
        i18n,
        sessionAuthorizationAdapter: sessionAuthorizationAdapterStub,
        dependencies: {
          getSessionCertificatesPDF: getSessionCertificatesPDFStub,
        },
      });

      // then
      expect(err).to.be.instanceOf(NoCertificationResultsToDownloadError);
    });
  });
});
