import { domainBuilder, expect, sinon, catchErr } from '../../../test-helper.js';
import { getNextChallengeForCertification } from '../../../../lib/domain/usecases/get-next-challenge-for-certification.js';
import { Assessment } from '../../../../lib/domain/models/Assessment.js';
import { CertificationVersion } from '../../../../src/shared/domain/models/CertificationVersion.js';
import { AssessmentEndedError } from '../../../../lib/domain/errors.js';
import { config } from '../../../../src/shared/config.js';

describe('Unit | Domain | Use Cases | get-next-challenge-for-certification', function () {
  describe('#getNextChallengeForCertification', function () {
    context('for a v2 certification', function () {
      let certificationChallengeRepository;
      let challengeRepository;
      let certificationCourseRepository;

      beforeEach(function () {
        certificationCourseRepository = { get: sinon.stub() };
        certificationChallengeRepository = { getNextNonAnsweredChallengeByCourseId: sinon.stub().resolves() };
        challengeRepository = { get: sinon.stub().resolves() };
      });

      it('should use the assessmentService to select the next CertificationChallenge', async function () {
        // given
        const nextChallenge = Symbol('nextChallenge');
        const assessment = new Assessment({ id: 156, certificationCourseId: 54516 });
        const certificationCourse = domainBuilder.buildCertificationCourse();

        certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId.resolves(nextChallenge);
        certificationCourseRepository.get.withArgs(assessment.certificationCourseId).resolves(certificationCourse);

        // when
        await getNextChallengeForCertification({
          assessment,
          certificationChallengeRepository,
          certificationCourseRepository,
          challengeRepository,
        });

        // then
        expect(certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId).to.have.been.calledWithExactly(
          156,
          54516,
        );
      });

      it('should return the next Challenge', async function () {
        // given
        const challengeId = 15167432;
        const nextChallengeToAnswer = Symbol('nextChallengeToAnswer');
        const nextCertificationChallenge = { challengeId };
        const assessment = new Assessment({ id: 156, courseId: 54516 });
        const certificationCourse = domainBuilder.buildCertificationCourse();

        certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId.resolves(nextCertificationChallenge);
        challengeRepository.get.resolves(nextChallengeToAnswer);
        certificationCourseRepository.get.withArgs(assessment.certificationCourseId).resolves(certificationCourse);

        // when
        const challenge = await getNextChallengeForCertification({
          assessment,
          certificationChallengeRepository,
          certificationCourseRepository,
          challengeRepository,
        });

        // then
        expect(challenge).to.equal(nextChallengeToAnswer);
        expect(challengeRepository.get).to.have.been.calledWithExactly(challengeId);
      });
    });

    context('for a v3 certification', function () {
      context('when there are challenges left to answer', function () {
        it('should save the returned next challenge', async function () {
          // given
          const answerRepository = Symbol('AnswerRepository');
          const flashAssessmentResultRepository = Symbol('flashAssessmentResultRepository');
          const nextChallengeToAnswer = domainBuilder.buildChallenge();
          const v3CertificationCourse = domainBuilder.buildCertificationCourse({
            version: CertificationVersion.V3,
          });
          const assessment = domainBuilder.buildAssessment();
          const challengeRepository = {
            get: sinon.stub(),
          };
          const certificationCourseRepository = {
            get: sinon.stub(),
          };
          const certificationChallengeRepository = {
            save: sinon.stub(),
            getNextNonAnsweredChallengeByCourseIdForV3: sinon.stub(),
          };
          const algorithmDataFetcherService = {
            fetchForFlashCampaigns: sinon.stub(),
          };
          const pickChallengeService = {
            chooseNextChallenge: sinon.stub(),
          };
          const flashAlgorithmService = {
            getPossibleNextChallenges: sinon.stub(),
            getEstimatedLevelAndErrorRate: sinon.stub(),
          };
          const locale = 'fr-FR';

          certificationCourseRepository.get.withArgs(assessment.certificationCourseId).resolves(v3CertificationCourse);
          certificationChallengeRepository.getNextNonAnsweredChallengeByCourseIdForV3
            .withArgs(assessment.id, assessment.certificationCourseId)
            .resolves(null);
          challengeRepository.get.resolves();
          algorithmDataFetcherService.fetchForFlashCampaigns
            .withArgs({
              answerRepository,
              challengeRepository,
              flashAssessmentResultRepository,
              assessmentId: assessment.id,
              locale,
            })
            .resolves({
              allAnswers: [],
              challenges: [nextChallengeToAnswer],
              estimatedLevel: 0,
            });

          flashAlgorithmService.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [],
              challenges: [nextChallengeToAnswer],
              estimatedLevel: config.v3Certification.defaultCandidateCapacity,
            })
            .returns({ estimatedLevel: 0 });

          flashAlgorithmService.getPossibleNextChallenges
            .withArgs({
              allAnswers: [],
              challenges: [nextChallengeToAnswer],
              estimatedLevel: 0,
              options: sinon.match.any,
            })
            .returns({
              hasAssessmentEnded: false,
              possibleChallenges: [nextChallengeToAnswer],
            });

          const chooseNextChallengeImpl = sinon.stub();
          chooseNextChallengeImpl
            .withArgs({
              possibleChallenges: [nextChallengeToAnswer],
            })
            .returns(nextChallengeToAnswer);
          pickChallengeService.chooseNextChallenge.withArgs(assessment.id).returns(chooseNextChallengeImpl);

          // when
          const challenge = await getNextChallengeForCertification({
            algorithmDataFetcherService,
            assessment,
            answerRepository,
            challengeRepository,
            flashAssessmentResultRepository,
            pickChallengeService,
            certificationCourseRepository,
            certificationChallengeRepository,
            locale,
            flashAlgorithmService,
          });

          // then
          expect(challenge).to.equal(nextChallengeToAnswer);
        });

        context('when resuming the session', function () {
          it('should return the last seen challenge', async function () {
            // given
            const answerRepository = Symbol('AnswerRepository');
            const flashAssessmentResultRepository = Symbol('flashAssessmentResultRepository');
            const algorithmDataFetcherService = Symbol('algorithmDataFetcherService');
            const pickChallengeService = Symbol('pickChallengeService');
            const locale = 'fr-FR';

            const certificationCourseRepository = {
              get: sinon.stub(),
            };
            const certificationChallengeRepository = {
              save: sinon.stub(),
              getNextNonAnsweredChallengeByCourseIdForV3: sinon.stub(),
            };
            const challengeRepository = {
              get: sinon.stub(),
            };

            const v3CertificationCourse = domainBuilder.buildCertificationCourse({
              version: CertificationVersion.V3,
            });
            const assessment = domainBuilder.buildAssessment();

            const nonAnsweredCertificationChallenge = domainBuilder.buildCertificationChallenge({
              courseId: v3CertificationCourse.getId(),
            });

            const lastSeenChallenge = domainBuilder.buildChallenge({
              id: nonAnsweredCertificationChallenge.challengeId,
            });

            certificationCourseRepository.get
              .withArgs(assessment.certificationCourseId)
              .resolves(v3CertificationCourse);
            certificationChallengeRepository.getNextNonAnsweredChallengeByCourseIdForV3
              .withArgs(assessment.id, assessment.certificationCourseId)
              .resolves(nonAnsweredCertificationChallenge);
            challengeRepository.get.withArgs(nonAnsweredCertificationChallenge.challengeId).resolves(lastSeenChallenge);

            // when
            const challenge = await getNextChallengeForCertification({
              algorithmDataFetcherService,
              assessment,
              answerRepository,
              challengeRepository,
              flashAssessmentResultRepository,
              pickChallengeService,
              certificationCourseRepository,
              certificationChallengeRepository,
              locale,
            });

            // then
            expect(challenge).to.equal(lastSeenChallenge);
            expect(certificationChallengeRepository.save).not.to.have.been.called;
          });
        });
      });

      context('when there are no challenges left', function () {
        it('should return the AssessmentEndedError', async function () {
          // given
          const answerRepository = Symbol('AnswerRepository');
          const flashAssessmentResultRepository = Symbol('flashAssessmentResultRepository');
          const answeredChallenge = domainBuilder.buildChallenge();
          const answer = domainBuilder.buildAnswer({ challengeId: answeredChallenge.id });
          const v3CertificationCourse = domainBuilder.buildCertificationCourse({
            version: CertificationVersion.V3,
          });
          const assessment = domainBuilder.buildAssessment();
          const certificationCourseRepository = {
            get: sinon.stub(),
          };
          const challengeRepository = {
            get: sinon.stub(),
          };
          const certificationChallengeRepository = {
            save: sinon.stub(),
            getNextNonAnsweredChallengeByCourseIdForV3: sinon.stub(),
          };
          const algorithmDataFetcherService = {
            fetchForFlashCampaigns: sinon.stub(),
          };
          const locale = 'fr-FR';

          const flashAlgorithmService = {
            getPossibleNextChallenges: sinon.stub(),
            getEstimatedLevelAndErrorRate: sinon.stub(),
          };

          certificationCourseRepository.get.withArgs(assessment.certificationCourseId).resolves(v3CertificationCourse);
          certificationChallengeRepository.getNextNonAnsweredChallengeByCourseIdForV3
            .withArgs(assessment.id, assessment.certificationCourseId)
            .resolves(null);
          challengeRepository.get.resolves();
          algorithmDataFetcherService.fetchForFlashCampaigns
            .withArgs({
              answerRepository,
              challengeRepository,
              flashAssessmentResultRepository,
              assessmentId: assessment.id,
              locale,
            })
            .resolves({
              allAnswers: [answer],
              challenges: [answeredChallenge],
              estimatedLevel: 0,
            });

          flashAlgorithmService.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [answer],
              challenges: [answeredChallenge],
              estimatedLevel: config.v3Certification.defaultCandidateCapacity,
            })
            .returns({
              estimatedLevel: 2,
            });

          flashAlgorithmService.getPossibleNextChallenges
            .withArgs({
              allAnswers: [answer],
              challenges: [answeredChallenge],
              estimatedLevel: 2,
              options: sinon.match.any,
            })
            .returns({
              hasAssessmentEnded: true,
              possibleChallenges: [],
            });

          // when
          const error = await catchErr(getNextChallengeForCertification)({
            algorithmDataFetcherService,
            assessment,
            answerRepository,
            challengeRepository,
            flashAssessmentResultRepository,
            certificationCourseRepository,
            certificationChallengeRepository,
            locale,
            flashAlgorithmService,
          });

          // then
          expect(error).to.be.instanceOf(AssessmentEndedError);
        });
      });
    });
  });
});
