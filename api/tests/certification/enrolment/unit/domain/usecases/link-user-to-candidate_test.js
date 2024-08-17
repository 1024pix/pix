import { linkUserToCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/link-user-to-candidate.js';
import { CERTIFICATION_VERSIONS } from '../../../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { types } from '../../../../../../src/organizational-entities/domain/models/Organization.js';
import {
  CertificationCandidateByPersonalInfoNotFoundError,
  LanguageNotSupportedError,
  MatchingReconciledStudentNotFoundError,
  UnexpectedUserAccountError,
  UserAlreadyLinkedToCandidateInSessionError,
} from '../../../../../../src/shared/domain/errors.js';
import { LANGUAGES_CODE } from '../../../../../../src/shared/domain/services/language-service.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | link-user-to-candidate', function () {
  let candidateRepository;
  let centerRepository;
  let organizationLearnerRepository;
  let sessionRepository;
  let userRepository;
  let normalizeStringFnc;
  let dependencies;
  const sessionId = 1;
  const userId = 2;
  const certificationCenterId = 3;
  let firstName, lastName, birthdate;

  beforeEach(function () {
    candidateRepository = {
      update: sinon.stub(),
      findBySessionId: sinon.stub(),
    };
    centerRepository = {
      getById: sinon.stub(),
    };
    organizationLearnerRepository = {
      isOrganizationLearnerIdLinkedToUserAndSCOOrganization: sinon.stub(),
    };
    sessionRepository = {
      get: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
    };
    normalizeStringFnc = (str) => str;
    dependencies = {
      sessionId,
      userId,
      candidateRepository,
      centerRepository,
      organizationLearnerRepository,
      sessionRepository,
      userRepository,
      normalizeStringFnc,
    };
    firstName = 'Charles';
    lastName = 'Neuf';
    birthdate = '2010-01-01';
  });

  context('when certification is V3 and user language is not available for certification', function () {
    beforeEach(function () {
      sessionRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.enrolment.buildSession({
          id: sessionId,
          version: CERTIFICATION_VERSIONS.V3,
          certificationCenterId,
        }),
      );
      userRepository.get.withArgs({ id: userId }).resolves(
        domainBuilder.certification.enrolment.buildUser({
          id: userId,
          lang: 'Le blop blop martien du sud',
        }),
      );
    });

    it('should throw a LanguageNotSupportedError', async function () {
      // when
      const error = await catchErr(linkUserToCandidate)({
        ...dependencies,
        firstName,
        lastName,
        birthdate,
      });

      // then
      expect(error).to.be.instanceof(LanguageNotSupportedError);
      expect(error.message).to.equal('Given language is not supported : "Le blop blop martien du sud"');
    });
  });

  context('when user language is available for certification', function () {
    beforeEach(function () {
      sessionRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.enrolment.buildSession({
          id: sessionId,
          version: CERTIFICATION_VERSIONS.V3,
          certificationCenterId,
        }),
      );
      userRepository.get.withArgs({ id: userId }).resolves(
        domainBuilder.certification.enrolment.buildUser({
          id: userId,
          lang: LANGUAGES_CODE.FRENCH,
        }),
      );
    });

    context('when there are no matching enrolled candidate in session with provided personal info', function () {
      beforeEach(function () {
        candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
          domainBuilder.certification.enrolment.buildCandidate({
            firstName: 'Louis',
            lastName: 'Seize',
            birthdate: '1990-05-06',
          }),
          domainBuilder.certification.enrolment.buildCandidate({
            firstName: 'Henri',
            lastName: 'Quatre',
            birthdate: '2005-05-01',
          }),
        ]);
      });

      it('should throw a CertificationCandidateByPersonalInfoNotFoundError', async function () {
        // when
        const error = await catchErr(linkUserToCandidate)({
          ...dependencies,
          firstName,
          lastName,
          birthdate,
        });

        // then
        expect(error).to.be.instanceof(CertificationCandidateByPersonalInfoNotFoundError);
        expect(error.message).to.equal('No certification candidate matches with the provided personal info');
      });
    });

    context('when there are one matching enrolled candidate in session with provided personal info', function () {
      let matchingCandidate;
      let anotherCandidate;

      beforeEach(function () {
        matchingCandidate = domainBuilder.certification.enrolment.buildCandidate({
          firstName,
          lastName,
          birthdate,
          userId: null,
          organizationLearnerId: null,
        });
        anotherCandidate = domainBuilder.certification.enrolment.buildCandidate({
          firstName: 'Louis',
          lastName: 'Seize',
          birthdate: '1990-05-06',
          userId: null,
          organizationLearnerId: null,
        });
        candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([anotherCandidate, matchingCandidate]);
      });
      context('when matching candidate is already linked to another user', function () {
        it('should throw a UnexpectedUserAccountError', async function () {
          // given
          matchingCandidate.userId = userId + 100;

          // when
          const error = await catchErr(linkUserToCandidate)({
            ...dependencies,
            firstName,
            lastName,
            birthdate,
          });

          // then
          expect(error).to.be.instanceof(UnexpectedUserAccountError);
        });
      });
      context('when matching candidate is already linked given user', function () {
        it('should return a succes indicating no linkage done', async function () {
          // given
          matchingCandidate.userId = userId;

          // when
          const res = await linkUserToCandidate({
            ...dependencies,
            firstName,
            lastName,
            birthdate,
          });

          // then
          expect(res).to.deep.equal({ linkDone: false });
        });
      });
      context('when user is already linked to another matching candidate within the same session', function () {
        it('should throw a UserAlreadyLinkedToCandidateInSessionError', async function () {
          // given
          anotherCandidate.userId = userId;

          // when
          const error = await catchErr(linkUserToCandidate)({
            ...dependencies,
            firstName,
            lastName,
            birthdate,
          });

          // then
          expect(error).to.be.instanceof(UserAlreadyLinkedToCandidateInSessionError);
          expect(error.message).to.equal(
            'The user is already linked to a candidate with different personal info in the given session',
          );
        });
      });
      context('when linkage is non-existent on all sides', function () {
        context('when it is a session sco / is managing students', function () {
          beforeEach(function () {
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
            matchingCandidate.organizationLearnerId = 789;
          });
          context('when matching candidate is not related to a reconcilied learner', function () {
            beforeEach(function () {
              organizationLearnerRepository.isOrganizationLearnerIdLinkedToUserAndSCOOrganization
                .withArgs({
                  userId,
                  organizationLearnerId: 789,
                })
                .resolves(false);
            });

            it('should throw a MatchingReconciledStudentNotFoundError', async function () {
              // when
              const error = await catchErr(linkUserToCandidate)({
                ...dependencies,
                firstName,
                lastName,
                birthdate,
              });

              // then
              expect(error).to.be.instanceof(MatchingReconciledStudentNotFoundError);
            });
          });
          context('when matching candidate is related to a reconcilied learner', function () {
            beforeEach(function () {
              organizationLearnerRepository.isOrganizationLearnerIdLinkedToUserAndSCOOrganization
                .withArgs({
                  userId,
                  organizationLearnerId: 789,
                })
                .resolves(true);
            });

            it('should link the candidate', async function () {
              // when
              const res = await linkUserToCandidate({
                ...dependencies,
                firstName,
                lastName,
                birthdate,
              });

              // then
              expect(res).to.deep.equal({ linkDone: true });
              expect(candidateRepository.update).to.have.been.calledWith(matchingCandidate);
            });
          });
        });
        context('when it is not a session sco / is managing students', function () {
          beforeEach(function () {
            centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(
              domainBuilder.certification.enrolment.buildCenter({
                id: certificationCenterId,
                matchingOrganization: null,
              }),
            );
          });
          it('should link the candidate', async function () {
            // when
            const res = await linkUserToCandidate({
              ...dependencies,
              firstName,
              lastName,
              birthdate,
            });

            // then
            expect(res).to.deep.equal({ linkDone: true });
            expect(candidateRepository.update).to.have.been.calledWith(matchingCandidate);
          });
        });
      });
    });
  });
});
