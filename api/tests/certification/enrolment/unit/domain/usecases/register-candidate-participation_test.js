import { expect } from 'chai';
import sinon from 'sinon';

import {
  SessionExpiredError,
  WrongDomainExtensionForPixPlusError,
} from '../../../../../../src/certification/enrolment/domain/errors.js';
import { registerCandidateParticipation } from '../../../../../../src/certification/enrolment/domain/usecases/register-candidate-participation.js';
import { CenterHabilitationError } from '../../../../../../src/certification/shared/domain/errors.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { UserNotAuthorizedToCertifyError } from '../../../../../../src/shared/domain/errors.js';
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
    sessionAuthorizationAdapter = {
      find: sinon.stub(),
    };

    normalizeStringFnc = sinon.stub();

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
      findBySessionId: sinon.stub(),
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
      isFrenchDomainExtension: true,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(SessionExpiredError);
  });

  it('throws UserAlreadyLinkedToCandidateInSessionError when given user is already reconciled to an other candidate than matching', async function () {
    const userId = domainBuilder.certification.enrolment.buildUser().id;
    const otherUserId = domainBuilder.certification.enrolment.buildUser({ id: 456 }).id;
    const matchingCandidate = domainBuilder.certification.enrolment
      .candidateBuilder()
      .asReconciled({
        userId: otherUserId,
      })
      .withIdentity({
        firstName: 'Brice',
        lastName: 'Wine',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      })
      .build();

    const alreadyReconciledCandidate = domainBuilder.certification.enrolment
      .candidateBuilder()
      .asReconciled({
        userId,
      })
      .withIdentity({
        firstName: 'Tony',
        lastName: 'Stark',
        birthdate: '1994-07-18',
      })
      .withParameters({
        sessionId,
      })
      .build();

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);
    const session = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
    sessionRepository.get.resolves(session);
    candidateRepository.findBySessionId.resolves([matchingCandidate, alreadyReconciledCandidate]);

    const error = await catchErr(registerCandidateParticipation)({
      firstName: 'Brice',
      lastName: 'Wine',
      birthdate: '2000-03-23',
      userId,
      sessionId,
      isFrenchDomainExtension: true,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(UserAlreadyLinkedToCandidateInSessionError);
  });

  it('throws CertificationCandidateByPersonalInfoNotFoundError when given user personnal infos not matching', async function () {
    const userId = domainBuilder.certification.enrolment.buildUser().id;
    const candidate = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName: 'Brice',
        lastName: 'Wine',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      })
      .build();
    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);
    const session = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
    sessionRepository.get.resolves(session);
    candidateRepository.findBySessionId.resolves([candidate]);

    const error = await catchErr(registerCandidateParticipation)({
      firstName: 'Carole',
      lastName: 'Pasdebol',
      birthdate: '1996-05-14',
      userId,
      sessionId,
      isFrenchDomainExtension: true,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(CertificationCandidateByPersonalInfoNotFoundError);
  });

  it('throws CertificationCandidateByPersonalInfoTooManyMatchesError when given user personnal infos matching more than one user', async function () {
    const userId = domainBuilder.certification.enrolment.buildUser().id;
    const candidate = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName: 'Brice',
        lastName: 'Wine',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      })
      .build();

    const otherCandidate = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName: 'Brice',
        lastName: 'Wine',
        birthdate: '2000-03-23',
      })
      .withParameters({
        sessionId,
      })
      .build();
    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);
    const session = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
    sessionRepository.get.resolves(session);
    candidateRepository.findBySessionId.resolves([candidate, otherCandidate]);

    const error = await catchErr(registerCandidateParticipation)({
      firstName: 'Brice',
      lastName: 'Wine',
      birthdate: '2000-03-23',
      userId,
      sessionId,
      isFrenchDomainExtension: true,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(CertificationCandidateByPersonalInfoTooManyMatchesError);
  });

  it('returns candidate if match with user identity and already reconciled', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    // given
    const userId = domainBuilder.certification.enrolment.buildUser().id;
    const alreadyLinkedCandidate = domainBuilder.certification.enrolment
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
      })
      .build();

    const session = domainBuilder.certification.enrolment.buildSession({ id: sessionId });

    const otherCandidate = domainBuilder.certification.enrolment.candidateBuilder().build();
    const candidates = [alreadyLinkedCandidate, otherCandidate];
    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    sessionRepository.get.resolves(session);
    candidateRepository.findBySessionId.resolves(candidates);

    // when
    const reconciledCandidate = await registerCandidateParticipation({
      firstName,
      birthdate,
      lastName,
      userId,
      sessionId,
      isFrenchDomainExtension: true,
      ...dependencies,
    });

    // then
    expect(reconciledCandidate).to.deep.equal(alreadyLinkedCandidate);
  });

  it('throws CenterHabilitationError when candidate subscribe to a pixplus certif and center is not habilited for it', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const userId = domainBuilder.certification.enrolment.buildUser().id;
    const candidate = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName,
        lastName,
        birthdate,
      })
      .withSubscription(Frameworks.DROIT)
      .withParameters({
        sessionId,
      })
      .build();
    const session = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
    const certificationCenter = domainBuilder.certification.enrolment.buildCenter({ habilitations: [] });

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);
    sessionRepository.get.resolves(session);
    candidateRepository.findBySessionId.resolves([candidate]);
    centerRepository.getById.resolves(certificationCenter);

    const error = await catchErr(registerCandidateParticipation)({
      firstName,
      birthdate,
      lastName,
      userId,
      sessionId,
      isFrenchDomainExtension: true,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(CenterHabilitationError);
  });

  it('throws MatchingReconciledStudentNotFoundError when center is managing student and candidate orgaLearnerId doesnt match user orgaLearnerIds', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const user = domainBuilder.certification.enrolment.buildUser({ organizationLearnerId: [35] });
    const candidate = domainBuilder.certification.enrolment
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
      })
      .build();
    const organization = domainBuilder.buildOrganization({ isManagingStudents: true });
    const session = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
    const certificationCenter = domainBuilder.certification.enrolment.buildCenter({
      matchingOrganization: organization,
    });

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);
    sessionRepository.get.resolves(session);
    candidateRepository.findBySessionId.resolves([candidate]);
    centerRepository.getById.resolves(certificationCenter);
    userRepository.get.resolves(user);

    const error = await catchErr(registerCandidateParticipation)({
      firstName,
      birthdate,
      lastName,
      userId: user.id,
      sessionId,
      isFrenchDomainExtension: true,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(MatchingReconciledStudentNotFoundError);
  });

  it('throws WrongDomainExtensionForPixPlusError when not CORE session from not `.fr` extension', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const user = domainBuilder.certification.enrolment.buildUser();
    const candidate = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName,
        lastName,
        birthdate,
      })
      .withSubscription(Frameworks.DROIT)
      .withParameters({
        sessionId,
      })
      .build();
    const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
    const session = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
    const certificationCenter = domainBuilder.certification.enrolment.buildCenter({
      habilitations: [{ key: Frameworks.DROIT }],
      matchingOrganization: organization,
    });
    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);

    sessionRepository.get.resolves(session);
    candidateRepository.findBySessionId.resolves([candidate]);
    centerRepository.getById.resolves(certificationCenter);
    userRepository.get.resolves(user);

    const error = await catchErr(registerCandidateParticipation)({
      firstName,
      birthdate,
      lastName,
      userId: user.id,
      sessionId,
      isFrenchDomainExtension: false,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(WrongDomainExtensionForPixPlusError);
  });

  it('throws UserNotAuthorizedToCertifyError if user is not certifiable', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const user = domainBuilder.certification.enrolment.buildUser();
    const candidate = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName,
        lastName,
        birthdate,
      })
      .withSubscription(Frameworks.CORE)
      .withParameters({
        sessionId,
      })
      .build();
    const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
    const session = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
    const certificationCenter = domainBuilder.certification.enrolment.buildCenter({
      habilitations: [{ key: Frameworks.CORE }],
      matchingOrganization: organization,
    });
    const placementProfile = domainBuilder.buildPlacementProfile({ userId: user.id });

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);
    sessionRepository.get.resolves(session);
    candidateRepository.findBySessionId.resolves([candidate]);
    centerRepository.getById.resolves(certificationCenter);
    userRepository.get.resolves(user);
    placementProfileService.getPlacementProfile.resolves(placementProfile);

    const error = await catchErr(registerCandidateParticipation)({
      firstName,
      birthdate,
      lastName,
      userId: user.id,
      sessionId,
      isFrenchDomainExtension: true,
      ...dependencies,
    });

    expect(error).to.be.instanceOf(UserNotAuthorizedToCertifyError);
  });

  it('returns reconciled candidate after update it and send event about reconciliation', async function () {
    const firstName = 'Brice';
    const lastName = 'Wine';
    const birthdate = '2000-03-23';
    const user = domainBuilder.certification.enrolment.buildUser();
    const candidate = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withIdentity({
        firstName,
        lastName,
        birthdate,
      })
      .withSubscription(Frameworks.CORE)
      .withParameters({
        sessionId,
      })
      .build();
    const organization = domainBuilder.buildOrganization({ isManagingStudents: false });
    const session = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
    const certificationCenter = domainBuilder.certification.enrolment.buildCenter({
      habilitations: [{ key: Frameworks.CORE }],
      matchingOrganization: organization,
    });
    const placementProfile = domainBuilder.buildPlacementProfile.buildCertifiable({ userId: user.id });

    const sessionAuthorization = domainBuilder.certification.enrolment
      .sessionAuthorizationBuilder()
      .withParameters({ id: sessionId })
      .build();

    sessionAuthorizationAdapter.find.resolves(sessionAuthorization);
    sessionRepository.get.resolves(session);
    candidateRepository.findBySessionId.resolves([candidate]);
    centerRepository.getById.resolves(certificationCenter);
    userRepository.get.resolves(user);
    placementProfileService.getPlacementProfile.resolves(placementProfile);

    const reconciledCandidate = await registerCandidateParticipation({
      firstName,
      birthdate,
      lastName,
      userId: user.id,
      sessionId,
      isFrenchDomainExtension: true,
      ...dependencies,
    });

    sinon.assert.calledOnceWithExactly(candidateRepository.update, candidate);

    sinon.assert.calledOnceWithExactly(eventAdapter.onCandidateReconciled, {
      candidate,
    });

    expect(reconciledCandidate).to.deep.equal(candidate);
  });
});
