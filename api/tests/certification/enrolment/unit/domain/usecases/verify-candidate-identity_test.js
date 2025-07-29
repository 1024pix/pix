import { verifyCandidateIdentity } from '../../../../../../src/certification/enrolment/domain/usecases/verify-candidate-identity.js';
import { types } from '../../../../../../src/organizational-entities/domain/models/Organization.js';
import {
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  LanguageNotSupportedError,
  MatchingReconciledStudentNotFoundError,
  UnexpectedUserAccountError,
  UserAlreadyLinkedToCandidateInSessionError,
} from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | UseCase | verify-candidate-identity', function () {
  let candidateRepository, centerRepository, sessionRepository, userRepository;
  let normalizeStringFnc;
  let dependencies;
  const sessionId = 1;
  const userId = 2;
  const certificationCenterId = 3;
  let firstName, lastName, birthdate;

  beforeEach(function () {
    candidateRepository = {
      findBySessionId: sinon.stub(),
    };
    centerRepository = {
      getById: sinon.stub(),
    };
    sessionRepository = {
      get: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
    };
    normalizeStringFnc = (str) => str;
    firstName = 'Charles';
    lastName = 'Neuf';
    birthdate = '2010-01-01';
    dependencies = {
      userId,
      sessionId,
      firstName,
      lastName,
      birthdate,
      candidateRepository,
      centerRepository,
      sessionRepository,
      userRepository,
      normalizeStringFnc,
    };
  });

  it('should return the candidate', async function () {
    // given
    const session = domainBuilder.certification.enrolment.buildSession({
      id: sessionId,
      certificationCenterId,
    });
    const matchingCandidate = domainBuilder.certification.enrolment.buildCandidate({
      firstName,
      lastName,
      userId: null,
      birthdate,
      subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
    });

    userRepository.get.withArgs({ id: userId }).resolves(
      domainBuilder.certification.enrolment.buildUser({
        id: userId,
        lang: 'fr',
      }),
    );
    centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(
      domainBuilder.certification.enrolment.buildCenter({
        id: certificationCenterId,
        matchingOrganization: null,
      }),
    );
    sessionRepository.get.withArgs({ id: sessionId }).resolves(session);

    candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
      matchingCandidate,
      domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Henri',
        lastName: 'Quatre',
        birthdate: '2005-05-01',
        subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
      }),
    ]);

    // when
    const result = await verifyCandidateIdentity({
      ...dependencies,
    });

    // then
    expect(result).to.deep.equal(matchingCandidate);
  });

  context('when user language is not available for certification', function () {
    it('should throw a LanguageNotSupportedError', async function () {
      // given
      sessionRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.enrolment.buildSession({
          id: sessionId,
          certificationCenterId,
        }),
      );
      userRepository.get.withArgs({ id: userId }).resolves(
        domainBuilder.certification.enrolment.buildUser({
          id: userId,
          lang: 'Le blop blop martien du sud',
        }),
      );

      // when
      const error = await catchErr(verifyCandidateIdentity)({
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceof(LanguageNotSupportedError);
      expect(error.message).to.equal('Given language is not supported : "Le blop blop martien du sud"');
    });
  });

  context('when there are no matching candidate in session with provided personal info', function () {
    it('should throw a CertificationCandidateByPersonalInfoNotFoundError', async function () {
      // given
      userRepository.get.withArgs({ id: userId }).resolves(
        domainBuilder.certification.enrolment.buildUser({
          id: userId,
          lang: 'fr',
        }),
      );
      sessionRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.enrolment.buildSession({
          id: sessionId,
          certificationCenterId,
        }),
      );
      candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
        domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Henri',
          lastName: 'Quatre',
          birthdate: '2005-05-01',
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        }),
      ]);

      // when
      const error = await catchErr(verifyCandidateIdentity)({
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceof(CertificationCandidateByPersonalInfoNotFoundError);
      expect(error.message).to.equal('No certification candidate matches with the provided personal info');
    });
  });

  context('when there are more than one matching candidate in session with provided personal info', function () {
    it('should throw a CertificationCandidateByPersonalInfoTooManyMatchesError', async function () {
      // given
      userRepository.get.withArgs({ id: userId }).resolves(
        domainBuilder.certification.enrolment.buildUser({
          id: userId,
          lang: 'fr',
        }),
      );
      sessionRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.enrolment.buildSession({
          id: sessionId,
          certificationCenterId,
        }),
      );
      candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
        domainBuilder.certification.enrolment.buildCandidate({
          firstName,
          lastName,
          userId: null,
          birthdate,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          firstName,
          lastName,
          userId: null,
          birthdate,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        }),
      ]);

      // when
      const error = await catchErr(verifyCandidateIdentity)({
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceof(CertificationCandidateByPersonalInfoTooManyMatchesError);
      expect(error.message).to.equal('More than one candidate match with the provided personal info');
    });
  });

  context('when there are one matching candidate in session with provided personal info', function () {
    context('when matching candidate is already reconciled to another user', function () {
      it('should throw a UnexpectedUserAccountError', async function () {
        // given
        userRepository.get.withArgs({ id: userId }).resolves(
          domainBuilder.certification.enrolment.buildUser({
            id: userId,
            lang: 'fr',
          }),
        );
        centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(
          domainBuilder.certification.enrolment.buildCenter({
            id: certificationCenterId,
            matchingOrganization: null,
          }),
        );
        sessionRepository.get.withArgs({ id: sessionId }).resolves(
          domainBuilder.certification.enrolment.buildSession({
            id: sessionId,
            certificationCenterId,
          }),
        );

        const matchingCandidateAlreadyLinkedToAnotherUserId = domainBuilder.certification.enrolment.buildCandidate({
          firstName,
          lastName,
          userId: userId + 10,
          reconciledAt: new Date('2024-09-25'),
          birthdate,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        });

        candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
          matchingCandidateAlreadyLinkedToAnotherUserId,
          domainBuilder.certification.enrolment.buildCandidate({
            firstName: 'Henri',
            lastName: 'Quatre',
            birthdate: '2005-05-01',
            subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
          }),
        ]);

        // when
        const error = await catchErr(verifyCandidateIdentity)({
          ...dependencies,
        });

        // then
        expect(error).to.be.instanceof(UnexpectedUserAccountError);
      });
    });

    context('when matching candidate is already reconciled to given user', function () {
      it('should return a succes indicating no reconciliation done', async function () {
        // given
        userRepository.get.withArgs({ id: userId }).resolves(
          domainBuilder.certification.enrolment.buildUser({
            id: userId,
            lang: 'fr',
          }),
        );
        centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(
          domainBuilder.certification.enrolment.buildCenter({
            id: certificationCenterId,
            matchingOrganization: null,
          }),
        );
        sessionRepository.get.withArgs({ id: sessionId }).resolves(
          domainBuilder.certification.enrolment.buildSession({
            id: sessionId,
            certificationCenterId,
          }),
        );

        const matchingCandidateAlreadyLinked = domainBuilder.certification.enrolment.buildCandidate({
          firstName,
          lastName,
          userId,
          reconciledAt: new Date('2024-09-25'),
          birthdate,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        });

        candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
          matchingCandidateAlreadyLinked,
          domainBuilder.certification.enrolment.buildCandidate({
            firstName: 'Henri',
            lastName: 'Quatre',
            birthdate: '2005-05-01',
            subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
          }),
        ]);

        // when
        const result = await verifyCandidateIdentity({
          ...dependencies,
        });

        // then
        expect(result).to.deep.equal(matchingCandidateAlreadyLinked);
      });
    });

    context('when user is already reconciled to another matching candidate within the same session', function () {
      it('should throw a UserAlreadyLinkedToCandidateInSessionError', async function () {
        // given
        userRepository.get.withArgs({ id: userId }).resolves(
          domainBuilder.certification.enrolment.buildUser({
            id: userId,
            lang: 'fr',
          }),
        );
        centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(
          domainBuilder.certification.enrolment.buildCenter({
            id: certificationCenterId,
            matchingOrganization: null,
          }),
        );
        sessionRepository.get.withArgs({ id: sessionId }).resolves(
          domainBuilder.certification.enrolment.buildSession({
            id: sessionId,
            certificationCenterId,
          }),
        );

        const anotherCandidateWithGivenUserId = domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Louis',
          lastName: 'Michel',
          userId,
          reconciledAt: new Date('2024-09-25'),
          birthdate: '2005-05-01',
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        });

        candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
          domainBuilder.certification.enrolment.buildCandidate({
            firstName,
            lastName,
            userId: null,
            birthdate,
            subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
          }),
          anotherCandidateWithGivenUserId,
        ]);

        // when
        const error = await catchErr(verifyCandidateIdentity)({
          ...dependencies,
        });

        // then
        expect(error).to.be.instanceof(UserAlreadyLinkedToCandidateInSessionError);
        expect(error.message).to.equal(
          'The user is already linked to a candidate with different personal info in the given session',
        );
      });
    });

    context('when reconciliation is non-existent on all sides', function () {
      context('when it is a session sco / is managing students', function () {
        context('when matching candidate is not related to a reconcilied learner', function () {
          it('should throw a MatchingReconciledStudentNotFoundError', async function () {
            // given
            const matchingOrganization = domainBuilder.certification.enrolment.buildMatchingOrganization({
              type: types.SCO,
              isManagingStudents: true,
            });
            centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(
              domainBuilder.certification.enrolment.buildCenter({
                id: certificationCenterId,
                matchingOrganization,
              }),
            );
            userRepository.get.withArgs({ id: userId }).resolves(
              domainBuilder.certification.enrolment.buildUser({
                id: userId,
                lang: 'fr',
                organizationLearnerIds: [123],
              }),
            );
            sessionRepository.get.withArgs({ id: sessionId }).resolves(
              domainBuilder.certification.enrolment.buildSession({
                id: sessionId,
                certificationCenterId,
              }),
            );

            candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
              domainBuilder.certification.enrolment.buildCandidate({
                firstName,
                lastName,
                userId: null,
                birthdate,
                organizationLearnerId: 789,
                subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
              }),
              domainBuilder.certification.enrolment.buildCandidate({
                firstName: 'Henri',
                lastName: 'Quatre',
                birthdate: '2005-05-01',
                subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
              }),
            ]);

            // when
            const error = await catchErr(verifyCandidateIdentity)({
              ...dependencies,
              firstName,
              lastName,
              birthdate,
            });

            // then
            expect(error).to.be.instanceof(MatchingReconciledStudentNotFoundError);
          });
        });
      });
    });
  });
});
