import { retrieveLastOrCreateCertificationCourse } from '../../../../src/certification/evaluation/domain/usecases/retrieve-last-or-create-certification-course.js';
import { SessionNotAccessible } from '../../../../src/certification/session-management/domain/errors.js';
import { ComplementaryCertificationCourse } from '../../../../src/certification/session-management/domain/models/ComplementaryCertificationCourse.js';
import { AlgorithmEngineVersion } from '../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourse } from '../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { MAX_REACHABLE_LEVEL } from '../../../../src/shared/domain/constants.js';
import { DomainTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  LanguageNotSupportedError,
  NotFoundError,
  UnexpectedUserAccountError,
} from '../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { FRENCH_SPOKEN } from '../../../../src/shared/domain/services/locale-service.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | retrieve-last-or-create-certification-course', function () {
  let clock;
  let reconciledAt;
  let verificationCode;

  const sessionRepository = {};
  const assessmentRepository = {};
  const competenceRepository = {};
  const sharedCertificationCandidateRepository = {};
  const certificationChallengeRepository = {};
  const certificationChallengesService = {};
  const certificationCourseRepository = {};
  const certificationCenterRepository = {};
  const certificationBadgesService = {};
  const placementProfileService = {};
  const verifyCertificateCodeService = {};
  const userRepository = {};

  const injectables = {
    assessmentRepository,
    competenceRepository,
    sharedCertificationCandidateRepository,
    certificationChallengeRepository,
    certificationCourseRepository,
    sessionRepository,
    certificationCenterRepository,
    certificationBadgesService,
    certificationChallengesService,
    placementProfileService,
    verifyCertificateCodeService,
    userRepository,
  };

  beforeEach(function () {
    reconciledAt = new Date('2019-01-01T05:06:07Z');
    clock = sinon.useFakeTimers({ now: reconciledAt, toFake: ['Date'] });
    verificationCode = Symbol('verificationCode');

    assessmentRepository.save = sinon.stub();
    competenceRepository.listPixCompetencesOnly = sinon.stub();
    certificationBadgesService.findStillValidBadgeAcquisitions = sinon.stub();
    sharedCertificationCandidateRepository.getBySessionIdAndUserId = sinon.stub();
    sharedCertificationCandidateRepository.update = sinon.stub();
    certificationChallengeRepository.save = sinon.stub();
    certificationChallengesService.pickCertificationChallengesForPixPlus = sinon.stub();
    certificationChallengesService.pickCertificationChallenges = sinon.stub();
    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId = sinon.stub();
    certificationCourseRepository.save = sinon.stub();
    sessionRepository.get = sinon.stub();
    userRepository.get = sinon.stub();
    placementProfileService.getPlacementProfile = sinon.stub();
    verifyCertificateCodeService.generateCertificateVerificationCode = sinon.stub().resolves(verificationCode);
    certificationCenterRepository.getBySessionId = sinon.stub();
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when session access code is different from provided access code', function () {
    it('should throw a not found error', async function () {
      // given
      const foundSession = domainBuilder.certification.sessionManagement.buildSession({
        accessCode: 'differentAccessCode',
      });
      sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

      // when
      const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
        sessionId: 1,
        accessCode: 'accessCode',
        userId: 2,
        locale: 'fr',
        ...injectables,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(certificationCourseRepository.save).not.to.have.been.called;
      expect(verifyCertificateCodeService.generateCertificateVerificationCode).not.to.have.been.called;
    });
  });

  context('when session access code is the same as the provided access code', function () {
    context('when session is not accessible', function () {
      it('should throw a SessionNotAccessible error', async function () {
        // given
        const foundSession = domainBuilder.certification.sessionManagement.buildSession.finalized({
          id: 1,
          accessCode: 'accessCode',
        });
        sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

        // when
        const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
          sessionId: 1,
          accessCode: 'accessCode',
          userId: 2,
          locale: 'fr',
          ...injectables,
        });

        // then
        expect(error).to.be.instanceOf(SessionNotAccessible);
        expect(certificationCourseRepository.save).not.to.have.been.called;
        expect(verifyCertificateCodeService.generateCertificateVerificationCode).not.to.have.been.called;
      });
    });

    context('when session is accessible', function () {
      context('when the candidate IS NOT authorized', function () {
        context('when the user tries to join the session for the first time', function () {
          it('should throw a CandidateNotAuthorizedToJoinSessionError', async function () {
            // given
            const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
              id: 1,
              accessCode: 'accessCode',
            });
            sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

            const candidateNotAuthorizedToStart = domainBuilder.buildCertificationCandidate({
              userId: 2,
              sessionId: 1,
              authorizedToStart: false,
              subscriptions: [domainBuilder.buildCoreSubscription()],
            });
            sharedCertificationCandidateRepository.getBySessionIdAndUserId
              .withArgs({ sessionId: 1, userId: 2 })
              .resolves(candidateNotAuthorizedToStart);

            // when
            const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
              sessionId: 1,
              accessCode: 'accessCode',
              userId: 2,
              locale: 'fr',
              ...injectables,
            });

            // then
            expect(error).to.be.an.instanceOf(CandidateNotAuthorizedToJoinSessionError);
          });
        });

        context('when the user tries to go back to the session without authorization', function () {
          it('should throw a CandidateNotAuthorizedToResumeCertificationTestError', async function () {
            // given
            const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
              id: 1,
              accessCode: 'accessCode',
            });
            sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

            const candidateNotAuthorizedToStart = domainBuilder.buildCertificationCandidate({
              userId: 2,
              sessionId: 1,
              authorizedToStart: false,
              subscriptions: [domainBuilder.buildCoreSubscription()],
            });
            sharedCertificationCandidateRepository.getBySessionIdAndUserId
              .withArgs({ sessionId: 1, userId: 2 })
              .resolves(candidateNotAuthorizedToStart);

            const existingCertificationCourse = domainBuilder.buildCertificationCourse({ userId: 2, sessionId: 1 });
            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId: 2, sessionId: 1 })
              .resolves(existingCertificationCourse);

            // when
            const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
              sessionId: 1,
              accessCode: 'accessCode',
              userId: 2,
              locale: 'fr',
              ...injectables,
            });

            // then
            expect(error).to.be.an.instanceOf(CandidateNotAuthorizedToResumeCertificationTestError);
          });
        });
      });

      context('when the certification candidate is authorized', function () {
        context('when the user is not connected with the correct account', function () {
          it('should throw a CandidateNotAuthorizedToJoinSessionError xxx', async function () {
            // given
            const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
              id: 1,
              accessCode: 'accessCode',
            });
            sessionRepository.get.withArgs({ id: foundSession.id }).resolves(foundSession);

            const foundCertificationCandidateId = 2;
            domainBuilder.buildCertificationCourse({
              userId: foundCertificationCandidateId,
              sessionId: foundSession.id,
            });

            domainBuilder.buildCertificationCandidate({
              userId: foundCertificationCandidateId,
              sessionId: foundSession.id,
              authorizedToStart: true,
              subscriptions: [domainBuilder.buildCoreSubscription()],
            });

            sharedCertificationCandidateRepository.getBySessionIdAndUserId
              .withArgs({ sessionId: foundSession.id, userId: foundCertificationCandidateId })
              .resolves(null);

            // when
            const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
              sessionId: foundSession.id,
              accessCode: 'accessCode',
              userId: 5,
              locale: 'fr',
              ...injectables,
            });

            // then
            expect(error).to.be.an.instanceOf(UnexpectedUserAccountError);
          });
        });

        context('when a certification course with provided userId and sessionId already exists', function () {
          it('return existing certification course and unauthorize candidate to start', async function () {
            // given
            const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
              id: 1,
              accessCode: 'accessCode',
            });
            sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

            const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
              userId: 2,
              sessionId: 1,
              authorizedToStart: true,
              subscriptions: [domainBuilder.buildCoreSubscription()],
            });
            sharedCertificationCandidateRepository.getBySessionIdAndUserId
              .withArgs({ sessionId: 1, userId: 2 })
              .resolves(foundCertificationCandidate);

            const existingCertificationCourse = domainBuilder.buildCertificationCourse({
              userId: 2,
              sessionId: 1,
            });
            existingCertificationCourse.adjustForAccessibility = sinon.stub();

            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId: 2, sessionId: 1 })
              .resolves(existingCertificationCourse);

            // when
            const result = await retrieveLastOrCreateCertificationCourse({
              sessionId: 1,
              accessCode: 'accessCode',
              userId: 2,
              locale: 'fr',
              ...injectables,
            });

            // then
            expect(existingCertificationCourse.adjustForAccessibility).to.have.been.calledOnceWith(
              foundCertificationCandidate.accessibilityAdjustmentNeeded,
            );
            expect(result).to.deep.equal({
              created: false,
              certificationCourse: existingCertificationCourse,
            });
            expect(sharedCertificationCandidateRepository.update).to.have.been.calledOnceWith(
              domainBuilder.buildCertificationCandidate({
                ...foundCertificationCandidate,
                authorizedToStart: false,
              }),
            );
          });
        });

        context('when no certification course exists for this userId and sessionId', function () {
          context('when a certification course has been created meanwhile', function () {
            it('should return it with flag created marked as false', async function () {
              // given
              const user = domainBuilder.buildUser({ id: 2, lang: FRENCH_SPOKEN });
              userRepository.get.withArgs({ id: user.id }).resolves(user);

              const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                id: 1,
                accessCode: 'accessCode',
              });
              sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);
              const certificationCandidate = domainBuilder.buildCertificationCandidate({
                userId: user.id,
                sessionId: foundSession.id,
                authorizedToStart: true,
                subscriptions: [domainBuilder.buildCoreSubscription()],
                reconciledAt,
              });

              sharedCertificationCandidateRepository.getBySessionIdAndUserId
                .withArgs({ sessionId: foundSession.id, userId: user.id })
                .resolves(certificationCandidate);

              certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                .withArgs({ userId: user.id, sessionId: foundSession.id })
                .onCall(0)
                .resolves(null);

              certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);

              const certificationCourseCreatedMeanwhile = domainBuilder.buildCertificationCourse({
                userId: user.id,
                sessionId: foundSession.id,
              });
              certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                .withArgs({ userId: user.id, sessionId: foundSession.id })
                .onCall(1)
                .resolves(certificationCourseCreatedMeanwhile);

              // when
              const result = await retrieveLastOrCreateCertificationCourse({
                sessionId: foundSession.id,
                accessCode: 'accessCode',
                userId: user.id,
                locale: 'fr',
                ...injectables,
              });

              // then
              expect(result).to.deep.equal({
                created: false,
                certificationCourse: certificationCourseCreatedMeanwhile,
              });
              expect(certificationCourseRepository.save).not.to.have.been.called;
              expect(verifyCertificateCodeService.generateCertificateVerificationCode).not.to.have.been.called;
            });
          });

          context('when a certification still has not been created meanwhile', function () {
            let user;

            beforeEach(function () {
              user = domainBuilder.buildUser({ id: 2, lang: FRENCH_SPOKEN });
              userRepository.get.withArgs({ id: user.id }).resolves(user);
            });

            it('should return it with flag created marked as true with related resources', async function () {
              // given
              const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                id: 1,
                accessCode: 'accessCode',
              });
              sessionRepository.get.withArgs({ id: foundSession.id }).resolves(foundSession);

              const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                userId: user.id,
                sessionId: foundSession.id,
                authorizedToStart: true,
                subscriptions: [domainBuilder.buildCoreSubscription()],
                reconciledAt,
              });
              sharedCertificationCandidateRepository.getBySessionIdAndUserId
                .withArgs({ sessionId: foundSession.id, userId: user.id })
                .resolves(foundCertificationCandidate);

              certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                .withArgs({ userId: user.id, sessionId: foundSession.id })
                .resolves(null);

              const certificationCenter = domainBuilder.buildCertificationCenter({ habilitations: [] });
              certificationCenterRepository.getBySessionId.resolves(certificationCenter);

              certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: user.id }).resolves([]);

              // TODO: extraire jusqu'à la ligne 387 dans une fonction ?
              const certificationCourseToSave = CertificationCourse.from({
                certificationCandidate: foundCertificationCandidate,
                challenges: [],
                verificationCode,
                maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                algorithmEngineVersion: AlgorithmEngineVersion.V3,
                complementaryCertificationCourses: [],
                lang: user.lang,
              });
              const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                certificationCourseToSave.toDTO(),
              );
              certificationCourseRepository.save
                .withArgs({ certificationCourse: certificationCourseToSave })
                .resolves(savedCertificationCourse);

              const assessmentToSave = new Assessment({
                userId: user.id,
                certificationCourseId: savedCertificationCourse.getId(),
                state: Assessment.states.STARTED,
                type: Assessment.types.CERTIFICATION,
                isImproving: false,
                method: Assessment.methods.CERTIFICATION_DETERMINED,
              });
              const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
              assessmentRepository.save.withArgs({ assessment: assessmentToSave }).resolves(savedAssessment);

              // when
              const result = await retrieveLastOrCreateCertificationCourse({
                sessionId: foundSession.id,
                accessCode: 'accessCode',
                userId: user.id,
                locale: 'fr',
                ...injectables,
              });

              // then
              expect(result).to.deep.equal({
                created: true,
                certificationCourse: new CertificationCourse({
                  ...savedCertificationCourse.toDTO(),
                  assessment: savedAssessment,
                }),
              });
            });

            context('when the candidate is enroled in complementary certification only', function () {
              it('should build a v2 algorithm certification with only pix plus challenges', async function () {
                // given
                const user = domainBuilder.buildUser({ id: 2, lang: FRENCH_SPOKEN });
                const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                  accessCode: 'accessCode',
                  version: AlgorithmEngineVersion.V3,
                });

                sessionRepository.get.withArgs({ id: foundSession.id }).resolves(foundSession);

                const candidateComplementarySubscription = domainBuilder.buildComplementarySubscription();
                const complementaryCertification = domainBuilder.buildComplementaryCertification({
                  id: candidateComplementarySubscription.complementaryCertificationId,
                  key: 'PIX_DROIT',
                });

                const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                  userId: user.id,
                  sessionId: foundSession.id,
                  authorizedToStart: true,
                  subscriptions: [candidateComplementarySubscription],
                  complementaryCertification,
                  reconciledAt,
                });

                sharedCertificationCandidateRepository.getBySessionIdAndUserId
                  .withArgs({ sessionId: foundSession.id, userId: user.id })
                  .resolves(foundCertificationCandidate);

                certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                  .withArgs({ userId: user.id, sessionId: foundSession.id })
                  .resolves(null);

                const pixPlusCertificationChallenges = [
                  domainBuilder.buildCertificationChallenge({
                    certifiableBadgeKey: 'PIX_DROIT',
                  }),
                ];
                const complementaryCertificationBadge =
                  domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
                    complementaryCertificationId: complementaryCertification.id,
                    badgeId: 1234,
                  });

                const badgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
                  campaignId: 5678,
                  complementaryCertificationId: complementaryCertification.id,
                  complementaryCertificationKey: complementaryCertificationBadge.key,
                  complementaryCertificationBadgeId: complementaryCertificationBadge.id,
                  complementaryCertificationBadgeImageUrl: complementaryCertificationBadge.imageUrl,
                  complementaryCertificationBadgeLabel: complementaryCertificationBadge.label,
                });

                certificationChallengesService.pickCertificationChallengesForPixPlus.resolves(
                  pixPlusCertificationChallenges,
                );

                const certificationCenter = domainBuilder.buildCertificationCenter({
                  habilitations: [complementaryCertification],
                });

                userRepository.get.withArgs({ id: user.id }).resolves(user);

                certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                certificationBadgesService.findStillValidBadgeAcquisitions
                  .withArgs({ userId: user.id })
                  .resolves([badgeAcquisition]);

                const certificationCourseToSave = CertificationCourse.from({
                  certificationCandidate: foundCertificationCandidate,
                  challenges: pixPlusCertificationChallenges,
                  verificationCode,
                  maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                  algorithmEngineVersion: AlgorithmEngineVersion.V3,
                  complementaryCertificationCourses: [
                    new ComplementaryCertificationCourse({
                      complementaryCertificationBadgeId: complementaryCertificationBadge.id,
                      complementaryCertificationId: complementaryCertification.id,
                      certificationCourseId: undefined,
                      id: undefined,
                    }),
                  ],
                  lang: user.lang,
                });
                const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                  certificationCourseToSave.toDTO(),
                );
                certificationCourseRepository.save.resolves(savedCertificationCourse);

                const assessmentToSave = new Assessment({
                  userId: user.id,
                  certificationCourseId: savedCertificationCourse.getId(),
                  state: Assessment.states.STARTED,
                  type: Assessment.types.CERTIFICATION,
                  isImproving: false,
                  method: Assessment.methods.CERTIFICATION_DETERMINED,
                });
                const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                assessmentRepository.save.withArgs({ assessment: assessmentToSave }).resolves(savedAssessment);

                // when
                const result = await retrieveLastOrCreateCertificationCourse({
                  sessionId: foundSession.id,
                  accessCode: 'accessCode',
                  userId: user.id,
                  locale: user.lang,
                  ...injectables,
                });

                // then
                expect(certificationCourseRepository.save).to.have.been.calledOnceWithExactly({
                  certificationCourse: certificationCourseToSave,
                });

                expect(certificationChallengesService.pickCertificationChallenges).to.not.have.been.called;
                expect(result).to.deep.equal({
                  created: true,
                  certificationCourse: new CertificationCourse({
                    ...savedCertificationCourse.toDTO(),
                    assessment: savedAssessment,
                    challenges: pixPlusCertificationChallenges,
                  }),
                });
              });
            });

            context('when the user language is not available in certification', function () {
              it('should not create a certification', async function () {
                // given
                const userId = 2;

                const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                  id: 1,
                  accessCode: 'accessCode',
                  version: 3,
                });
                sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                  userId,
                  sessionId: 1,
                  authorizedToStart: true,
                  subscriptions: [domainBuilder.buildCoreSubscription()],
                });
                sharedCertificationCandidateRepository.getBySessionIdAndUserId
                  .withArgs({ sessionId: 1, userId })
                  .resolves(foundCertificationCandidate);

                certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                  .withArgs({ userId, sessionId: 1 })
                  .resolves(null);

                const certificationCenter = domainBuilder.buildCertificationCenter({
                  habilitations: [],
                });
                certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                const user = domainBuilder.buildUser({ id: userId, lang: 'nl' });
                userRepository.get.withArgs({ id: userId }).resolves(user);

                // when
                const error = await catchErr(await retrieveLastOrCreateCertificationCourse)({
                  sessionId: 1,
                  accessCode: 'accessCode',
                  userId,
                  locale: 'nl',
                  ...injectables,
                });

                // then
                expect(certificationCourseRepository.save).not.to.have.been.called;
                expect(error).to.be.instanceOf(LanguageNotSupportedError);
              });
            });

            context('when the user language is available in certification', function () {
              it('should create a certification', async function () {
                // given
                const userId = 2;

                const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                  id: 1,
                  accessCode: 'accessCode',
                  version: 3,
                });
                sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                  userId,
                  sessionId: 1,
                  authorizedToStart: true,
                  subscriptions: [domainBuilder.buildCoreSubscription()],
                  reconciledAt,
                  accessibilityAdjustmentNeeded: true,
                });
                sharedCertificationCandidateRepository.getBySessionIdAndUserId
                  .withArgs({ sessionId: 1, userId })
                  .resolves(foundCertificationCandidate);

                certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                  .withArgs({ userId, sessionId: 1 })
                  .resolves(null);

                const certificationCenter = domainBuilder.buildCertificationCenter({
                  habilitations: [],
                });
                certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId }).resolves([]);

                const user = domainBuilder.buildUser({ id: userId });
                userRepository.get.withArgs({ id: userId }).resolves(user);

                const certificationCourseToSave = CertificationCourse.from({
                  certificationCandidate: foundCertificationCandidate,
                  challenges: [],
                  verificationCode,
                  maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                  algorithmEngineVersion: AlgorithmEngineVersion.V3,
                  lang: user.lang,
                  isAdjustedForAccessibility: foundCertificationCandidate.accessibilityAdjustmentNeeded,
                });

                const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                  certificationCourseToSave.toDTO(),
                );

                certificationCourseRepository.save
                  .withArgs({ certificationCourse: certificationCourseToSave })
                  .resolves(savedCertificationCourse);

                const assessmentToSave = new Assessment({
                  userId: 2,
                  certificationCourseId: savedCertificationCourse.getId(),
                  state: Assessment.states.STARTED,
                  type: Assessment.types.CERTIFICATION,
                  isImproving: false,
                  method: Assessment.methods.CERTIFICATION_DETERMINED,
                });

                const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                assessmentRepository.save.withArgs({ assessment: assessmentToSave }).resolves(savedAssessment);

                // when
                const { created, certificationCourse } = await retrieveLastOrCreateCertificationCourse({
                  sessionId: 1,
                  accessCode: 'accessCode',
                  userId,
                  locale: 'fr',
                  ...injectables,
                });

                // then
                expect(created).to.be.true;
                expect(certificationCourse).to.deepEqualInstance(
                  new CertificationCourse({
                    ...savedCertificationCourse.toDTO(),
                    assessment: savedAssessment,
                    challenges: [],
                    version: 3,
                    lang: user.lang,
                    isAdjustedForAccessibility: true,
                  }),
                );
              });
            });

            context('#when the user is eligible to one complementary certification', function () {
              let user;

              beforeEach(function () {
                user = domainBuilder.buildUser({ id: 2, lang: FRENCH_SPOKEN });
                userRepository.get.withArgs({ id: user.id }).resolves(user);
              });

              context('when certification center is habilitated', function () {
                context('when user has a subscription', function () {
                  it('should save complementary certification info', async function () {
                    // given
                    const complementaryCertification = domainBuilder.buildComplementaryCertification({
                      key: 'PIX+TEST',
                    });
                    const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
                      badgeKey: 'PIX_PLUS_TEST_1',
                      complementaryCertificationId: complementaryCertification.id,
                      complementaryCertificationKey: complementaryCertification.key,
                      complementaryCertificationBadgeId: 100,
                    });

                    const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                      id: 1,
                      accessCode: 'accessCode',
                    });
                    sessionRepository.get.withArgs({ id: foundSession.id }).resolves(foundSession);

                    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                      .withArgs({ userId: user.id, sessionId: foundSession.id })
                      .resolves(null);

                    const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                      userId: user.id,
                      sessionId: foundSession.id,
                      authorizedToStart: true,
                      subscriptions: [domainBuilder.buildCoreSubscription()],
                      complementaryCertification,
                      reconciledAt,
                    });

                    sharedCertificationCandidateRepository.getBySessionIdAndUserId
                      .withArgs({ sessionId: foundSession.id, userId: user.id })
                      .resolves(foundCertificationCandidate);

                    const certificationCenter = domainBuilder.buildCertificationCenter({
                      habilitations: [complementaryCertification],
                    });
                    certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                    const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
                    const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                    const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });

                    certificationBadgesService.findStillValidBadgeAcquisitions
                      .withArgs({ userId: user.id })
                      .resolves([certifiableBadgeAcquisition]);

                    certificationChallengesService.pickCertificationChallengesForPixPlus
                      .withArgs(certifiableBadgeAcquisition.campaignId, certifiableBadgeAcquisition.badgeKey, 2)
                      .resolves([challengePlus1, challengePlus2, challengePlus3]);

                    const complementaryCertificationCourse = new ComplementaryCertificationCourse({
                      complementaryCertificationId: complementaryCertification.id,
                      complementaryCertificationBadgeId: 100,
                    });

                    const certificationCourseToSave = CertificationCourse.from({
                      certificationCandidate: foundCertificationCandidate,
                      challenges: [challengePlus1, challengePlus2, challengePlus3],
                      verificationCode,
                      maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                      complementaryCertificationCourses: [complementaryCertificationCourse],
                      algorithmEngineVersion: AlgorithmEngineVersion.V3,
                      lang: user.lang,
                    });

                    const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                      certificationCourseToSave.toDTO(),
                    );
                    savedCertificationCourse._complementaryCertificationCourses = [
                      {
                        ...complementaryCertificationCourse,
                        id: 99,
                        certificationCourseId: savedCertificationCourse.getId(),
                        complementaryCertificationBadgeId: 100,
                      },
                    ];
                    certificationCourseRepository.save
                      .withArgs({ certificationCourse: certificationCourseToSave })
                      .resolves(savedCertificationCourse);

                    const assessmentToSave = new Assessment({
                      userId: user.id,
                      certificationCourseId: savedCertificationCourse.getId(),
                      state: Assessment.states.STARTED,
                      type: Assessment.types.CERTIFICATION,
                      isImproving: false,
                      method: Assessment.methods.CERTIFICATION_DETERMINED,
                    });
                    const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                    assessmentRepository.save.withArgs({ assessment: assessmentToSave }).resolves(savedAssessment);

                    // when
                    const result = await retrieveLastOrCreateCertificationCourse({
                      sessionId: foundSession.id,
                      accessCode: 'accessCode',
                      userId: user.id,
                      locale: 'fr',
                      ...injectables,
                    });

                    // then
                    expect(result.certificationCourse._complementaryCertificationCourses).to.deep.equal([
                      {
                        id: 99,
                        certificationCourseId: savedCertificationCourse.getId(),
                        complementaryCertificationId: complementaryCertification.id,
                        complementaryCertificationBadgeId: 100,
                      },
                    ]);
                  });

                  it('should save all the challenges from both pix and complementary referential', async function () {
                    // given
                    const complementaryCertification = domainBuilder.buildComplementaryCertification({
                      key: 'PIX+TEST',
                    });
                    const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
                      badgeKey: 'PIX_PLUS_TEST_1',
                      complementaryCertificationId: complementaryCertification.id,
                      complementaryCertificationKey: complementaryCertification.key,
                      complementaryCertificationBadgeId: 100,
                    });

                    const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                      id: 1,
                      accessCode: 'accessCode',
                    });
                    sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                      .withArgs({ userId: user.id, sessionId: 1 })
                      .resolves(null);

                    const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                      userId: user.id,
                      sessionId: 1,
                      authorizedToStart: true,
                      subscriptions: [domainBuilder.buildCoreSubscription()],
                      complementaryCertification,
                      reconciledAt,
                    });

                    sharedCertificationCandidateRepository.getBySessionIdAndUserId
                      .withArgs({ sessionId: 1, userId: user.id })
                      .resolves(foundCertificationCandidate);

                    const certificationCenter = domainBuilder.buildCertificationCenter({
                      habilitations: [complementaryCertification],
                    });
                    certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                    const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
                    const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                    const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });

                    certificationBadgesService.findStillValidBadgeAcquisitions
                      .withArgs({ userId: user.id })
                      .resolves([certifiableBadgeAcquisition]);

                    certificationChallengesService.pickCertificationChallengesForPixPlus
                      .withArgs(certifiableBadgeAcquisition.campaignId, certifiableBadgeAcquisition.badgeKey, 2)
                      .resolves([challengePlus1, challengePlus2, challengePlus3]);

                    const complementaryCertificationCourse = new ComplementaryCertificationCourse({
                      complementaryCertificationId: complementaryCertification.id,
                      complementaryCertificationBadgeId: 100,
                    });

                    const certificationCourseToSave = CertificationCourse.from({
                      certificationCandidate: foundCertificationCandidate,
                      challenges: [challengePlus1, challengePlus2, challengePlus3],
                      verificationCode,
                      maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                      complementaryCertificationCourses: [complementaryCertificationCourse],
                      algorithmEngineVersion: AlgorithmEngineVersion.V3,
                      lang: user.lang,
                    });

                    const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                      certificationCourseToSave.toDTO(),
                    );
                    savedCertificationCourse._complementaryCertificationCourses = [
                      {
                        ...complementaryCertificationCourse,
                        certificationCourseId: savedCertificationCourse.getId(),
                        complementaryCertificationBadgeId: 100,
                      },
                    ];
                    certificationCourseRepository.save
                      .withArgs({ certificationCourse: certificationCourseToSave })
                      .resolves(savedCertificationCourse);

                    const assessmentToSave = new Assessment({
                      userId: user.id,
                      certificationCourseId: savedCertificationCourse.getId(),
                      state: Assessment.states.STARTED,
                      type: Assessment.types.CERTIFICATION,
                      isImproving: false,
                      method: Assessment.methods.CERTIFICATION_DETERMINED,
                    });
                    const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                    assessmentRepository.save.withArgs({ assessment: assessmentToSave }).resolves(savedAssessment);

                    // when
                    const result = await retrieveLastOrCreateCertificationCourse({
                      sessionId: 1,
                      accessCode: 'accessCode',
                      userId: user.id,
                      locale: 'fr',
                      ...injectables,
                    });

                    // then
                    expect(result.certificationCourse._challenges).to.deep.equal([
                      challengePlus1,
                      challengePlus2,
                      challengePlus3,
                    ]);
                  });

                  context('when user has no certifiable badges', function () {
                    it('should not save challenges from complementary referential', async function () {
                      // given
                      const complementaryCertification = domainBuilder.buildComplementaryCertification({
                        key: 'PIX+TEST',
                      });

                      const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                        id: 1,
                        accessCode: 'accessCode',
                      });
                      sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                      certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                        .withArgs({ userId: 2, sessionId: 1 })
                        .resolves(null);

                      const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                        userId: 2,
                        sessionId: 1,
                        authorizedToStart: true,
                        subscriptions: [domainBuilder.buildCoreSubscription()],
                        complementaryCertification,
                        reconciledAt,
                      });

                      sharedCertificationCandidateRepository.getBySessionIdAndUserId
                        .withArgs({ sessionId: 1, userId: 2 })
                        .resolves(foundCertificationCandidate);

                      const certificationCenter = domainBuilder.buildCertificationCenter({
                        habilitations: [complementaryCertification],
                      });
                      certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                      certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 2 }).resolves([]);

                      const certificationCourseToSave = CertificationCourse.from({
                        certificationCandidate: foundCertificationCandidate,
                        challenges: [],
                        verificationCode,
                        maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                        algorithmEngineVersion: AlgorithmEngineVersion.V3,
                        lang: user.lang,
                      });

                      const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                        certificationCourseToSave.toDTO(),
                      );
                      certificationCourseRepository.save
                        .withArgs({ certificationCourse: certificationCourseToSave })
                        .resolves(savedCertificationCourse);

                      const assessmentToSave = new Assessment({
                        userId: 2,
                        certificationCourseId: savedCertificationCourse.getId(),
                        state: Assessment.states.STARTED,
                        type: Assessment.types.CERTIFICATION,
                        isImproving: false,
                        method: Assessment.methods.CERTIFICATION_DETERMINED,
                      });
                      const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                      assessmentRepository.save.withArgs({ assessment: assessmentToSave }).resolves(savedAssessment);

                      // when
                      const result = await retrieveLastOrCreateCertificationCourse({
                        sessionId: 1,
                        accessCode: 'accessCode',
                        userId: 2,
                        locale: 'fr',
                        ...injectables,
                      });

                      // then
                      expect(result).to.deep.equal({
                        created: true,
                        certificationCourse: new CertificationCourse({
                          ...savedCertificationCourse.toDTO(),
                          assessment: savedAssessment,
                          challenges: [],
                        }),
                      });
                    });
                  });

                  context('when the complementary certification has no specific referential', function () {
                    it('should save all the challenges from pix referential only', async function () {
                      // given
                      const complementaryCertification = domainBuilder.buildComplementaryCertification({
                        key: 'PIX+TEST',
                      });
                      const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
                        badgeKey: 'PIX_PLUS_TEST_1',
                        complementaryCertificationId: complementaryCertification.id,
                        complementaryCertificationKey: complementaryCertification.key,
                        complementaryCertificationBadgeId: 100,
                      });

                      const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                        id: 1,
                        accessCode: 'accessCode',
                      });
                      sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                      certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                        .withArgs({ userId: 2, sessionId: 1 })
                        .resolves(null);

                      const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                        userId: 2,
                        sessionId: 1,
                        authorizedToStart: true,
                        subscriptions: [domainBuilder.buildCoreSubscription()],
                        complementaryCertification,
                      });

                      sharedCertificationCandidateRepository.getBySessionIdAndUserId
                        .withArgs({ sessionId: 1, userId: 2 })
                        .resolves(foundCertificationCandidate);

                      const certificationCenter = domainBuilder.buildCertificationCenter({
                        habilitations: [complementaryCertification],
                      });
                      certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                      certificationBadgesService.findStillValidBadgeAcquisitions
                        .withArgs({ userId: 2 })
                        .resolves([certifiableBadgeAcquisition]);

                      certificationChallengesService.pickCertificationChallengesForPixPlus
                        .withArgs(certifiableBadgeAcquisition.campaignId, certifiableBadgeAcquisition.badgeKey, 2)
                        .resolves([]);

                      const complementaryCertificationCourse = new ComplementaryCertificationCourse({
                        complementaryCertificationId: complementaryCertification.id,
                        complementaryCertificationBadgeId: 100,
                      });

                      const certificationCourseToSave = CertificationCourse.from({
                        certificationCandidate: foundCertificationCandidate,
                        challenges: [],
                        verificationCode,
                        maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                        complementaryCertificationCourses: [complementaryCertificationCourse],
                        algorithmEngineVersion: AlgorithmEngineVersion.V3,
                        lang: user.lang,
                      });

                      const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                        certificationCourseToSave.toDTO(),
                      );
                      savedCertificationCourse._complementaryCertificationCourses = [
                        {
                          ...complementaryCertificationCourse,
                          certificationCourseId: savedCertificationCourse.getId(),
                          complementaryCertificationBadgeId: 100,
                        },
                      ];
                      certificationCourseRepository.save
                        .withArgs({ certificationCourse: certificationCourseToSave })
                        .resolves(savedCertificationCourse);

                      const assessmentToSave = new Assessment({
                        userId: 2,
                        certificationCourseId: savedCertificationCourse.getId(),
                        state: Assessment.states.STARTED,
                        type: Assessment.types.CERTIFICATION,
                        isImproving: false,
                        method: Assessment.methods.CERTIFICATION_DETERMINED,
                      });
                      const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                      assessmentRepository.save.withArgs({ assessment: assessmentToSave }).resolves(savedAssessment);

                      // when
                      const result = await retrieveLastOrCreateCertificationCourse({
                        sessionId: 1,
                        accessCode: 'accessCode',
                        userId: 2,
                        locale: 'fr',
                        ...injectables,
                      });

                      // then
                      expect(result.certificationCourse._challenges).to.deep.equal([]);
                    });
                  });
                });

                context('when user does not have a subscription', function () {
                  it('should not save complementary certification info', async function () {
                    // given
                    const complementaryCertification = domainBuilder.buildComplementaryCertification({
                      key: 'PIX+TEST',
                      label: 'PIX+TEST',
                    });

                    const badge = domainBuilder.buildBadge({ isCertifiable: true });

                    const badgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationId: complementaryCertification.id,
                      complementaryCertificationKey: complementaryCertification.key,
                      complementaryCertificationBadgeId: 3456789,
                      badgeId: badge.id,
                      badgeKey: badge.key,
                    });

                    const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                      id: 1,
                      accessCode: 'accessCode',
                    });
                    sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                      .withArgs({ userId: 2, sessionId: 1 })
                      .resolves(null);

                    const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                      userId: 2,
                      authorizedToStart: true,
                      sessionId: 1,
                      subscriptions: [domainBuilder.buildCoreSubscription()],
                      complementaryCertification: null,
                      reconciledAt,
                    });

                    sharedCertificationCandidateRepository.getBySessionIdAndUserId
                      .withArgs({ sessionId: 1, userId: 2 })
                      .resolves(foundCertificationCandidate);

                    const certificationCenter = domainBuilder.buildCertificationCenter({
                      habilitations: [complementaryCertification],
                    });
                    certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                    certificationBadgesService.findStillValidBadgeAcquisitions
                      .withArgs({ userId: 2 })
                      .resolves([badgeAcquisition]);

                    const certificationCourseToSave = CertificationCourse.from({
                      certificationCandidate: foundCertificationCandidate,
                      challenges: [],
                      verificationCode,
                      maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                      complementaryCertificationCourses: [],
                      algorithmEngineVersion: AlgorithmEngineVersion.V3,
                      lang: user.lang,
                    });

                    const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                      certificationCourseToSave.toDTO(),
                    );
                    certificationCourseRepository.save
                      .withArgs({ certificationCourse: certificationCourseToSave })
                      .resolves(savedCertificationCourse);

                    const assessmentToSave = new Assessment({
                      userId: 2,
                      certificationCourseId: savedCertificationCourse.getId(),
                      state: Assessment.states.STARTED,
                      type: Assessment.types.CERTIFICATION,
                      isImproving: false,
                      method: Assessment.methods.CERTIFICATION_DETERMINED,
                    });
                    const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                    assessmentRepository.save.withArgs({ assessment: assessmentToSave }).resolves(savedAssessment);

                    // when
                    const result = await retrieveLastOrCreateCertificationCourse({
                      sessionId: 1,
                      accessCode: 'accessCode',
                      userId: 2,
                      locale: 'fr',
                      ...injectables,
                    });

                    // then
                    expect(result.certificationCourse._complementaryCertificationCourses).to.be.empty;
                    expect(certificationChallengesService.pickCertificationChallengesForPixPlus).not.to.have.been
                      .called;
                  });
                });
              });

              context('when certification center is not habilitated anymore', function () {
                it('should not save challenges from complementary referential', async function () {
                  // given
                  const complementaryCertification = domainBuilder.buildComplementaryCertification({
                    key: 'PIX+TEST',
                  });
                  const badgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
                    complementaryCertification,
                    userid: 2,
                    badge: domainBuilder.buildBadge({ isCertifiable: true }),
                  });

                  const foundSession = domainBuilder.certification.sessionManagement.buildSession.created({
                    id: 1,
                    accessCode: 'accessCode',
                  });
                  sessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                  certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                    .withArgs({ userId: 2, sessionId: 1 })
                    .resolves(null);

                  const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                    userId: 2,
                    sessionId: 1,
                    authorizedToStart: true,
                    subscriptions: [domainBuilder.buildCoreSubscription()],
                    complementaryCertification,
                    reconciledAt,
                  });

                  sharedCertificationCandidateRepository.getBySessionIdAndUserId
                    .withArgs({ sessionId: 1, userId: 2 })
                    .resolves(foundCertificationCandidate);

                  const certificationCenter = domainBuilder.buildCertificationCenter({
                    habilitations: [],
                  });
                  certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                  certificationBadgesService.findStillValidBadgeAcquisitions
                    .withArgs({ userId: 2 })
                    .resolves([badgeAcquisition]);

                  const certificationCourseToSave = CertificationCourse.from({
                    certificationCandidate: foundCertificationCandidate,
                    challenges: [],
                    verificationCode,
                    maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                    algorithmEngineVersion: AlgorithmEngineVersion.V3,
                    lang: user.lang,
                  });

                  const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                    certificationCourseToSave.toDTO(),
                  );
                  certificationCourseRepository.save
                    .withArgs({ certificationCourse: certificationCourseToSave })
                    .resolves(savedCertificationCourse);

                  const assessmentToSave = new Assessment({
                    userId: 2,
                    certificationCourseId: savedCertificationCourse.getId(),
                    state: Assessment.states.STARTED,
                    type: Assessment.types.CERTIFICATION,
                    isImproving: false,
                    method: Assessment.methods.CERTIFICATION_DETERMINED,
                  });
                  const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                  assessmentRepository.save.withArgs({ assessment: assessmentToSave }).resolves(savedAssessment);

                  // when
                  const result = await retrieveLastOrCreateCertificationCourse({
                    sessionId: 1,
                    accessCode: 'accessCode',
                    userId: 2,
                    locale: 'fr',
                    ...injectables,
                  });

                  // then
                  expect(result.certificationCourse._challenges).to.deep.equal([]);
                  expect(certificationChallengesService.pickCertificationChallengesForPixPlus).not.to.have.been.called;
                });
              });
            });
          });
        });
      });
    });
  });
});
