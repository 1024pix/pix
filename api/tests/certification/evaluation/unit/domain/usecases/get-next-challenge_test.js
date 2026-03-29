import {
  candidateCertificationReferential,
  getNextChallenge,
} from '../../../../../../src/certification/evaluation/domain/usecases/get-next-challenge.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { AssessmentEndedError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Evaluation | Unit | Domain | Use Cases | get-next-challenge', function () {
  describe('#getNextChallenge', function () {
    let answerRepository,
      calibratedChallengeRepository,
      complementaryCertificationRepository,
      certificationChallengeLiveAlertRepository,
      sessionManagementCertificationChallengeRepository,
      pickChallengeService,
      flashAlgorithmService,
      certificationCandidateRepository,
      versionRepository;
    let dependencies;

    let version;
    let assessment;

    beforeEach(function () {
      versionRepository = {
        getByScopeAndReconciliationDate: sinon.stub(),
      };
      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      calibratedChallengeRepository = {
        findActiveFlashCompatible: sinon.stub(),
        getMany: sinon.stub(),
      };
      complementaryCertificationRepository = {
        get: sinon.stub(),
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
      const candidate = domainBuilder.certification.evaluation.buildCandidate({
        accessibilityAdjustmentNeeded: false,
      });

      certificationCandidateRepository.findByAssessmentId.withArgs({ assessmentId: assessment.id }).resolves(candidate);

      version = domainBuilder.certification.shared.buildVersion();
      dependencies = {
        answerRepository,
        certificationCandidateRepository,
        certificationChallengeLiveAlertRepository,
        sessionManagementCertificationChallengeRepository,
        calibratedChallengeRepository,
        versionRepository,
        flashAlgorithmService,
        pickChallengeService,
      };
    });

    context('when there are challenges left to answer', function () {
      it('should compute the next challenge ID', async function () {
        // given
        const nextCalibratedChallenge = domainBuilder.certification.evaluation.buildCalibratedChallenge({
          blindnessCompatibility: 'KO',
        });
        const locale = 'fr-FR';
        const complementaryCertificationId = 123;
        const complementaryCertification =
          domainBuilder.certification.complementaryCertification.buildComplementaryCertification({
            id: complementaryCertificationId,
            key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          });

        versionRepository.getByScopeAndReconciliationDate.resolves(version);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(null);

        const reconciledAt = new Date('2024-10-18');
        const candidate = domainBuilder.certification.evaluation.buildCandidate({ reconciledAt });
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        complementaryCertificationRepository.get
          .withArgs({ id: complementaryCertificationId })
          .resolves(complementaryCertification);

        calibratedChallengeRepository.findActiveFlashCompatible.resolves([nextCalibratedChallenge]);
        calibratedChallengeRepository.getMany.withArgs({ ids: [], version }).resolves([]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: [nextCalibratedChallenge],
            capacity: version.challengesConfiguration.defaultCandidateCapacity,
            variationPercent: version.challengesConfiguration.variationPercent,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [nextCalibratedChallenge],
            capacity: 0,
          })
          .returns([nextCalibratedChallenge]);

        const getChallengePickerImpl = sinon.stub();
        getChallengePickerImpl
          .withArgs({
            possibleChallenges: [nextCalibratedChallenge],
          })
          .returns(nextCalibratedChallenge);
        pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

        // when
        const returnedChallengeId = await getNextChallenge({
          assessment,
          locale,
          ...dependencies,
        });

        // then
        expect(returnedChallengeId).to.equal(nextCalibratedChallenge.id);
        expect(sessionManagementCertificationChallengeRepository.save).to.have.been.called;
      });

      context('when candidate needs accessibility adjustment', function () {
        it('should only pick among challenges with no accessibilities issues', async function () {
          // given
          const nextCalibratedChallenge = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'recCHAL1',
            blindnessCompatibility: 'RAS',
            colorBlindnessCompatibility: 'OK',
          });
          const accessibleChallenge = domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: 'recCHAL2',
            blindnessCompatibility: 'OK',
            colorBlindnessCompatibility: 'RAS',
          });
          const allChallenges = [
            nextCalibratedChallenge,
            accessibleChallenge,
            domainBuilder.certification.evaluation.buildCalibratedChallenge({
              blindnessCompatibility: 'autre chose',
              colorBlindnessCompatibility: 'OK',
            }),
          ];
          const assessment = domainBuilder.buildAssessment();
          const locale = 'fr-FR';

          versionRepository.getByScopeAndReconciliationDate.resolves(version);

          answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
          certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
            .withArgs({ assessmentId: assessment.id })
            .resolves([]);

          sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
            .withArgs(assessment.certificationCourseId, [])
            .resolves(null);

          const candidateNeedingAccessibilityAdjustment = domainBuilder.certification.evaluation.buildCandidate({
            id: 'candidateNeedingAccessibilityAdjustmentId',
            accessibilityAdjustmentNeeded: true,
          });
          certificationCandidateRepository.findByAssessmentId
            .withArgs({ assessmentId: assessment.id })
            .resolves(candidateNeedingAccessibilityAdjustment);

          calibratedChallengeRepository.findActiveFlashCompatible
            .withArgs({
              locale,
              version,
            })
            .resolves(allChallenges);

          calibratedChallengeRepository.getMany.withArgs({ ids: [], version }).resolves([]);

          flashAlgorithmService.getCapacityAndErrorRate
            .withArgs({
              allAnswers: [],
              challenges: [nextCalibratedChallenge, accessibleChallenge],
              capacity: version.challengesConfiguration.defaultCandidateCapacity,
              variationPercent: version.challengesConfiguration.variationPercent,
            })
            .returns({ capacity: 0 });

          flashAlgorithmService.getPossibleNextChallenges
            .withArgs({
              availableChallenges: [nextCalibratedChallenge, accessibleChallenge],
              capacity: 0,
            })
            .returns([nextCalibratedChallenge]);

          const getChallengePickerImpl = sinon.stub();
          getChallengePickerImpl
            .withArgs({
              possibleChallenges: [nextCalibratedChallenge],
            })
            .returns(nextCalibratedChallenge);
          pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

          // when
          const returnedChallengeId = await getNextChallenge({
            assessment,
            locale,
            ...dependencies,
          });

          // then
          expect(returnedChallengeId).to.equal(nextCalibratedChallenge.id);
          expect(sessionManagementCertificationChallengeRepository.save).to.have.been.called;
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
            challengeId: 'recIdNotAnsweredYet',
            courseId: v3CertificationCourse.getId(),
          });

          answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
          certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
            .withArgs({ assessmentId: assessment.id })
            .resolves([]);

          sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
            .withArgs(assessment.certificationCourseId, [])
            .resolves(nonAnsweredCertificationChallenge);

          // when
          const returnedChallengeId = await getNextChallenge({
            assessment,
            locale,
            ...dependencies,
          });

          // then
          expect(returnedChallengeId).to.equal(nonAnsweredCertificationChallenge.challengeId);
          expect(sessionManagementCertificationChallengeRepository.save).not.to.have.been.called;
        });
      });
    });

    context('when some answered challenges are not valid anymore', function () {
      it('saves next challenge', async function () {
        // given
        const nextCalibratedChallenge = domainBuilder.buildChallenge({
          id: 'nextCalibratedChallenge',
          blindnessCompatibility: 'KO',
          status: 'validé',
          skill: domainBuilder.buildSkill({ id: 'nottAnsweredSkill' }),
        });
        const alreadyAnsweredChallenge = domainBuilder.buildChallenge({
          id: 'alreadyAnsweredChallenge',
          status: 'validé',
        });
        const outdatedChallenge = domainBuilder.buildChallenge({ id: 'outdatedChallenge', status: 'périmé' });
        const locale = 'fr-FR';

        versionRepository.getByScopeAndReconciliationDate.resolves(version);

        const answerStillValid = domainBuilder.buildAnswer({ challengeId: alreadyAnsweredChallenge.id });
        const answerWithOutdatedChallenge = domainBuilder.buildAnswer({ challengeId: outdatedChallenge.id });
        answerRepository.findByAssessment
          .withArgs(assessment.id)
          .resolves([answerStillValid, answerWithOutdatedChallenge]);

        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(null);

        const candidate = domainBuilder.certification.evaluation.buildCandidate();
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        calibratedChallengeRepository.findActiveFlashCompatible
          .withArgs({
            locale,
            version,
          })
          .resolves([alreadyAnsweredChallenge, nextCalibratedChallenge]);

        calibratedChallengeRepository.getMany
          .withArgs({ ids: [alreadyAnsweredChallenge.id, outdatedChallenge.id], version })
          .resolves([alreadyAnsweredChallenge, outdatedChallenge]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [answerStillValid, answerWithOutdatedChallenge],
            challenges: [alreadyAnsweredChallenge, outdatedChallenge, nextCalibratedChallenge],
            capacity: version.challengesConfiguration.defaultCandidateCapacity,
            variationPercent: version.challengesConfiguration.variationPercent,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [nextCalibratedChallenge],
            capacity: 0,
          })
          .returns([nextCalibratedChallenge]);

        const getChallengePickerImpl = sinon.stub();
        getChallengePickerImpl
          .withArgs({
            possibleChallenges: [nextCalibratedChallenge],
          })
          .returns(nextCalibratedChallenge);
        pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

        // when
        const returnedChallengeId = await getNextChallenge({
          assessment,
          locale,
          ...dependencies,
        });

        // then
        expect(returnedChallengeId).to.equal(nextCalibratedChallenge.id);
        expect(sessionManagementCertificationChallengeRepository.save).to.have.been.called;
      });
    });

    context('when there are challenges with validated live alerts', function () {
      it('should save the returned next challenge', async function () {
        // given
        const locale = 'fr-FR';
        const skill = domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({ id: 'skill1' });

        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
        });
        const assessment = domainBuilder.buildAssessment();

        const nonAnsweredCertificationChallenge = domainBuilder.buildCertificationChallenge({
          courseId: v3CertificationCourse.getId(),
        });

        const nextCalibratedChallenge = domainBuilder.certification.evaluation.buildCalibratedChallenge({
          id: 'NextChallenge',
          skill,
        });

        const lastSeenChallenge = domainBuilder.buildChallenge({
          id: nonAnsweredCertificationChallenge.challengeId,
        });

        versionRepository.getByScopeAndReconciliationDate.resolves(version);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);

        const candidate = domainBuilder.certification.evaluation.buildCandidate();
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        calibratedChallengeRepository.findActiveFlashCompatible
          .withArgs({
            locale,
            version,
          })
          .resolves([nextCalibratedChallenge, lastSeenChallenge]);
        calibratedChallengeRepository.getMany.withArgs({ ids: [], version }).resolves([]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: [nextCalibratedChallenge],
            capacity: version.challengesConfiguration.defaultCandidateCapacity,
            variationPercent: version.challengesConfiguration.variationPercent,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [nextCalibratedChallenge],
            capacity: 0,
          })
          .returns([nextCalibratedChallenge]);

        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([nonAnsweredCertificationChallenge.challengeId]);

        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(nonAnsweredCertificationChallenge);

        const getChallengePickerImpl = sinon.stub();
        getChallengePickerImpl
          .withArgs({
            possibleChallenges: [nextCalibratedChallenge],
          })
          .returns(nextCalibratedChallenge);
        pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

        // when
        const returnedChallengeId = await getNextChallenge({
          assessment,
          locale,
          ...dependencies,
        });

        // then
        expect(returnedChallengeId).to.equal(nextCalibratedChallenge.id);
        expect(sessionManagementCertificationChallengeRepository.save).to.have.been.called;
      });

      it('should not return a challenge with the same skill', async function () {
        // given
        const locale = 'fr-FR';
        const firstSkill = domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({ id: 'skill1' });
        const secondSkill = domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({ id: 'skill2' });

        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
        });
        const assessment = domainBuilder.buildAssessment();

        const nonAnsweredCertificationChallenge = domainBuilder.buildCertificationChallenge({
          courseId: v3CertificationCourse.getId(),
        });

        const calibratedChallengeWithLiveAlertedSkill = domainBuilder.certification.evaluation.buildCalibratedChallenge(
          {
            id: 'NextChallenge',
            skill: firstSkill,
          },
        );

        const calibratedChallengeWithOtherSkill = domainBuilder.certification.evaluation.buildCalibratedChallenge({
          id: 'NextChallenge',
          skill: secondSkill,
        });

        const calibratedChallengeWithLiveAlert = domainBuilder.certification.evaluation.buildCalibratedChallenge({
          id: nonAnsweredCertificationChallenge.challengeId,
          skill: firstSkill,
        });

        versionRepository.getByScopeAndReconciliationDate.resolves(version);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        calibratedChallengeRepository.findActiveFlashCompatible
          .withArgs()
          .resolves([
            calibratedChallengeWithLiveAlert,
            calibratedChallengeWithOtherSkill,
            calibratedChallengeWithLiveAlertedSkill,
          ]);
        calibratedChallengeRepository.getMany.withArgs({ ids: [], version }).resolves([]);

        flashAlgorithmService.getCapacityAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: [calibratedChallengeWithOtherSkill],
            capacity: version.challengesConfiguration.defaultCandidateCapacity,
            variationPercent: version.challengesConfiguration.variationPercent,
          })
          .returns({ capacity: 0 });

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [calibratedChallengeWithOtherSkill],
            capacity: 0,
          })
          .returns([calibratedChallengeWithOtherSkill]);

        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([nonAnsweredCertificationChallenge.challengeId]);

        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(nonAnsweredCertificationChallenge);

        const getChallengePickerImpl = sinon.stub();
        getChallengePickerImpl
          .withArgs({
            possibleChallenges: [calibratedChallengeWithOtherSkill],
          })
          .returns(calibratedChallengeWithOtherSkill);
        pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

        // when
        const returnedChallengeId = await getNextChallenge({
          assessment,
          locale,
          ...dependencies,
        });

        // then
        expect(returnedChallengeId).to.equal(calibratedChallengeWithOtherSkill.id);
        expect(sessionManagementCertificationChallengeRepository.save).to.have.been.called;
      });
    });

    context('when there are no challenges left', function () {
      it('should return the AssessmentEndedError', async function () {
        // given
        const answeredChallenge = domainBuilder.buildChallenge();
        const answer = domainBuilder.buildAnswer({ challengeId: answeredChallenge.id });
        const assessment = domainBuilder.buildAssessment();
        const locale = 'fr-FR';

        const flashAlgorithmService = {
          getPossibleNextChallenges: sinon.stub(),
          getCapacityAndErrorRate: sinon.stub(),
        };

        version = domainBuilder.certification.shared.buildVersion({
          challengesConfiguration: { maximumAssessmentLength: 1 },
        });
        versionRepository.getByScopeAndReconciliationDate.resolves(version);

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([answer]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [answeredChallenge.id])
          .resolves(null);

        const candidate = domainBuilder.certification.evaluation.buildCandidate();
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        calibratedChallengeRepository.findActiveFlashCompatible
          .withArgs({
            locale,
            version,
          })
          .resolves([answeredChallenge]);
        calibratedChallengeRepository.getMany
          .withArgs({ ids: [answeredChallenge.id], version })
          .resolves([answeredChallenge]);

        // when
        const error = await catchErr(getNextChallenge)({
          assessment,
          locale,
          ...dependencies,
          flashAlgorithmService,
        });

        // then
        expect(error).to.be.instanceOf(AssessmentEndedError);
        expect(error.message).to.equal('Evaluation terminée.');
      });
    });

    context('when loading a configuration', function () {
      Object.entries({
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: true,
        variationPercent: 0.2,
        defaultCandidateCapacity: 0,
      })
        .map(([key, value]) => ({
          [key]: value,
        }))
        .forEach((flashConfiguration) => {
          it('should use the configuration', async function () {
            //given
            const nextCalibratedChallenge = domainBuilder.certification.evaluation.buildCalibratedChallenge();

            version = domainBuilder.certification.shared.buildVersion({ challengesConfiguration: flashConfiguration });
            versionRepository.getByScopeAndReconciliationDate.resolves(version);

            const assessment = domainBuilder.buildAssessment();
            const locale = 'fr-FR';

            answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
            certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
              .withArgs({ assessmentId: assessment.id })
              .resolves([]);

            sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
              .withArgs(assessment.certificationCourseId, [])
              .resolves(null);

            const candidate = domainBuilder.certification.evaluation.buildCandidate();
            certificationCandidateRepository.findByAssessmentId
              .withArgs({ assessmentId: assessment.id })
              .resolves(candidate);

            calibratedChallengeRepository.findActiveFlashCompatible
              .withArgs({
                locale,
                version,
              })
              .resolves([nextCalibratedChallenge]);
            calibratedChallengeRepository.getMany.withArgs({ ids: [], version }).resolves([]);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                allAnswers: [],
                challenges: [nextCalibratedChallenge],
                capacity: version.challengesConfiguration.defaultCandidateCapacity,
                variationPercent: version.challengesConfiguration.variationPercent,
              })
              .returns({ capacity: 0 });

            flashAlgorithmService.getPossibleNextChallenges
              .withArgs({
                availableChallenges: [nextCalibratedChallenge],
                capacity: 0,
              })
              .returns([nextCalibratedChallenge]);

            const getChallengePickerImpl = sinon.stub();
            getChallengePickerImpl
              .withArgs({
                possibleChallenges: [nextCalibratedChallenge],
              })
              .returns(nextCalibratedChallenge);
            pickChallengeService.getChallengePicker.withArgs().returns(getChallengePickerImpl);

            // when
            const returnedChallengeId = await getNextChallenge({
              assessment,
              locale,
              ...dependencies,
            });

            // then
            expect(returnedChallengeId).to.equal(nextCalibratedChallenge.id);
          });
        });
    });

    context('when the certification is a complementary certification', function () {
      it('should call findActiveFlashCompatible with the version', async function () {
        // given
        versionRepository = {
          getByScopeAndReconciliationDate: sinon.stub(),
        };
        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
        });
        const assessment = domainBuilder.buildAssessment({
          certificationCourseId: v3CertificationCourse.getId(),
        });
        const locale = 'fr-FR';

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(null);

        const candidate = domainBuilder.certification.evaluation.buildCandidate({
          subscriptionScope: SCOPES.PIX_PLUS_EDU_CPE,
        });
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        version = domainBuilder.certification.shared.buildVersion({ scope: SCOPES.PIX_PLUS_EDU_CPE });
        versionRepository.getByScopeAndReconciliationDate
          .withArgs({
            scope: SCOPES.PIX_PLUS_EDU_CPE,
            reconciliationDate: candidate.reconciledAt,
          })
          .resolves(version);

        calibratedChallengeRepository.findActiveFlashCompatible.resolves([]);

        // when
        await catchErr(getNextChallenge)({
          assessment,
          locale,
          ...dependencies,
          versionRepository,
        });

        // then
        expect(calibratedChallengeRepository.findActiveFlashCompatible).to.have.been.calledOnceWithExactly({
          locale,
          version,
        });
      });
    });

    context('when the certification is a Pix core or double certification', function () {
      it('should call findActiveFlashCompatible without version', async function () {
        // given
        const v3CertificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgorithmEngineVersion.V3,
        });
        const assessment = domainBuilder.buildAssessment({
          certificationCourseId: v3CertificationCourse.getId(),
        });
        const locale = 'fr-FR';

        answerRepository.findByAssessment.withArgs(assessment.id).resolves([]);
        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves([]);

        sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId
          .withArgs(assessment.certificationCourseId, [])
          .resolves(null);
        versionRepository.getByScopeAndReconciliationDate.resolves(version);

        const candidate = domainBuilder.certification.evaluation.buildCandidate({
          subscriptionScope: SCOPES.CORE,
        });
        certificationCandidateRepository.findByAssessmentId
          .withArgs({ assessmentId: assessment.id })
          .resolves(candidate);

        calibratedChallengeRepository.findActiveFlashCompatible.resolves([]);

        // when
        await catchErr(getNextChallenge)({
          assessment,
          locale,
          ...dependencies,
        });

        // then
        expect(calibratedChallengeRepository.findActiveFlashCompatible).to.have.been.calledOnceWithExactly({
          locale,
          version,
        });
      });
    });
  });

  describe('#candidateCertificationReferential', function () {
    it('returns deduplicated challenges by id', async function () {
      // given
      const challengeListA = [
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL2' }),
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL1' }),
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL1' }),
      ];

      const challengeListB = [domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL1' })];

      const expectedChallengeList = [
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL2' }),
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL1' }),
      ];

      // when
      const deduplicatedChallenges = candidateCertificationReferential(challengeListA, challengeListB);

      // then
      expect(deduplicatedChallenges.length).to.equal(2);
      expect(deduplicatedChallenges).to.have.deep.members(expectedChallengeList);
    });

    it('should return challenges with answeredCalibratedChallenges taking precedence over currentCalibratedChallenges', async function () {
      // given
      const answeredCalibratedChallenges = [
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL2' }),
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL1', discriminant: 10 }),
      ];

      const currentCalibratedChallenges = [
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL1', discriminant: 11 }),
      ];

      const expectedChallengeList = [
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL2' }),
        domainBuilder.certification.evaluation.buildCalibratedChallenge({ id: 'recCHAL1', discriminant: 10 }),
      ];

      // when
      const deduplicatedChallenges = candidateCertificationReferential(
        answeredCalibratedChallenges,
        currentCalibratedChallenges,
      );

      // then
      expect(deduplicatedChallenges.length).to.equal(2);
      expect(deduplicatedChallenges).to.have.deep.members(expectedChallengeList);
    });
  });
});
