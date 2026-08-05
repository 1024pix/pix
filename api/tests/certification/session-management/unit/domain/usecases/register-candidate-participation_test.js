import { expect } from 'chai';
import sinon from 'sinon';

import { WrongDomainExtensionForPixPlusError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { registerCandidateParticipation } from '../../../../../../src/certification/session-management/domain/usecases/register-candidate-participation.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { UserNotAuthorizedToCertifyError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Usecase | register-candidate-participation', function () {
  let normalizeStringFnc,
    candidateRepository,
    centerRepository,
    sessionRepository,
    userRepository,
    verifyCandidateIdentityService,
    reconcileCandidateService,
    placementProfileService,
    eventAdapter,
    dependencies;

  const sessionId = 456;

  beforeEach(function () {
    normalizeStringFnc = sinon.stub();
    candidateRepository = Symbol('candidateRepository');
    centerRepository = Symbol('centerRepository');
    sessionRepository = Symbol('sessionRepository');
    userRepository = Symbol('userRepository');
    eventAdapter = Symbol('eventAdapter');
    placementProfileService = {
      getPlacementProfile: sinon.stub(),
    };
    reconcileCandidateService = {
      reconcileCandidate: sinon.stub(),
    };
    verifyCandidateIdentityService = {
      verifyCandidateIdentity: sinon.stub(),
    };

    preventStubsToBeCalledUnexpectedly([
      reconcileCandidateService.reconcileCandidate,
      verifyCandidateIdentityService.verifyCandidateIdentity,
    ]);

    dependencies = {
      normalizeStringFnc,
      candidateRepository,
      centerRepository,
      sessionRepository,
      userRepository,
      verifyCandidateIdentityService,
      reconcileCandidateService,
      placementProfileService,
      eventAdapter,
    };
  });

  context('when reconciliation is ok', function () {
    context('when the candidate is already link to a user', function () {
      it('should not link the candidate to the given user', async function () {
        const birthdate = '2000-03-23';
        // given
        const userId = domainBuilder.buildUser().id;
        const alreadyLinkedCandidate = domainBuilder.certification.enrolment
          .candidateBuilder()
          .asReconciled({
            userId,
            reconciledAt: new Date('2024-09-25'),
          })
          .withIdentity({
            firstName: 'Brice',
            lastName: 'Wine',
            birthdate,
          })
          .withParameters({
            sessionId,
          })
          .build();

        verifyCandidateIdentityService.verifyCandidateIdentity.resolves(alreadyLinkedCandidate);

        // when
        await registerCandidateParticipation({
          firstName: 'Brice',
          lastName: 'Wine',
          birthdate,
          userId,
          sessionId,
          isFrenchDomainExtension: true,
          ...dependencies,
        });

        // then
        sinon.assert.calledOnceWithExactly(verifyCandidateIdentityService.verifyCandidateIdentity, {
          firstName: 'Brice',
          lastName: 'Wine',
          birthdate,
          userId,
          sessionId,
          normalizeStringFnc,
          candidateRepository,
          centerRepository,
          sessionRepository,
          userRepository,
        });
      });
    });

    context('when the candidate has a complementary subscription and is on wrong domain', function () {
      it('should throw WrongDomainExtensionForPixPlusError', async function () {
        // given
        const userId = domainBuilder.buildUser().id;
        const candidateWithComplementary = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withSubscription(Frameworks.DROIT)
          .withIdentity({
            firstName: 'Brice',
            lastName: 'Wine',
            birthdate: new Date(),
          })
          .withParameters({
            sessionId,
          })
          .build();

        verifyCandidateIdentityService.verifyCandidateIdentity.resolves(candidateWithComplementary);

        // when
        const error = await catchErr(registerCandidateParticipation)({
          firstName: 'Brice',
          lastName: 'Wine',
          birthdate: new Date(),
          userId,
          sessionId,
          isFrenchDomainExtension: false,
          ...dependencies,
        });

        // then
        expect(error).to.be.instanceOf(WrongDomainExtensionForPixPlusError);
      });
    });

    context('when the candidate is not yet linked to a user', function () {
      let unlinkedCandidate;
      let userId;
      let clock;
      const now = new Date('2023-02-02');

      beforeEach(function () {
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
        userId = domainBuilder.buildUser().id;
        unlinkedCandidate = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Brice',
            lastName: 'Wine',
          })
          .build();
      });

      afterEach(function () {
        clock.restore();
      });

      context('when the candidate is not certifiable', function () {
        it('throws UserNotAuthorizedToCertifyError', async function () {
          // given
          unlinkedCandidate.reconcile();
          verifyCandidateIdentityService.verifyCandidateIdentity.resolves(unlinkedCandidate);
          placementProfileService.getPlacementProfile.resolves({
            isCertifiable: () => false,
          });

          // when
          const err = await catchErr(registerCandidateParticipation)({
            firstName: 'Brice',
            lastName: 'Wine',
            birthdate: new Date(),
            sessionId,
            userId,
            isFrenchDomainExtension: true,
            ...dependencies,
          });

          // then
          expect(err).to.be.instanceOf(UserNotAuthorizedToCertifyError);
          sinon.assert.calledOnceWith(verifyCandidateIdentityService.verifyCandidateIdentity, {
            firstName: 'Brice',
            lastName: 'Wine',
            birthdate: new Date(),
            userId,
            sessionId,
            normalizeStringFnc,
            candidateRepository,
            centerRepository,
            sessionRepository,
            userRepository,
          });
        });
      });

      it('verifies candidate subscriptions and reconcile candidate', async function () {
        // given
        unlinkedCandidate.reconcile();
        verifyCandidateIdentityService.verifyCandidateIdentity.resolves(unlinkedCandidate);
        reconcileCandidateService.reconcileCandidate.resolves(unlinkedCandidate);
        placementProfileService.getPlacementProfile.resolves({
          isCertifiable: () => true,
        });

        // when
        await registerCandidateParticipation({
          firstName: 'Brice',
          lastName: 'Wine',
          birthdate: new Date(),
          userId,
          sessionId,
          isFrenchDomainExtension: true,
          ...dependencies,
        });

        // then
        sinon.assert.calledOnceWith(verifyCandidateIdentityService.verifyCandidateIdentity, {
          firstName: 'Brice',
          lastName: 'Wine',
          birthdate: new Date(),
          userId,
          sessionId,
          normalizeStringFnc,
          candidateRepository,
          centerRepository,
          sessionRepository,
          userRepository,
        });
        sinon.assert.calledOnceWith(reconcileCandidateService.reconcileCandidate, {
          candidate: unlinkedCandidate,
          userId,
          candidateRepository,
          eventAdapter,
        });
      });
    });
  });
});
