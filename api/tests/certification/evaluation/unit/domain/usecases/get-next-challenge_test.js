import { getNextChallenge } from '../../../../../../src/certification/evaluation/domain/usecases/get-next-challenge.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { config } from '../../../../../../src/shared/config.js';
import { AssessmentEndedError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Use Cases | get-next-challenge', function () {
  describe('#getNextChallenge', function () {
    let answerRepository,
      sharedChallengeRepository,
      certificationCourseRepository,
      certificationChallengeLiveAlertRepository,
      sessionManagementCertificationChallengeRepository,
      pickChallengeService,
      flashAlgorithmService,
      flashAlgorithmConfigurationRepository,
      certificationCandidateRepository,
      complementaryCertificationScoringCriteriaRepository;

    let flashAlgorithmConfiguration;
    let certificationCandidateId;
    let assessment;

    beforeEach(function () {
      flashAlgorithmConfigurationRepository = {
        getMostRecentBeforeDate: sinon.stub(),
      };
      answerRepository = {
        findByAssessmentExcludingChallengeIds: sinon.stub(),
      };
      sharedChallengeRepository = {
        get: sinon.stub(),
        getMany: sinon.stub(),
        findActiveFlashCompatible: sinon.stub(),
      };
      certificationCourseRepository = {
        get: sinon.stub(),
      };
      complementaryCertificationScoringCriteriaRepository = {
        findByCertificationCourseId: sinon.stub().resolves([]),
      };
      certificationChallengeLiveAlertRepository = {
        getLiveAlertValidatedChallengeIdsByAssessmentId: sinon.stub(),
      };
      sessionManagementCertificationChallengeRepository = {
        save: sinon.stub(),
        getNextChallengeByCourseId: sinon.stub(),
      };
      pickChallengeService = {
        getChallengePicker: sinon.stub(),
      };
      flashAlgorithmService = {
        getPossibleNextChallenges: sinon.stub(),
        getCapacityAndErrorRate: sinon.stub(),
      };
      certificationCandidateRepository = {
        findByAssessmentId: sinon.stub(),
      };
      assessment = domainBuilder.buildAssessment();
      const candidate = domainBuilder.buildCertificationCandidateForSupervising({
        accessibilityAdjustmentNeeded: false,
      });
      certificationCandidateId = candidate.id;

      certificationCandidateRepository.findByAssessmentId.withArgs({ assessmentId: assessment.id }).resolves(candidate);

      flashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration();
    });

    context('when there are challenges left to answer', function () {
      it('should save the returned next challenge', async function () {
        // given
        const nextChallengeToAnswer = domainBuilder.buildChallenge({
          blindnessCompatibility: 'KO',
        });
        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
        });
        const locale = 'fr-FR';

        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(v3CertificationCourse.getStartDate())
          .resolves(flashAlgorithmConfiguration);

        answerRepository.findByAssessmentExcludingChallengeIds
          .withArgs({ assessmentId: assessment.id, excludedChallengeIds: [] })
          .resolves([]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        certificationCourseRepository.get
          .withArgs({ id: assessment.certificationCourseId })
          .resolves(v3CertificationCourse);
        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(null);
        sharedChallengeRepository.get.resolves();

        const candidate = domainBuilder.buildCertificationCandidateForSupervising();
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        const complementaryCertificationScoringCriteria =
          domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
            complementaryCertificationBadgeKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
            hasComplementaryReferential: true,
          });
        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({ certificationCourseId: v3CertificationCourse.getId() })
          .resolves([complementaryCertificationScoringCriteria]);

        sharedChallengeRepository.findActiveFlashCompatible
          .withArgs({
            locale,
            date: candidate.reconciledAt,
            complementaryCertificationKey: complementaryCertificationScoringCriteria.complementaryCertificationBadgeKey,
            hasComplementaryReferential: complementaryCertificationScoringCriteria.hasComplementaryReferential,
          })
          .resolves([nextChallengeToAnswer]);
        sharedChallengeRepository.getMany.withArgs([]).resolves([]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: [nextChallengeToAnswer],
            capacity: config.v3Certification.defaultCandidateCapacity,
            variationPercent: undefined,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [nextChallengeToAnswer],
            capacity: 0,
          })
          .returns([nextChallengeToAnswer]);

        const getChallengePickerImpl = sinon.stub();
        getChallengePickerImpl
          .withArgs({
            possibleChallenges: [nextChallengeToAnswer],
          })
          .returns(nextChallengeToAnswer);
        pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

        // when
        const challenge = await getNextChallenge({
          answerRepository,
          assessment,
          sessionManagementCertificationChallengeRepository,
          certificationChallengeLiveAlertRepository,
          certificationCourseRepository,
          sharedChallengeRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          locale,
          pickChallengeService,
          certificationCandidateRepository,
          complementaryCertificationScoringCriteriaRepository,
        });

        // then
        expect(challenge).to.equal(nextChallengeToAnswer);
      });

      context('when candidate needs accessibility adjustment', function () {
        it('should only pick among challenges with no accessibilities issues', async function () {
          // given
          const nextChallengeToAnswer = domainBuilder.buildChallenge({
            blindnessCompatibility: 'RAS',
            colorBlindnessCompatibility: 'OK',
          });
          const accessibleChallenge = domainBuilder.buildChallenge({
            blindnessCompatibility: 'OK',
            colorBlindnessCompatibility: 'RAS',
          });
          const allChallenges = [
            nextChallengeToAnswer,
            accessibleChallenge,
            domainBuilder.buildChallenge({
              blindnessCompatibility: 'autre chose',
              colorBlindnessCompatibility: 'OK',
            }),
          ];
          const v3CertificationCourse = domainBuilder.buildCertificationCourse({
            version: AlgorithmEngineVersion.V3,
          });
          const assessment = domainBuilder.buildAssessment();
          const locale = 'fr-FR';

          flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
            .withArgs(v3CertificationCourse.getStartDate())
            .resolves(flashAlgorithmConfiguration);

          answerRepository.findByAssessmentExcludingChallengeIds
            .withArgs({ assessmentId: assessment.id, excludedChallengeIds: [] })
            .resolves([]);
          certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
            .withArgs({ assessmentId: assessment.id })
            .resolves([]);

          certificationCourseRepository.get
            .withArgs({ id: assessment.certificationCourseId })
            .resolves(v3CertificationCourse);
          sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
            .withArgs(assessment.certificationCourseId, [])
            .resolves(null);

          const candidateNeedingAccessibilityAdjustment = domainBuilder.buildCertificationCandidateForSupervising({
            id: 'candidateNeedingAccessibilityAdjustmentId',
            accessibilityAdjustmentNeeded: true,
          });
          certificationCandidateRepository.findByAssessmentId
            .withArgs({ assessmentId: assessment.id })
            .resolves(candidateNeedingAccessibilityAdjustment);

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({ certificationCourseId: v3CertificationCourse.id })
            .resolves([]);

          sharedChallengeRepository.findActiveFlashCompatible
            .withArgs({
              locale,
              date: candidateNeedingAccessibilityAdjustment.reconciledAt,
              complementaryCertificationKey: undefined,
              hasComplementaryReferential: undefined,
            })
            .resolves(allChallenges);

          sharedChallengeRepository.getMany.withArgs([]).resolves([]);

          flashAlgorithmService.getCapacityAndErrorRate
            .withArgs({
              allAnswers: [],
              challenges: [nextChallengeToAnswer, accessibleChallenge],
              capacity: config.v3Certification.defaultCandidateCapacity,
              variationPercent: undefined,
            })
            .returns({ capacity: 0 });

          flashAlgorithmService.getPossibleNextChallenges
            .withArgs({
              availableChallenges: [nextChallengeToAnswer, accessibleChallenge],
              capacity: 0,
            })
            .returns([nextChallengeToAnswer]);

          const getChallengePickerImpl = sinon.stub();
          getChallengePickerImpl
            .withArgs({
              possibleChallenges: [nextChallengeToAnswer],
            })
            .returns(nextChallengeToAnswer);
          pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

          // when
          const challenge = await getNextChallenge({
            answerRepository,
            assessment,
            sessionManagementCertificationChallengeRepository,
            certificationChallengeLiveAlertRepository,
            certificationCourseRepository,
            sharedChallengeRepository,
            flashAlgorithmConfigurationRepository,
            flashAlgorithmService,
            locale,
            pickChallengeService,
            certificationCandidateRepository,
            complementaryCertificationScoringCriteriaRepository,
          });

          // then
          expect(challenge).to.equal(nextChallengeToAnswer);
        });
      });

      context('when resuming the session', function () {
        it('should return the last seen challenge', async function () {
          // given
          const locale = 'fr-FR';

          const v3CertificationCourse = domainBuilder.buildCertificationCourse({
            version: AlgorithmEngineVersion.V3,
          });
          const assessment = domainBuilder.buildAssessment();

          const nonAnsweredCertificationChallenge = domainBuilder.buildCertificationChallenge({
            courseId: v3CertificationCourse.getId(),
          });

          const lastSeenChallenge = domainBuilder.buildChallenge({
            id: nonAnsweredCertificationChallenge.challengeId,
          });

          answerRepository.findByAssessmentExcludingChallengeIds
            .withArgs({ assessmentId: assessment.id, excludedChallengeIds: [] })
            .resolves([]);
          certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
            .withArgs({ assessmentId: assessment.id })
            .resolves([]);

          certificationCourseRepository.get
            .withArgs({ id: assessment.certificationCourseId })
            .resolves(v3CertificationCourse);
          sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
            .withArgs(assessment.certificationCourseId, [])
            .resolves(nonAnsweredCertificationChallenge);
          sharedChallengeRepository.get
            .withArgs(nonAnsweredCertificationChallenge.challengeId)
            .resolves(lastSeenChallenge);

          // when
          const challenge = await getNextChallenge({
            answerRepository,
            assessment,
            sessionManagementCertificationChallengeRepository,
            certificationChallengeLiveAlertRepository,
            certificationCourseRepository,
            sharedChallengeRepository,
            flashAlgorithmConfigurationRepository,
            flashAlgorithmService,
            locale,
            pickChallengeService,
            certificationCandidateRepository,
          });

          // then
          expect(challenge).to.equal(lastSeenChallenge);
          expect(sessionManagementCertificationChallengeRepository.save).not.to.have.been.called;
        });
      });
    });

    context('when some answered challenges are not valid anymore', function () {
      it('saves next challenge', async function () {
        // given
        const nextChallengeToAnswer = domainBuilder.buildChallenge({
          id: 'nextChallengeToAnswer',
          blindnessCompatibility: 'KO',
          status: 'validé',
          skill: domainBuilder.buildSkill({ id: 'nottAnsweredSkill' }),
        });
        const alreadyAnsweredChallenge = domainBuilder.buildChallenge({
          id: 'alreadyAnsweredChallenge',
          status: 'validé',
        });
        const outdatedChallenge = domainBuilder.buildChallenge({ id: 'outdatedChallenge', status: 'périmé' });
        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
        });
        const locale = 'fr-FR';

        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(v3CertificationCourse.getStartDate())
          .resolves(flashAlgorithmConfiguration);

        const answerStillValid = domainBuilder.buildAnswer({ challengeId: alreadyAnsweredChallenge.id });
        const answerWithOutdatedChallenge = domainBuilder.buildAnswer({ challengeId: outdatedChallenge.id });
        answerRepository.findByAssessmentExcludingChallengeIds
          .withArgs({ assessmentId: assessment.id, excludedChallengeIds: [] })
          .resolves([answerStillValid, answerWithOutdatedChallenge]);

        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        certificationCourseRepository.get
          .withArgs({ id: assessment.certificationCourseId })
          .resolves(v3CertificationCourse);
        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(null);
        sharedChallengeRepository.get.resolves();

        const candidate = domainBuilder.buildCertificationCandidateForSupervising();
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        sharedChallengeRepository.findActiveFlashCompatible
          .withArgs({
            locale,
            date: candidate.reconciledAt,
            complementaryCertificationKey: undefined,
            hasComplementaryReferential: undefined,
          })
          .resolves([alreadyAnsweredChallenge, nextChallengeToAnswer]);

        sharedChallengeRepository.getMany
          .withArgs([alreadyAnsweredChallenge.id, outdatedChallenge.id])
          .resolves([alreadyAnsweredChallenge, outdatedChallenge]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [answerStillValid, answerWithOutdatedChallenge],
            challenges: [alreadyAnsweredChallenge, outdatedChallenge, nextChallengeToAnswer],
            capacity: config.v3Certification.defaultCandidateCapacity,
            variationPercent: undefined,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [nextChallengeToAnswer],
            capacity: 0,
          })
          .returns([nextChallengeToAnswer]);

        const getChallengePickerImpl = sinon.stub();
        getChallengePickerImpl
          .withArgs({
            possibleChallenges: [nextChallengeToAnswer],
          })
          .returns(nextChallengeToAnswer);
        pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

        // when
        const challenge = await getNextChallenge({
          answerRepository,
          assessment,
          sessionManagementCertificationChallengeRepository,
          certificationChallengeLiveAlertRepository,
          certificationCourseRepository,
          sharedChallengeRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          locale,
          pickChallengeService,
          certificationCandidateRepository,
          complementaryCertificationScoringCriteriaRepository,
        });

        // then
        expect(challenge).to.equal(nextChallengeToAnswer);
      });
    });

    context('when there are challenges with validated live alerts', function () {
      it('should save the returned next challenge', async function () {
        // given
        const locale = 'fr-FR';
        const skill = domainBuilder.buildSkill({ id: 'skill1' });

        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
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

        answerRepository.findByAssessmentExcludingChallengeIds
          .withArgs({
            assessmentId: assessment.id,
            excludedChallengeIds: [nonAnsweredCertificationChallenge.challengeId],
          })
          .resolves([]);

        const candidate = domainBuilder.buildCertificationCandidateForSupervising();
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        sharedChallengeRepository.findActiveFlashCompatible
          .withArgs({
            locale,
            date: candidate.reconciledAt,
            complementaryCertificationKey: undefined,
            hasComplementaryReferential: undefined,
          })
          .resolves([nextChallenge, lastSeenChallenge]);
        sharedChallengeRepository.getMany.withArgs([]).resolves([]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: [nextChallenge],
            capacity: config.v3Certification.defaultCandidateCapacity,
            variationPercent: undefined,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [nextChallenge],
            capacity: 0,
          })
          .returns([nextChallenge]);

        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([nonAnsweredCertificationChallenge.challengeId]);

        certificationCourseRepository.get
          .withArgs({ id: assessment.certificationCourseId })
          .resolves(v3CertificationCourse);
        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(nonAnsweredCertificationChallenge);

        const getChallengePickerImpl = sinon.stub();
        getChallengePickerImpl
          .withArgs({
            possibleChallenges: [nextChallenge],
          })
          .returns(nextChallenge);
        pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

        // when
        const challenge = await getNextChallenge({
          answerRepository,
          assessment,
          sessionManagementCertificationChallengeRepository,
          certificationChallengeLiveAlertRepository,
          certificationCourseRepository,
          sharedChallengeRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          locale,
          pickChallengeService,
          certificationCandidateRepository,
          complementaryCertificationScoringCriteriaRepository,
        });

        // then
        expect(challenge).to.equal(nextChallenge);
        expect(sessionManagementCertificationChallengeRepository.save).to.have.been.called;
      });

      it('should not return a challenge with the same skill', async function () {
        // given
        const locale = 'fr-FR';
        const firstSkill = domainBuilder.buildSkill({ id: 'skill1' });
        const secondSkill = domainBuilder.buildSkill({ id: 'skill2' });

        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
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

        answerRepository.findByAssessmentExcludingChallengeIds
          .withArgs({
            assessmentId: assessment.id,
            excludedChallengeIds: [nonAnsweredCertificationChallenge.challengeId],
          })
          .resolves([]);
        sharedChallengeRepository.findActiveFlashCompatible
          .withArgs()
          .resolves([challengeWithLiveAlert, challengeWithOtherSkill, challengeWithLiveAlertedSkill]);
        sharedChallengeRepository.getMany.withArgs([]).resolves([]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: [challengeWithOtherSkill],
            capacity: config.v3Certification.defaultCandidateCapacity,
            variationPercent: undefined,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [challengeWithOtherSkill],
            capacity: 0,
          })
          .returns([challengeWithOtherSkill]);

        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([nonAnsweredCertificationChallenge.challengeId]);

        certificationCourseRepository.get
          .withArgs({ id: assessment.certificationCourseId })
          .resolves(v3CertificationCourse);
        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(nonAnsweredCertificationChallenge);

        const getChallengePickerImpl = sinon.stub();
        getChallengePickerImpl
          .withArgs({
            possibleChallenges: [challengeWithOtherSkill],
          })
          .returns(challengeWithOtherSkill);
        pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

        // when
        const challenge = await getNextChallenge({
          answerRepository,
          assessment,
          sessionManagementCertificationChallengeRepository,
          certificationChallengeLiveAlertRepository,
          certificationCourseRepository,
          sharedChallengeRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          locale,
          pickChallengeService,
          certificationCandidateRepository,
          complementaryCertificationScoringCriteriaRepository,
        });

        // then
        expect(challenge).to.equal(challengeWithOtherSkill);
        expect(sessionManagementCertificationChallengeRepository.save).to.have.been.called;
      });
    });

    context('when there are no challenges left', function () {
      it('should return the AssessmentEndedError', async function () {
        // given
        const answeredChallenge = domainBuilder.buildChallenge();
        const answer = domainBuilder.buildAnswer({ challengeId: answeredChallenge.id });
        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
        });
        const assessment = domainBuilder.buildAssessment();
        const locale = 'fr-FR';

        const flashAlgorithmService = {
          getPossibleNextChallenges: sinon.stub(),
          getCapacityAndErrorRate: sinon.stub(),
        };

        flashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({ maximumAssessmentLength: 1 });
        flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
          .withArgs(v3CertificationCourse.getStartDate())
          .resolves(flashAlgorithmConfiguration);

        answerRepository.findByAssessmentExcludingChallengeIds
          .withArgs({ assessmentId: assessment.id, excludedChallengeIds: [] })
          .resolves([answer]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        certificationCourseRepository.get
          .withArgs({ id: assessment.certificationCourseId })
          .resolves(v3CertificationCourse);
        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [answeredChallenge.id])
          .resolves(null);
        sharedChallengeRepository.get.resolves();

        const candidate = domainBuilder.buildCertificationCandidateForSupervising();
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        sharedChallengeRepository.findActiveFlashCompatible
          .withArgs({
            locale,
            date: candidate.reconciledAt,
            complementaryCertificationKey: undefined,
            hasComplementaryReferential: undefined,
          })
          .resolves([answeredChallenge]);
        sharedChallengeRepository.getMany.withArgs([answeredChallenge.id]).resolves([answeredChallenge]);

        // when
        const error = await catchErr(getNextChallenge)({
          answerRepository,
          assessment,
          sessionManagementCertificationChallengeRepository,
          certificationChallengeLiveAlertRepository,
          certificationCourseRepository,
          sharedChallengeRepository,
          flashAlgorithmConfigurationRepository,
          flashAlgorithmService,
          locale,
          pickChallengeService,
          certificationCandidateRepository,
          certificationCandidateId,
          complementaryCertificationScoringCriteriaRepository,
        });

        // then
        expect(error).to.be.instanceOf(AssessmentEndedError);
        expect(error.message).to.equal('Evaluation terminée.');
      });
    });

    context('when loading a configuration', function () {
      const competenceId = 'cmp1';

      Object.entries({
        challengesBetweenSameCompetence: 2,
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
              version: AlgorithmEngineVersion.V3,
            });

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate.reset();
            const configuration = domainBuilder.buildFlashAlgorithmConfiguration(flashConfiguration);
            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(v3CertificationCourse.getStartDate())
              .resolves(configuration);

            const assessment = domainBuilder.buildAssessment();
            const locale = 'fr-FR';

            answerRepository.findByAssessmentExcludingChallengeIds
              .withArgs({ assessmentId: assessment.id, excludedChallengeIds: [] })
              .resolves([]);
            certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
              .withArgs({ assessmentId: assessment.id })
              .resolves([]);

            certificationCourseRepository.get
              .withArgs({ id: assessment.certificationCourseId })
              .resolves(v3CertificationCourse);
            sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
              .withArgs(assessment.certificationCourseId, [])
              .resolves(null);
            sharedChallengeRepository.get.resolves();

            const candidate = domainBuilder.buildCertificationCandidateForSupervising();
            certificationCandidateRepository.findByAssessmentId
              .withArgs({ assessmentId: assessment.id })
              .resolves(candidate);

            sharedChallengeRepository.findActiveFlashCompatible
              .withArgs({
                locale,
                date: candidate.reconciledAt,
                complementaryCertificationKey: undefined,
                hasComplementaryReferential: undefined,
              })
              .resolves([nextChallengeToAnswer]);
            sharedChallengeRepository.getMany.withArgs([]).resolves([]);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                allAnswers: [],
                challenges: [nextChallengeToAnswer],
                capacity: config.v3Certification.defaultCandidateCapacity,
                variationPercent: configuration.variationPercent,
              })
              .returns({ capacity: 0 });

            flashAlgorithmService.getPossibleNextChallenges
              .withArgs({
                availableChallenges: [nextChallengeToAnswer],
                capacity: 0,
              })
              .returns([nextChallengeToAnswer]);

            const getChallengePickerImpl = sinon.stub();
            getChallengePickerImpl
              .withArgs({
                possibleChallenges: [nextChallengeToAnswer],
              })
              .returns(nextChallengeToAnswer);
            pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

            // when
            const challenge = await getNextChallenge({
              answerRepository,
              assessment,
              sessionManagementCertificationChallengeRepository,
              certificationChallengeLiveAlertRepository,
              certificationCourseRepository,
              sharedChallengeRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              locale,
              pickChallengeService,
              certificationCandidateRepository,
              complementaryCertificationScoringCriteriaRepository,
            });

            // then
            expect(challenge).to.equal(nextChallengeToAnswer);
          });
        });
    });
  });
});
