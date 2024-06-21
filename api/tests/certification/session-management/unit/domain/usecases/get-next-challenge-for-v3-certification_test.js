import { AssessmentEndedError } from '../../../../../../lib/domain/errors.js';
import { getNextChallengeForV3Certification } from '../../../../../../src/certification/session-management/domain/usecases/get-next-challenge-for-v3-certification.js';
import { CERTIFICATION_VERSIONS } from '../../../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { config } from '../../../../../../src/shared/config.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Use Cases | get-next-challenge-for-v3-certification', function () {
  describe('#getNextChallengeForV3Certification', function () {
    let answerRepository,
      challengeRepository,
      certificationCourseRepository,
      certificationChallengeLiveAlertRepository,
      certificationChallengeRepository,
      pickChallengeService,
      flashAlgorithmService,
      flashAlgorithmConfigurationRepository;

    let flashAlgorithmConfiguration;

    beforeEach(function () {
      flashAlgorithmConfigurationRepository = {
        getMostRecentBeforeDate: sinon.stub(),
      };
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      challengeRepository = {
        get: sinon.stub(),
        findActiveFlashCompatible: sinon.stub(),
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
      pickChallengeService = {
        chooseNextChallenge: sinon.stub(),
      };
      flashAlgorithmService = {
        getPossibleNextChallenges: sinon.stub(),
        getCapacityAndErrorRate: sinon.stub(),
      };

      flashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration();
    });

    context('when there are challenges left to answer', function () {
      it('should save the returned next challenge', async function () {
        // given
        const nextChallengeToAnswer = domainBuilder.buildChallenge();
        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: CERTIFICATION_VERSIONS.V3,
        });
        const assessment = domainBuilder.buildAssessment();
        const locale = 'fr-FR';

        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(v3CertificationCourse.getStartDate())
          .resolves(flashAlgorithmConfiguration);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        certificationCourseRepository.get
          .withArgs({ id: assessment.certificationCourseId })
          .resolves(v3CertificationCourse);
        certificationChallengeRepository.getNextChallengeByCourseIdForV3
          .withArgs(assessment.certificationCourseId, [])
          .resolves(null);
        challengeRepository.get.resolves();

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        challengeRepository.findActiveFlashCompatible.withArgs({ locale }).resolves([nextChallengeToAnswer]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: [nextChallengeToAnswer],
            capacity: config.v3Certification.defaultCandidateCapacity,
            variationPercent: undefined,
            variationPercentUntil: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [nextChallengeToAnswer],
            capacity: 0,
            options: sinon.match.any,
          })
          .returns([nextChallengeToAnswer]);

        const chooseNextChallengeImpl = sinon.stub();
        chooseNextChallengeImpl
          .withArgs({
            possibleChallenges: [nextChallengeToAnswer],
          })
          .returns(nextChallengeToAnswer);
        pickChallengeService.chooseNextChallenge.withArgs().returns(chooseNextChallengeImpl);

        // when
        const challenge = await getNextChallengeForV3Certification({
          answerRepository,
          assessment,
          certificationChallengeRepository,
          certificationChallengeLiveAlertRepository,
          certificationCourseRepository,
          challengeRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          locale,
          pickChallengeService,
        });

        // then
        expect(challenge).to.equal(nextChallengeToAnswer);
      });

      context('when resuming the session', function () {
        it('should return the last seen challenge', async function () {
          // given
          const locale = 'fr-FR';

          const v3CertificationCourse = domainBuilder.buildCertificationCourse({
            version: CERTIFICATION_VERSIONS.V3,
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
            .withArgs({ assessmentId: assessment.id })
            .resolves([]);

          certificationCourseRepository.get
            .withArgs({ id: assessment.certificationCourseId })
            .resolves(v3CertificationCourse);
          certificationChallengeRepository.getNextChallengeByCourseIdForV3
            .withArgs(assessment.certificationCourseId, [])
            .resolves(nonAnsweredCertificationChallenge);
          challengeRepository.get.withArgs(nonAnsweredCertificationChallenge.challengeId).resolves(lastSeenChallenge);

          // when
          const challenge = await getNextChallengeForV3Certification({
            answerRepository,
            assessment,
            certificationChallengeRepository,
            certificationChallengeLiveAlertRepository,
            certificationCourseRepository,
            challengeRepository,
            flashAlgorithmConfigurationRepository,
            flashAlgorithmService,
            locale,
            pickChallengeService,
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
        const skill = domainBuilder.buildSkill({ id: 'skill1' });

        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: CERTIFICATION_VERSIONS.V3,
        });
        const assessment = domainBuilder.buildAssessment();

        const nonAnsweredCertificationChallenge = domainBuilder.buildCertificationChallenge({
          courseId: v3CertificationCourse.getId(),
        });

        const nextChallenge = domainBuilder.buildChallenge({
          id: 'NextChallenge',
          skill,
        });

        const lastSeenChallenge = domainBuilder.buildChallenge({
          id: nonAnsweredCertificationChallenge.challengeId,
        });

        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(v3CertificationCourse.getStartDate())
          .resolves(flashAlgorithmConfiguration);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        challengeRepository.findActiveFlashCompatible.withArgs({ locale }).resolves([nextChallenge, lastSeenChallenge]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: [nextChallenge],
            capacity: config.v3Certification.defaultCandidateCapacity,
            variationPercent: undefined,
            variationPercentUntil: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [nextChallenge],
            capacity: 0,
            options: sinon.match.any,
          })
          .returns([nextChallenge]);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([nonAnsweredCertificationChallenge.challengeId]);

        certificationCourseRepository.get
          .withArgs({ id: assessment.certificationCourseId })
          .resolves(v3CertificationCourse);
        certificationChallengeRepository.getNextChallengeByCourseIdForV3
          .withArgs(assessment.certificationCourseId, [])
          .resolves(nonAnsweredCertificationChallenge);

        const chooseNextChallengeImpl = sinon.stub();
        chooseNextChallengeImpl
          .withArgs({
            possibleChallenges: [nextChallenge],
          })
          .returns(nextChallenge);
        pickChallengeService.chooseNextChallenge.withArgs().returns(chooseNextChallengeImpl);

        // when
        const challenge = await getNextChallengeForV3Certification({
          answerRepository,
          assessment,
          certificationChallengeRepository,
          certificationChallengeLiveAlertRepository,
          certificationCourseRepository,
          challengeRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          locale,
          pickChallengeService,
        });

        // then
        expect(challenge).to.equal(nextChallenge);
        expect(certificationChallengeRepository.save).to.have.been.called;
      });

      it('should not return a challenge with the same skill', async function () {
        // given
        const locale = 'fr-FR';
        const firstSkill = domainBuilder.buildSkill({ id: 'skill1' });
        const secondSkill = domainBuilder.buildSkill({ id: 'skill2' });

        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: CERTIFICATION_VERSIONS.V3,
        });
        const assessment = domainBuilder.buildAssessment();

        const nonAnsweredCertificationChallenge = domainBuilder.buildCertificationChallenge({
          courseId: v3CertificationCourse.getId(),
        });

        const challengeWithLiveAlertedSkill = domainBuilder.buildChallenge({
          id: 'NextChallenge',
          skill: firstSkill,
        });

        const challengeWithOtherSkill = domainBuilder.buildChallenge({
          id: 'NextChallenge',
          skill: secondSkill,
        });

        const challengeWithLiveAlert = domainBuilder.buildChallenge({
          id: nonAnsweredCertificationChallenge.challengeId,
          skill: firstSkill,
        });

        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(v3CertificationCourse.getStartDate())
          .resolves(flashAlgorithmConfiguration);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        challengeRepository.findActiveFlashCompatible
          .withArgs()
          .resolves([challengeWithLiveAlert, challengeWithOtherSkill, challengeWithLiveAlertedSkill]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: [challengeWithOtherSkill],
            capacity: config.v3Certification.defaultCandidateCapacity,
            variationPercent: undefined,
            variationPercentUntil: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [challengeWithOtherSkill],
            capacity: 0,
            options: sinon.match.any,
          })
          .returns([challengeWithOtherSkill]);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([nonAnsweredCertificationChallenge.challengeId]);

        certificationCourseRepository.get
          .withArgs({ id: assessment.certificationCourseId })
          .resolves(v3CertificationCourse);
        certificationChallengeRepository.getNextChallengeByCourseIdForV3
          .withArgs(assessment.certificationCourseId, [])
          .resolves(nonAnsweredCertificationChallenge);

        const chooseNextChallengeImpl = sinon.stub();
        chooseNextChallengeImpl
          .withArgs({
            possibleChallenges: [challengeWithOtherSkill],
          })
          .returns(challengeWithOtherSkill);
        pickChallengeService.chooseNextChallenge.withArgs().returns(chooseNextChallengeImpl);

        // when
        const challenge = await getNextChallengeForV3Certification({
          answerRepository,
          assessment,
          certificationChallengeRepository,
          certificationChallengeLiveAlertRepository,
          certificationCourseRepository,
          challengeRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          locale,
          pickChallengeService,
        });

        // then
        expect(challenge).to.equal(challengeWithOtherSkill);
        expect(certificationChallengeRepository.save).to.have.been.called;
      });
    });

    context('when there are no challenges left', function () {
      it('should return the AssessmentEndedError', async function () {
        // given
        const answeredChallenge = domainBuilder.buildChallenge();
        const answer = domainBuilder.buildAnswer({ challengeId: answeredChallenge.id });
        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: CERTIFICATION_VERSIONS.V3,
        });
        const assessment = domainBuilder.buildAssessment();
        const locale = 'fr-FR';

        const flashAlgorithmService = {
          getPossibleNextChallenges: sinon.stub(),
          getCapacityAndErrorRate: sinon.stub(),
        };

        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(v3CertificationCourse.getStartDate())
          .resolves(flashAlgorithmConfiguration);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        certificationCourseRepository.get
          .withArgs({ id: assessment.certificationCourseId })
          .resolves(v3CertificationCourse);
        certificationChallengeRepository.getNextChallengeByCourseIdForV3
          .withArgs(assessment.certificationCourseId, [answeredChallenge.id])
          .resolves(null);
        challengeRepository.get.resolves();

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
        challengeRepository.findActiveFlashCompatible.withArgs({ locale }).resolves([answeredChallenge]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [answer],
            challenges: [answeredChallenge],
            capacity: config.v3Certification.defaultCandidateCapacity,
            variationPercent: undefined,
            variationPercentUntil: undefined,
            doubleMeasuresUntil: undefined,
          })
          .returns({
            capacity: 2,
          });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [],
            capacity: 2,
            options: sinon.match.any,
          })
          .returns({
            hasAssessmentEnded: true,
            possibleChallenges: [],
          });

        // when
        const error = await catchErr(getNextChallengeForV3Certification)({
          answerRepository,
          assessment,
          certificationChallengeRepository,
          certificationChallengeLiveAlertRepository,
          certificationCourseRepository,
          challengeRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          locale,
          pickChallengeService,
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

            const v3CertificationCourse = domainBuilder.buildCertificationCourse({
              version: CERTIFICATION_VERSIONS.V3,
            });

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate.reset();
            const configuration = domainBuilder.buildFlashAlgorithmConfiguration(flashConfiguration);
            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(v3CertificationCourse.getStartDate())
              .resolves(configuration);

            const assessment = domainBuilder.buildAssessment();
            const locale = 'fr-FR';

            answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
            certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
              .withArgs({ assessmentId: assessment.id })
              .resolves([]);

            certificationCourseRepository.get
              .withArgs({ id: assessment.certificationCourseId })
              .resolves(v3CertificationCourse);
            certificationChallengeRepository.getNextChallengeByCourseIdForV3
              .withArgs(assessment.certificationCourseId, [])
              .resolves(null);
            challengeRepository.get.resolves();

            answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
            challengeRepository.findActiveFlashCompatible.withArgs({ locale }).resolves([nextChallengeToAnswer]);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                allAnswers: [],
                challenges: [nextChallengeToAnswer],
                capacity: config.v3Certification.defaultCandidateCapacity,
                variationPercent: configuration.variationPercent,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({ capacity: 0 });

            flashAlgorithmService.getPossibleNextChallenges
              .withArgs({
                availableChallenges: [nextChallengeToAnswer],
                capacity: 0,
                options: sinon.match.any,
              })
              .returns([nextChallengeToAnswer]);

            const chooseNextChallengeImpl = sinon.stub();
            chooseNextChallengeImpl
              .withArgs({
                possibleChallenges: [nextChallengeToAnswer],
              })
              .returns(nextChallengeToAnswer);
            pickChallengeService.chooseNextChallenge.withArgs().returns(chooseNextChallengeImpl);

            // when
            const challenge = await getNextChallengeForV3Certification({
              answerRepository,
              assessment,
              certificationChallengeRepository,
              certificationChallengeLiveAlertRepository,
              certificationCourseRepository,
              challengeRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              locale,
              pickChallengeService,
            });

            // then
            expect(challenge).to.equal(nextChallengeToAnswer);
          });
        });
    });
  });
});
