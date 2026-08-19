import { expect } from 'chai';
import sinon from 'sinon';

import { SessionExpiredError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { registerCandidateParticipation } from '../../../../../../src/certification/enrolment/domain/usecases/register-candidate-participation.js';
import { CenterHabilitationError } from '../../../../../../src/certification/shared/domain/errors.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { NotFoundError, UserNotAuthorizedToCertifyError } from '../../../../../../src/shared/domain/errors.js';
import {
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  MatchingReconciledStudentNotFoundError,
  UserAlreadyLinkedToCandidateInSessionError,
} from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Usecase | register-candidate-participation', function () {
  let normalizeStringFnc,
    candidateRepository,
    centerRepository,
    sessionRepository,
    userRepository,
    placementProfileService,
    eventAdapter,
    sessionAuthorizationAdapter,
    dependencies;
  const sessionId = 456;

  beforeEach(function () {
    sinon.useFakeTimers({ now: new Date('2026-04-05T03:04:05Z'), toFake: ['Date'] });
    sessionAuthorizationAdapter = {
      find: sinon.stub(),
    };

    normalizeStringFnc = (str) => str;

    eventAdapter = {
      onCandidateReconciled: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
    };

    centerRepository = {
      getById: sinon.stub(),
    };

    candidateRepository = {
      update: sinon.stub(),
    };

    sessionRepository = {
      get: sinon.stub(),
    };

    placementProfileService = {
      getPlacementProfile: sinon.stub(),
    };

    dependencies = {
      normalizeStringFnc,
      candidateRepository,
      centerRepository,
      sessionRepository,
      userRepository,
      placementProfileService,
      eventAdapter,
      sessionAuthorizationAdapter,
    };
  });

  it('throws NotFoundError when the session does not exist', async function () {
    const userId = 123;
    const sessionId = 456;

    sessionAuthorizationAdapter.find.resolves(null);

    const error = await catchErr(registerCandidateParticipation)({
      firstName: 'Tony',
      lastName: 'Stark',
      birthdate: '1994-07-18',
      userId,
      sessionId,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(NotFoundError);
  });

  it('throws SessionExpiredError when session has expired', async function () {
    const userId = 123;
    const sessionId = 456;

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId, hasExpired: true, hasStarted: true, isFinalized: false })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const error = await catchErr(registerCandidateParticipation)({
      firstName: 'Tony',
      lastName: 'Stark',
      birthdate: '1994-07-18',
      userId,
      sessionId,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(SessionExpiredError);
  });

  it('throws UserAlreadyLinkedToCandidateInSessionError when given user is already reconciled to an other candidate than matching', async function () {
    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();
    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const matchingCandidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .asReconciled({
        userId: 456,
      })
      .withIdentity({
        firstName: 'Brice',
        lastName: 'Wine',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      });
    const alreadyReconciledCandidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .asReconciled({
        userId: 123,
      })
      .withIdentity({
        firstName: 'Tony',
        lastName: 'Stark',
        birthdate: '1994-07-18',
      })
      .withParameters({
        sessionId,
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({ id: sessionId })
      .addCandidatesBuilders([matchingCandidateBuilder, alreadyReconciledCandidateBuilder])
      .build();
    sessionRepository.get.resolves(session);

    const error = await catchErr(registerCandidateParticipation)({
      firstName: 'Brice',
      lastName: 'Wine',
      birthdate: '2000-03-23',
      userId: 123,
      sessionId,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(UserAlreadyLinkedToCandidateInSessionError);
  });

  it('throws UserAlreadyLinkedToCandidateInSessionError when given user is already reconciled to an other candidate of the session', async function () {
    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();
    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const matchingCandidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName: 'Brice',
        lastName: 'Wine',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      });
    const candidateAlreadyReconciledToUserBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .asReconciled({
        userId: 123,
      })
      .withIdentity({
        firstName: 'Tony',
        lastName: 'Stark',
        birthdate: '1994-07-18',
      })
      .withParameters({
        sessionId,
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({ id: sessionId })
      .addCandidatesBuilders([matchingCandidateBuilder, candidateAlreadyReconciledToUserBuilder])
      .build();
    sessionRepository.get.resolves(session);

    const error = await catchErr(registerCandidateParticipation)({
      firstName: 'Brice',
      lastName: 'Wine',
      birthdate: '2000-03-23',
      userId: 123,
      sessionId,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(UserAlreadyLinkedToCandidateInSessionError);
    expect(candidateRepository.update).to.not.have.been.called;
  });

  it('throws CertificationCandidateByPersonalInfoNotFoundError when given user personnal infos not matching', async function () {
    const userId = domainBuilder.certification.enrolment.buildUser().id;
    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();
    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const candidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName: 'Brice',
        lastName: 'Wine',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({ id: sessionId })
      .addCandidatesBuilders([candidateBuilder])
      .build();
    sessionRepository.get.resolves(session);

    const error = await catchErr(registerCandidateParticipation)({
      firstName: 'Carole',
      lastName: 'Pasdebol',
      birthdate: '1996-05-14',
      userId,
      sessionId,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(CertificationCandidateByPersonalInfoNotFoundError);
  });

  it('throws CertificationCandidateByPersonalInfoTooManyMatchesError when given user personnal infos matching more than one user', async function () {
    const userId = domainBuilder.certification.enrolment.buildUser().id;
    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();
    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const candidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName: 'Brice',
        lastName: 'Wine',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      });
    const otherCandidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName: 'Brice',
        lastName: 'Wine',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({ id: sessionId })
      .addCandidatesBuilders([candidateBuilder, otherCandidateBuilder])
      .build();
    sessionRepository.get.resolves(session);

    const error = await catchErr(registerCandidateParticipation)({
      firstName: 'Brice',
      lastName: 'Wine',
      birthdate: '2000-03-23',
      userId,
      sessionId,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(CertificationCandidateByPersonalInfoTooManyMatchesError);
  });

  it('returns candidate if match with user identity and already reconciled', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const userId = domainBuilder.certification.enrolment.buildUser().id;

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();
    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const alreadyLinkedCandidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .asReconciled({
        userId,
        reconciledAt: new Date('2024-09-25'),
      })
      .withIdentity({
        firstName,
        lastName,
        birthdate,
      })
      .withParameters({
        sessionId,
      });
    const otherCandidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName: 'Gary',
        lastName: 'Bidule',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({ id: sessionId })
      .addCandidatesBuilders([alreadyLinkedCandidateBuilder, otherCandidateBuilder])
      .build();
    sessionRepository.get.resolves(session);

    // when
    const reconciledCandidate = await registerCandidateParticipation({
      firstName,
      birthdate,
      lastName,
      userId,
      sessionId,
      ...dependencies,
    });

    // then
    expect(reconciledCandidate).to.deep.equal(alreadyLinkedCandidateBuilder.build());
  });

  it('throws CenterHabilitationError when candidate subscribe to a pixplus certif and center is not habilited for it', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const userId = domainBuilder.certification.enrolment.buildUser().id;

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();
    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const candidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName,
        lastName,
        birthdate,
      })
      .withSubscription(Frameworks.DROIT)
      .withParameters({
        sessionId,
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({ id: sessionId })
      .addCandidatesBuilders([candidateBuilder])
      .build();
    sessionRepository.get.resolves(session);
    const certificationCenter = domainBuilder.certification.enrolment.buildCenter({ habilitations: [] });
    centerRepository.getById.resolves(certificationCenter);

    const error = await catchErr(registerCandidateParticipation)({
      firstName,
      birthdate,
      lastName,
      userId,
      sessionId,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(CenterHabilitationError);
  });

  it('throws MatchingReconciledStudentNotFoundError when center is managing student and candidate orgaLearnerId doesnt match user orgaLearnerIds', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const user = domainBuilder.certification.enrolment.buildUser({ organizationLearnerId: [35] });

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();
    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const candidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName,
        lastName,
        birthdate,
      })
      .withSubscription(Frameworks.CORE)
      .asScoCandidate({ organizationLearnerId: 12 })
      .withParameters({
        sessionId,
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({ id: sessionId })
      .addCandidatesBuilders([candidateBuilder])
      .build();
    sessionRepository.get.resolves(session);
    const organization = domainBuilder.buildOrganization({ isManagingStudents: true });
    const certificationCenter = domainBuilder.certification.enrolment.buildCenter({
      matchingOrganization: organization,
    });
    centerRepository.getById.resolves(certificationCenter);
    userRepository.get.resolves(user);

    const error = await catchErr(registerCandidateParticipation)({
      firstName,
      birthdate,
      lastName,
      userId: user.id,
      sessionId,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(MatchingReconciledStudentNotFoundError);
  });

  it('throws UserNotAuthorizedToCertifyError if user is not certifiable', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const user = domainBuilder.certification.enrolment.buildUser();

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();
    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const candidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName,
        lastName,
        birthdate,
      })
      .withSubscription(Frameworks.CORE)
      .withParameters({
        sessionId,
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({ id: sessionId })
      .addCandidatesBuilders([candidateBuilder])
      .build();
    sessionRepository.get.resolves(session);
    const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
    const certificationCenter = domainBuilder.certification.enrolment.buildCenter({
      habilitations: [{ key: Frameworks.CORE }],
      matchingOrganization: organization,
    });
    const placementProfile = domainBuilder.buildPlacementProfile({ userId: user.id });
    centerRepository.getById.resolves(certificationCenter);
    userRepository.get.resolves(user);
    placementProfileService.getPlacementProfile.resolves(placementProfile);

    const error = await catchErr(registerCandidateParticipation)({
      firstName,
      birthdate,
      lastName,
      userId: user.id,
      sessionId,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(UserNotAuthorizedToCertifyError);
  });

  it('returns reconciled candidate after update it and send event about reconciliation', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const user = domainBuilder.certification.enrolment.buildUser();

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();
    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    const candidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName,
        lastName,
        birthdate,
      })
      .withSubscription(Frameworks.CORE)
      .withParameters({
        sessionId,
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({ id: sessionId })
      .addCandidatesBuilders([candidateBuilder])
      .build();
    sessionRepository.get.resolves(session);
    const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
    const certificationCenter = domainBuilder.certification.enrolment.buildCenter({
      habilitations: [{ key: Frameworks.CORE }],
      matchingOrganization: organization,
    });
    const placementProfile = domainBuilder.buildPlacementProfile.buildCertifiable({ userId: user.id });
    centerRepository.getById.resolves(certificationCenter);
    userRepository.get.resolves(user);
    placementProfileService.getPlacementProfile.resolves(placementProfile);

    const reconciledCandidate = await registerCandidateParticipation({
      firstName,
      birthdate,
      lastName,
      userId: user.id,
      sessionId,
      ...dependencies,
    });

    sinon.assert.calledOnceWithExactly(candidateRepository.update, reconciledCandidate);
    sinon.assert.calledOnceWithExactly(eventAdapter.onCandidateReconciled, {
      candidate: reconciledCandidate,
    });
    expect(reconciledCandidate).to.deep.equal(
      candidateBuilder.asReconciled({ at: new Date(), userId: user.id }).build(),
    );
  });
});
