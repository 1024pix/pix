import sinon from 'sinon';

import {
  CertificationCenterIsArchivedError,
  InvalidSessionSupervisingLoginError,
  SessionFinalized,
  SessionNotJoinable,
} from '../../../../../../src/certification/session-management/domain/errors.js';
import { InvigilatorSession } from '../../../../../../src/certification/session-management/domain/read-models/InvigilatorSession.js';
import { superviseSession } from '../../../../../../src/certification/session-management/domain/usecases/supervise-session.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | supervise-session', function () {
  let invigilatorSessionRepository;
  let invigilatorAccessRepository;
  let certificationCenterRepository;
  let certificationCenterAccessRepository;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
    invigilatorSessionRepository = {
      get: sinon.stub(),
    };
    invigilatorAccessRepository = {
      create: sinon.stub(),
    };
    certificationCenterRepository = {
      getBySessionId: sinon.stub(),
    };
    certificationCenterAccessRepository = {
      getCertificationCenterAccess: sinon.stub(),
    };
  });

  it('should throw a InvalidSessionSupervisingLoginError when the supervised password is wrong', async function () {
    // given
    const sessionId = 123;
    const invigilatorPassword = 'NOT_MATCHING_INVIGILATOR_PASSWORD';
    const certificationCenter = domainBuilder.buildCertificationCenter();
    const session = new InvigilatorSession({
      finalizedAt: null,
      invigilatorPassword: 'CORRECT_PASSWORD',
    });
    const userId = 434;

    invigilatorSessionRepository.get.resolves(session);
    certificationCenterRepository.getBySessionId.resolves(certificationCenter);
    certificationCenterAccessRepository.getCertificationCenterAccess.resolves(
      domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess(),
    );

    // when
    const error = await catchErr(superviseSession)({
      sessionId,
      invigilatorPassword,
      userId,
      invigilatorSessionRepository,
      invigilatorAccessRepository,
      certificationCenterRepository,
      certificationCenterAccessRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(InvalidSessionSupervisingLoginError);
    expect(error.message).to.equal('Le numéro de session et/ou le mot de passe saisis sont incorrects.');
  });

  it('should throw a SessionFinalized when the session is finalized', async function () {
    // given
    const sessionId = 123;
    const certificationCenter = domainBuilder.buildCertificationCenter();
    const session = new InvigilatorSession({
      finalizedAt: new Date(),
      invigilatorPassword: 'PASSWORD',
    });
    const userId = 434;

    invigilatorSessionRepository.get.resolves(session);
    certificationCenterRepository.getBySessionId.resolves(certificationCenter);
    certificationCenterAccessRepository.getCertificationCenterAccess.resolves(
      domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess(),
    );

    // when
    const error = await catchErr(superviseSession)({
      sessionId,
      invigilatorPassword: session.invigilatorPassword,
      userId,
      invigilatorSessionRepository,
      invigilatorAccessRepository,
      certificationCenterRepository,
      certificationCenterAccessRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(SessionFinalized);
  });

  it('should a Certification center is archived error when certification center is archived', async function () {
    // given
    const sessionId = 123;
    const session = new InvigilatorSession({
      finalizedAt: null,
      invigilatorPassword: 'PASSWORD',
    });
    const userId = 434;

    invigilatorSessionRepository.get.resolves(session);
    certificationCenterRepository.getBySessionId.resolves({ archivedAt: new Date(), archivedBy: 1234 });
    certificationCenterAccessRepository.getCertificationCenterAccess.resolves(
      domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess(),
    );

    // when
    const error = await catchErr(superviseSession)({
      sessionId,
      invigilatorPassword: session.invigilatorPassword,
      userId,
      invigilatorSessionRepository,
      invigilatorAccessRepository,
      certificationCenterRepository,
      certificationCenterAccessRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(CertificationCenterIsArchivedError);
  });

  context('when certification center has SCO blocked access', function () {
    it('should throw SessionNotJoinable when college is blocked', async function () {
      // given
      const sessionId = 123;
      const certificationCenterId = 456;
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement.created({ id: sessionId });
      const userId = 434;
      const certificationCenter = domainBuilder.buildCertificationCenter({ id: certificationCenterId });
      const blockedCertificationCenterAccess =
        domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess({
          isAccessBlockedCollege: true,
          pixCertifScoBlockedAccessDateCollege: '2021-01-01',
        });

      invigilatorSessionRepository.get.resolves(session);
      certificationCenterRepository.getBySessionId.resolves(certificationCenter);
      certificationCenterAccessRepository.getCertificationCenterAccess.resolves(blockedCertificationCenterAccess);

      // when
      const error = await catchErr(superviseSession)({
        sessionId,
        invigilatorPassword: session.invigilatorPassword,
        userId,
        invigilatorSessionRepository,
        invigilatorAccessRepository,
        certificationCenterRepository,
        certificationCenterAccessRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(SessionNotJoinable);
    });
  });

  it('should create an invigilator access', async function () {
    // given
    const sessionId = 123;
    const userId = 434;
    const session = new InvigilatorSession({
      finalizedAt: null,
      invigilatorPassword: 'PASSWORD',
    });

    invigilatorSessionRepository.get.resolves(session);
    certificationCenterRepository.getBySessionId.resolves({ archivedAt: null, archivedBy: null });
    certificationCenterAccessRepository.getCertificationCenterAccess.resolves(
      domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess(),
    );

    // when
    await superviseSession({
      sessionId,
      invigilatorPassword: session.invigilatorPassword,
      userId,
      invigilatorSessionRepository,
      invigilatorAccessRepository,
      certificationCenterRepository,
      certificationCenterAccessRepository,
    });

    // then
    expect(invigilatorAccessRepository.create).to.have.been.calledWithExactly({ sessionId, userId });
  });
});
