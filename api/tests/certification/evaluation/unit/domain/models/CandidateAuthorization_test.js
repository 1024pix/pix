import { expect } from 'chai';

import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  CenterNotHabilitatedError,
  SessionNotAccessibleError,
} from '../../../../../../src/certification/evaluation/domain/errors.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Domain | Models | Candidate Authorization', function () {
  describe('#get verifyCanStartOrResumeCertification', function () {
    context('when access code entered by candidate is incorrect', function () {
      it('throws a NotFoundError', function () {
        const candidateAuthorization = domainBuilder.certification.evaluation
          .candidateAuthorizationBuilder()
          .withSession({ accessCode: 'ABCDEF' })
          .build();

        expect(() => candidateAuthorization.verifyCanStartOrResumeCertification('GHIJKL')).to.throw(NotFoundError);
      });
    });

    context('when session is not accessible', function () {
      it('throws a SessionNotAccessible', function () {
        const candidateAuthorization = domainBuilder.certification.evaluation
          .candidateAuthorizationBuilder()
          .withSession({ accessCode: 'ABCDEF', isAccessible: false })
          .build();

        expect(() => candidateAuthorization.verifyCanStartOrResumeCertification('ABCDEF')).to.throw(
          SessionNotAccessibleError,
        );
      });
    });

    context('when center is not habilitated for subscription', function () {
      it('throws a CenterHabilitationError', function () {
        const candidateAuthorization = domainBuilder.certification.evaluation
          .candidateAuthorizationBuilder()
          .withSession({ accessCode: 'ABCDEF', isAccessible: true })
          .subscribedTo({ framework: Frameworks.CLEA, isCenterHabilitated: false })
          .build();

        expect(() => candidateAuthorization.verifyCanStartOrResumeCertification('ABCDEF')).to.throw(
          CenterNotHabilitatedError,
        );
      });
    });

    context('when candidate is not authorized to start', function () {
      context('when candidate has already started the test', function () {
        it('throws a CandidateNotAuthorizedToResumeCertificationTestError', function () {
          const candidateAuthorization = domainBuilder.certification.evaluation
            .candidateAuthorizationBuilder()
            .withSession({ accessCode: 'ABCDEF', isAccessible: true })
            .subscribedTo({ framework: Frameworks.CLEA, isCenterHabilitated: true })
            .asNotAuthorizedToStart()
            .hasACertification({ certificationId: 123 })
            .build();

          expect(() => candidateAuthorization.verifyCanStartOrResumeCertification('ABCDEF')).to.throw(
            CandidateNotAuthorizedToResumeCertificationTestError,
          );
        });
      });

      context('when candidate has not started the test yet', function () {
        it('throws a CandidateNotAuthorizedToJoinSessionError', function () {
          const candidateAuthorization = domainBuilder.certification.evaluation
            .candidateAuthorizationBuilder()
            .withSession({ accessCode: 'ABCDEF', isAccessible: true })
            .subscribedTo({ framework: Frameworks.CLEA, isCenterHabilitated: true })
            .asNotAuthorizedToStart()
            .build();

          expect(() => candidateAuthorization.verifyCanStartOrResumeCertification('ABCDEF')).to.throw(
            CandidateNotAuthorizedToJoinSessionError,
          );
        });
      });

      context('when all conditions are met', function () {
        it('returns', function () {
          const candidateAuthorizationWithNoTestStarted = domainBuilder.certification.evaluation
            .candidateAuthorizationBuilder()
            .withSession({ accessCode: 'ABCDEF', isAccessible: true })
            .subscribedTo({ framework: Frameworks.CLEA, isCenterHabilitated: true })
            .asAuthorizedToStart()
            .build();
          const candidateAuthorizationWithStartedTest = domainBuilder.certification.evaluation
            .candidateAuthorizationBuilder()
            .withSession({ accessCode: 'ABCDEF', isAccessible: true })
            .subscribedTo({ framework: Frameworks.CLEA, isCenterHabilitated: true })
            .asAuthorizedToStart()
            .hasACertification({ certificationId: 123 })
            .build();

          expect(() =>
            candidateAuthorizationWithNoTestStarted.verifyCanStartOrResumeCertification('ABCDEF'),
          ).to.not.throw();
          expect(() =>
            candidateAuthorizationWithStartedTest.verifyCanStartOrResumeCertification('ABCDEF'),
          ).to.not.throw();
        });
      });
    });
  });
});
