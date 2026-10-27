import { expect } from 'chai';
import sinon from 'sinon';

import {
  CertificationCenterIsArchivedError,
  InvalidSessionSupervisingLoginError,
  SessionFinalized,
  SessionNotJoinable,
} from '../../../../../../src/certification/session-management/domain/errors.js';
import { superviseSession } from '../../../../../../src/certification/session-management/domain/usecases/supervise-session.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Certification | SessionManagement | Unit | UseCase | supervise-session', function () {
  let invigilatorAccessRepository;
  let certificationCenterAccessRepository;
  let sessionAuthorizationInfoRepository;
  let dependencies;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
    sessionAuthorizationInfoRepository = {
      findBySessionId: sinon.stub(),
    };
    invigilatorAccessRepository = {
      create: sinon.stub(),
    };
    certificationCenterAccessRepository = {
      getCertificationCenterAccess: sinon.stub(),
    };
    preventStubsToBeCalledUnexpectedly([
      sessionAuthorizationInfoRepository.findBySessionId,
      invigilatorAccessRepository.create,
      certificationCenterAccessRepository.getCertificationCenterAccess,
    ]);
    dependencies = {
      invigilatorAccessRepository,
      certificationCenterAccessRepository,
      sessionAuthorizationInfoRepository,
    };
  });

  it('should throw a InvalidSessionSupervisingLoginError when the supervised password is wrong', async function () {
    // given
    const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().started().build();
    const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
      .sessionAuthorizationInfoBuilder()
      .withParameters({
        sessionStatus,
        certificationCenterArchived: false,
        invigilatorPassword: 'CORRECT_PASSWORD',
        certificationCenterId: 456,
      })
      .build();

    sessionAuthorizationInfoRepository.findBySessionId.withArgs({ sessionId: 123 }).resolves(sessionAuthorizationInfo);
    certificationCenterAccessRepository.getCertificationCenterAccess
      .withArgs({ certificationCenterId: 456 })
      .resolves(domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess());

    // when
    const error = await catchErr(superviseSession)({
      sessionId: 123,
      invigilatorPassword: 'NOT_MATCHING_INVIGILATOR_PASSWORD',
      userId: 789,
      ...dependencies,
    });

    // then
    expect(error).to.be.an.instanceOf(InvalidSessionSupervisingLoginError);
    expect(error.message).to.equal('Le numéro de session et/ou le mot de passe saisis sont incorrects.');
  });

  it('should throw a SessionFinalized when the session is finalized', async function () {
    // given
    const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().finalized().build();
    const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
      .sessionAuthorizationInfoBuilder()
      .withParameters({
        sessionStatus,
        certificationCenterArchived: false,
        invigilatorPassword: 'CORRECT_PASSWORD',
        certificationCenterId: 456,
      })
      .build();

    sessionAuthorizationInfoRepository.findBySessionId.withArgs({ sessionId: 123 }).resolves(sessionAuthorizationInfo);

    // when
    const error = await catchErr(superviseSession)({
      sessionId: 123,
      invigilatorPassword: 'CORRECT_PASSWORD',
      userId: 789,
      ...dependencies,
    });

    // then
    expect(error).to.be.an.instanceOf(SessionFinalized);
  });

  it('should a Certification center is archived error when certification center is archived', async function () {
    // given
    const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().started().build();
    const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
      .sessionAuthorizationInfoBuilder()
      .withParameters({
        sessionStatus,
        certificationCenterArchived: true,
        invigilatorPassword: 'CORRECT_PASSWORD',
        certificationCenterId: 456,
      })
      .build();

    sessionAuthorizationInfoRepository.findBySessionId.withArgs({ sessionId: 123 }).resolves(sessionAuthorizationInfo);
    certificationCenterAccessRepository.getCertificationCenterAccess
      .withArgs({ certificationCenterId: 456 })
      .resolves(domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess());

    // when
    const error = await catchErr(superviseSession)({
      sessionId: 123,
      invigilatorPassword: 'CORRECT_PASSWORD',
      userId: 789,
      ...dependencies,
    });

    // then
    expect(error).to.be.an.instanceOf(CertificationCenterIsArchivedError);
  });

  context('when certification center has blocked accesses', function () {
    it('should throw SessionNotJoinable when college is blocked', async function () {
      // given
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().started().build();
      const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withParameters({
          sessionStatus,
          certificationCenterArchived: false,
          invigilatorPassword: 'CORRECT_PASSWORD',
          certificationCenterId: 456,
        })
        .build();
      const blockedCertificationCenterAccess =
        domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess({
          isAccessBlockedCollege: true,
          pixCertifScoBlockedAccessDateCollege: '2021-01-01',
        });

      sessionAuthorizationInfoRepository.findBySessionId
        .withArgs({ sessionId: 123 })
        .resolves(sessionAuthorizationInfo);
      certificationCenterAccessRepository.getCertificationCenterAccess
        .withArgs({ certificationCenterId: 456 })
        .resolves(blockedCertificationCenterAccess);

      // when
      const error = await catchErr(superviseSession)({
        sessionId: 123,
        invigilatorPassword: 'CORRECT_PASSWORD',
        userId: 789,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(SessionNotJoinable);
    });

    it('should throw SessionNotJoinable when lycee is blocked', async function () {
      // given
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().started().build();
      const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withParameters({
          sessionStatus,
          certificationCenterArchived: false,
          invigilatorPassword: 'CORRECT_PASSWORD',
          certificationCenterId: 456,
        })
        .build();
      const blockedCertificationCenterAccess =
        domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess({
          isAccessBlockedLycee: true,
          pixCertifScoBlockedAccessDateLycee: '2021-01-01',
        });

      sessionAuthorizationInfoRepository.findBySessionId
        .withArgs({ sessionId: 123 })
        .resolves(sessionAuthorizationInfo);
      certificationCenterAccessRepository.getCertificationCenterAccess
        .withArgs({ certificationCenterId: 456 })
        .resolves(blockedCertificationCenterAccess);

      // when
      const error = await catchErr(superviseSession)({
        sessionId: 123,
        invigilatorPassword: 'CORRECT_PASSWORD',
        userId: 789,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(SessionNotJoinable);
    });

    it('should throw SessionNotJoinable when aefe is blocked', async function () {
      // given
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().started().build();
      const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withParameters({
          sessionStatus,
          certificationCenterArchived: false,
          invigilatorPassword: 'CORRECT_PASSWORD',
          certificationCenterId: 456,
        })
        .build();
      const blockedCertificationCenterAccess =
        domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess({
          isAccessBlockedAEFE: true,
          pixCertifScoBlockedAccessDateLycee: '2021-01-01',
        });

      sessionAuthorizationInfoRepository.findBySessionId
        .withArgs({ sessionId: 123 })
        .resolves(sessionAuthorizationInfo);
      certificationCenterAccessRepository.getCertificationCenterAccess
        .withArgs({ certificationCenterId: 456 })
        .resolves(blockedCertificationCenterAccess);

      // when
      const error = await catchErr(superviseSession)({
        sessionId: 123,
        invigilatorPassword: 'CORRECT_PASSWORD',
        userId: 789,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(SessionNotJoinable);
    });

    it('should throw SessionNotJoinable when agri is blocked', async function () {
      // given
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().started().build();
      const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withParameters({
          sessionStatus,
          certificationCenterArchived: false,
          invigilatorPassword: 'CORRECT_PASSWORD',
          certificationCenterId: 456,
        })
        .build();
      const blockedCertificationCenterAccess =
        domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess({
          isAccessBlockedAgri: true,
          pixCertifScoBlockedAccessDateLycee: '2021-01-01',
        });

      sessionAuthorizationInfoRepository.findBySessionId
        .withArgs({ sessionId: 123 })
        .resolves(sessionAuthorizationInfo);
      certificationCenterAccessRepository.getCertificationCenterAccess
        .withArgs({ certificationCenterId: 456 })
        .resolves(blockedCertificationCenterAccess);

      // when
      const error = await catchErr(superviseSession)({
        sessionId: 123,
        invigilatorPassword: 'CORRECT_PASSWORD',
        userId: 789,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(SessionNotJoinable);
    });
  });

  it('should create an invigilator access', async function () {
    // given
    const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().started().build();
    const sessionAuthorizationInfo = domainBuilder.certification.sessionManagement
      .sessionAuthorizationInfoBuilder()
      .withParameters({
        sessionStatus,
        certificationCenterArchived: false,
        invigilatorPassword: 'CORRECT_PASSWORD',
        certificationCenterId: 456,
      })
      .build();
    sessionAuthorizationInfoRepository.findBySessionId.withArgs({ sessionId: 123 }).resolves(sessionAuthorizationInfo);
    certificationCenterAccessRepository.getCertificationCenterAccess.resolves(
      domainBuilder.certification.sessionManagement.buildAllowedCertificationCenterAccess(),
    );
    invigilatorAccessRepository.create.resolves();

    // when
    await superviseSession({
      sessionId: 123,
      invigilatorPassword: 'CORRECT_PASSWORD',
      userId: 789,
      ...dependencies,
    });

    // then
    expect(invigilatorAccessRepository.create).to.have.been.calledWithExactly({ sessionId: 123, userId: 789 });
  });
});
