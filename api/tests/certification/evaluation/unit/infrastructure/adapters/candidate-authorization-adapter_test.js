import sinon from 'sinon';

import * as candidateAuthorizationAdapter from '../../../../../../src/certification/evaluation/infrastructure/adapters/candidate-authorization-adapter.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Adapter | Candidate authorization', function () {
  let candidateAuthorizationApi, dependencies;

  beforeEach(function () {
    candidateAuthorizationApi = {
      findByUserIdAndSessionId: sinon.stub(),
    };

    dependencies = {
      candidateAuthorizationApi,
    };
  });

  context('#findCandidateAuthorization', function () {
    context('when candidate authorization not found', function () {
      it('returns null', async function () {
        candidateAuthorizationApi.findByUserIdAndSessionId.withArgs({ userId: 123, sessionId: 456 }).resolves(null);

        const candidateAuthorization = await candidateAuthorizationAdapter.find({
          userId: 123,
          sessionId: 456,
          dependencies,
        });

        expect(candidateAuthorization).to.be.null;
      });
    });

    context('when candidate authorization is found', function () {
      it('returns expected CandidateAuthorization', async function () {
        candidateAuthorizationApi.findByUserIdAndSessionId.withArgs({ userId: 123, sessionId: 456 }).resolves({
          id: 789,
          accessCode: 'EXPEDITION33',
          isSessionJoinable: true,
          userId: 123,
          reconciledAt: new Date('2023-12-11'),
          subscription: Frameworks.DROIT,
          authorizedToStart: true,
          certificationId: 456,
          hasExceededCertificationDuration: true,
          isCenterHabilitatedForCandidateSubscription: true,
        });

        const candidateAuthorization = await candidateAuthorizationAdapter.find({
          userId: 123,
          sessionId: 456,
          dependencies,
        });

        expect(candidateAuthorization).to.deepEqualInstance(
          domainBuilder.certification.evaluation
            .candidateAuthorizationBuilder()
            .withSession({ accessCode: 'EXPEDITION33', isJoinable: true })
            .reconciled({ userId: 123, at: new Date('2023-12-11') })
            .subscribedTo({ framework: Frameworks.DROIT, isCenterHabilitated: true })
            .asAuthorizedToStart()
            .hasACertification({ certificationId: 456, hasExceededCertificationDuration: true })
            .withParameters({ id: 789 })
            .build(),
        );
      });
    });
  });
});
