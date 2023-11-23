import { domainBuilder, expect, sinon, catchErr } from '../../../test-helper.js';
import { getNextChallengeForCertification } from '../../../../lib/domain/usecases/get-next-challenge-for-certification.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
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
      let answerRepository,
        flashAssessmentResultRepository,
        challengeRepository,
        certificationCourseRepository,
        certificationChallengeLiveAlertRepository,
        certificationChallengeRepository,
        algorithmDataFetcherService,
        pickChallengeService,
        flashAlgorithmService,
        flashAlgorithmConfigurationRepository;

      beforeEach(function () {
        flashAlgorithmConfigurationRepository = {
          get: sinon.stub(),
        };
        answerRepository = {
          findByAssessment: sinon.stub(),
        };
        flashAssessmentResultRepository = Symbol('flashAssessmentResultRepository');
        challengeRepository = {
          get: sinon.stub(),
        };
        certificationCourseRepository = {
          get: sinon.stub(),
        };
        certificationChallengeLiveAlertRepository = {
          getLiveAlertValidatedChallengeIdsByAssessmentId: sinon.stub(),
        };
        certificationChallengeRepository = {
          save: sinon.stub(),
          getNextChallengeByCourseIdForV3: sinon.stub(),
        };
        algorithmDataFetcherService = {
          fetchForFlashCampaigns: sinon.stub(),
        };
        pickChallengeService = {
          chooseNextChallenge: sinon.stub(),
        };
        flashAlgorithmService = {
          getPossibleNextChallenges: sinon.stub(),
          getEstimatedLevelAndErrorRate: sinon.stub(),
        };

        flashAlgorithmConfigurationRepository.get.resolves(domainBuilder.buildFlashAlgorithmConfiguration({}));
      });
      context('when there are challenges left to answer', function () {
        it('should save the returned next challenge', async function () {
          // given
          const nextChallengeToAnswer = domainBuilder.buildChallenge();
          const v3CertificationCourse = domainBuilder.buildCertificationCourse({
            version: CertificationVersion.V3,
          });
          const assessment = domainBuilder.buildAssessment();
          const locale = 'fr-FR';

          answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
          certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
            .withArgs(assessment.id)
            .resolves([]);

          certificationCourseRepository.get.withArgs(assessment.certificationCourseId).resolves(v3CertificationCourse);
          certificationChallengeRepository.getNextChallengeByCourseIdForV3
            .withArgs(assessment.certificationCourseId, [])
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
              variationPercent: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({ estimatedLevel: 0 });

          flashAlgorithmService.getPossibleNextChallenges
            .withArgs({
              availableChallenges: [nextChallengeToAnswer],
              estimatedLevel: 0,
              options: sinon.match.any,
            })
            .returns([nextChallengeToAnswer]);

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
            certificationChallengeLiveAlertRepository,
            locale,
            flashAlgorithmService,
            flashAlgorithmConfigurationRepository,
          });

          // then
          expect(challenge).to.equal(nextChallengeToAnswer);
        });

        context('when resuming the session', function () {
          it('should return the last seen challenge', async function () {
            // given
            const locale = 'fr-FR';

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

            answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
            certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
              .withArgs(assessment.id)
              .resolves([]);

            certificationCourseRepository.get
              .withArgs(assessment.certificationCourseId)
              .resolves(v3CertificationCourse);
            certificationChallengeRepository.getNextChallengeByCourseIdForV3
              .withArgs(assessment.certificationCourseId, [])
              .resolves(nonAnsweredCertificationChallenge);
            challengeRepository.get.withArgs(nonAnsweredCertificationChallenge.challengeId).resolves(lastSeenChallenge);

            // when
            const challenge = await getNextChallengeForCertification({
              algorithmDataFetcherService,
              assessment,
              answerRepository,
              challengeRepository,
              flashAssessmentResultRepository,
              certificationChallengeLiveAlertRepository,
              pickChallengeService,
              certificationCourseRepository,
              certificationChallengeRepository,
              locale,
              flashAlgorithmConfigurationRepository,
            });

            // then
            expect(challenge).to.equal(lastSeenChallenge);
            expect(certificationChallengeRepository.save).not.to.have.been.called;
          });
        });
      });

      context('when there are challenges with validated live alerts', function () {
        it('should save the returned next challenge', async function () {
          // given
          const locale = 'fr-FR';

          const v3CertificationCourse = domainBuilder.buildCertificationCourse({
            version: CertificationVersion.V3,
          });
          const assessment = domainBuilder.buildAssessment();

          const nonAnsweredCertificationChallenge = domainBuilder.buildCertificationChallenge({
            courseId: v3CertificationCourse.getId(),
          });

          const nextChallenge = domainBuilder.buildChallenge({
            id: 'NextChallenge',
          });

          const lastSeenChallenge = domainBuilder.buildChallenge({
            id: nonAnsweredCertificationChallenge.challengeId,
          });

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
              challenges: [nextChallenge, lastSeenChallenge],
              estimatedLevel: 0,
            });

          flashAlgorithmService.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [],
              challenges: [nextChallenge],
              estimatedLevel: config.v3Certification.defaultCandidateCapacity,
              variationPercent: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({ estimatedLevel: 0 });

          flashAlgorithmService.getPossibleNextChallenges
            .withArgs({
              availableChallenges: [nextChallenge],
              estimatedLevel: 0,
              options: sinon.match.any,
            })
            .returns([nextChallenge]);

          answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
          certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
            .withArgs(assessment.id)
            .resolves([nonAnsweredCertificationChallenge.challengeId]);

          certificationCourseRepository.get.withArgs(assessment.certificationCourseId).resolves(v3CertificationCourse);
          certificationChallengeRepository.getNextChallengeByCourseIdForV3
            .withArgs(assessment.certificationCourseId, [])
            .resolves(nonAnsweredCertificationChallenge);
          challengeRepository.get.withArgs(nonAnsweredCertificationChallenge.challengeId).resolves(lastSeenChallenge);

          const chooseNextChallengeImpl = sinon.stub();
          chooseNextChallengeImpl
            .withArgs({
              possibleChallenges: [nextChallenge],
            })
            .returns(nextChallenge);
          pickChallengeService.chooseNextChallenge.withArgs(assessment.id).returns(chooseNextChallengeImpl);

          // when
          const challenge = await getNextChallengeForCertification({
            algorithmDataFetcherService,
            assessment,
            answerRepository,
            challengeRepository,
            flashAssessmentResultRepository,
            flashAlgorithmService,
            certificationChallengeLiveAlertRepository,
            pickChallengeService,
            certificationCourseRepository,
            certificationChallengeRepository,
            flashAlgorithmConfigurationRepository,
            locale,
          });

          // then
          expect(challenge).to.equal(nextChallenge);
          expect(certificationChallengeRepository.save).to.have.been.called;
        });
      });

      context('when there are no challenges left', function () {
        it('should return the AssessmentEndedError', async function () {
          // given
          const answeredChallenge = domainBuilder.buildChallenge();
          const answer = domainBuilder.buildAnswer({ challengeId: answeredChallenge.id });
          const v3CertificationCourse = domainBuilder.buildCertificationCourse({
            version: CertificationVersion.V3,
          });
          const assessment = domainBuilder.buildAssessment();
          const locale = 'fr-FR';

          const flashAlgorithmService = {
            getPossibleNextChallenges: sinon.stub(),
            getEstimatedLevelAndErrorRate: sinon.stub(),
          };

          answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
          certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
            .withArgs(assessment.id)
            .resolves([]);

          certificationCourseRepository.get.withArgs(assessment.certificationCourseId).resolves(v3CertificationCourse);
          certificationChallengeRepository.getNextChallengeByCourseIdForV3
            .withArgs(assessment.certificationCourseId, [answeredChallenge.id])
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
              variationPercent: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({
              estimatedLevel: 2,
            });

          flashAlgorithmService.getPossibleNextChallenges
            .withArgs({
              availableChallenges: [],
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
            certificationChallengeLiveAlertRepository,
            certificationChallengeRepository,
            locale,
            flashAlgorithmService,
            flashAlgorithmConfigurationRepository,
          });

          // then
          expect(error).to.be.instanceOf(AssessmentEndedError);
        });
      });

      context('when loading a configuration', function () {
        const competenceId = 'cmp1';
        // eslint-disable-next-line mocha/no-setup-in-describe
        Object.entries({
          forcedCompetences: [competenceId],
          challengesBetweenSameCompetence: 2,
          minimumEstimatedSuccessRateRanges: [
            {
              type: 'fixed',
              startingChallengeIndex: 0,
              endingChallengeIndex: 10,
              value: 0.1,
            },
          ],
          limitToOneQuestionPerTube: true,
          enablePassageByAllCompetences: true,
          variationPercent: 20,
        })
          .map(([key, value]) => ({
            [key]: value,
          }))
          .forEach((flashConfiguration) => {
            it('should use the configuration', async function () {
              //given
              const nextChallengeToAnswer = domainBuilder.buildChallenge({
                competenceId,
              });
              flashAlgorithmConfigurationRepository.get.reset();
              const configuration = domainBuilder.buildFlashAlgorithmConfiguration(flashConfiguration);
              flashAlgorithmConfigurationRepository.get.resolves(configuration);

              const v3CertificationCourse = domainBuilder.buildCertificationCourse({
                version: CertificationVersion.V3,
              });
              const assessment = domainBuilder.buildAssessment();
              const locale = 'fr-FR';

              answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
              certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
                .withArgs(assessment.id)
                .resolves([]);

              certificationCourseRepository.get
                .withArgs(assessment.certificationCourseId)
                .resolves(v3CertificationCourse);
              certificationChallengeRepository.getNextChallengeByCourseIdForV3
                .withArgs(assessment.certificationCourseId, [])
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
                  variationPercent: configuration.variationPercent,
                  doubleMeasuresUntil: undefined,
                })
                .returns({ estimatedLevel: 0 });

              flashAlgorithmService.getPossibleNextChallenges
                .withArgs({
                  availableChallenges: [nextChallengeToAnswer],
                  estimatedLevel: 0,
                  options: sinon.match.any,
                })
                .returns([nextChallengeToAnswer]);

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
                certificationChallengeLiveAlertRepository,
                locale,
                flashAlgorithmService,
                flashAlgorithmConfigurationRepository,
              });

              // then
              expect(challenge).to.equal(nextChallengeToAnswer);
            });
          });
      });
    });
  });
});
