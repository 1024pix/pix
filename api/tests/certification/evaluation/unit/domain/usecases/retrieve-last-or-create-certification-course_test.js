import sinon from 'sinon';

import { retrieveLastOrCreateCertificationCourse } from '../../../../../../src/certification/evaluation/domain/usecases/retrieve-last-or-create-certification-course.js';
import { SessionNotAccessible } from '../../../../../../src/certification/session-management/domain/errors.js';
import { ComplementaryCertificationCourse } from '../../../../../../src/certification/session-management/domain/models/ComplementaryCertificationCourse.js';
import { CenterHabilitationError } from '../../../../../../src/certification/shared/domain/errors.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  LanguageNotSupportedError,
  NotFoundError,
  UnexpectedUserAccountError,
} from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | retrieve-last-or-create-certification-course', function () {
  let clock;
  let reconciledAt;
  let verificationCode;

  const evaluationSessionRepository = {};
  const assessmentRepository = {};
  const competenceRepository = {};
  const sharedCertificationCandidateRepository = {};
  const certificationCourseRepository = {};
  const certificationCenterRepository = {};
  const certificationBadgesService = {};
  const placementProfileService = {};
  const verifyCertificateCodeService = {};
  const userRepository = {};
  const versionApi = {};

  const injectables = {
    assessmentRepository,
    competenceRepository,
    sharedCertificationCandidateRepository,
    certificationCourseRepository,
    evaluationSessionRepository,
    certificationCenterRepository,
    certificationBadgesService,
    placementProfileService,
    verifyCertificateCodeService,
    userRepository,
    versionApi,
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
    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId = sinon.stub();
    certificationCourseRepository.save = sinon.stub();
    evaluationSessionRepository.get = sinon.stub();
    userRepository.get = sinon.stub();
    placementProfileService.getPlacementProfile = sinon.stub();
    verifyCertificateCodeService.generateCertificateVerificationCode = sinon.stub().resolves(verificationCode);
    certificationCenterRepository.getBySessionId = sinon.stub();
    versionApi.getByFrameworkAndDate = sinon.stub();
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
      const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
        accessCode: 'differentAccessCode',
      });
      evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

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
        const foundSession = domainBuilder.certification.evaluation.buildResultsSession.finalized({
          id: 1,
          accessCode: 'accessCode',
        });
        evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

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
            const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
              id: 1,
              accessCode: 'accessCode',
            });
            evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

            const candidateNotAuthorizedToStart = domainBuilder.buildCertificationCandidate({
              userId: 2,
              sessionId: 1,
              authorizedToStart: false,
              subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
            });
            sharedCertificationCandidateRepository.getBySessionIdAndUserId
              .withArgs({ sessionId: 1, userId: 2 })
              .resolves(candidateNotAuthorizedToStart);

            const version = domainBuilder.certification.configuration.buildVersion();
            versionApi.getByFrameworkAndDate.resolves(version);

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
            const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
              id: 1,
              accessCode: 'accessCode',
            });
            evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

            const candidateNotAuthorizedToStart = domainBuilder.buildCertificationCandidate({
              userId: 2,
              sessionId: 1,
              authorizedToStart: false,
              subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
            });
            sharedCertificationCandidateRepository.getBySessionIdAndUserId
              .withArgs({ sessionId: 1, userId: 2 })
              .resolves(candidateNotAuthorizedToStart);

            const existingCertificationCourse = domainBuilder.buildCertificationCourse({ userId: 2, sessionId: 1 });
            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId: 2, sessionId: 1 })
              .resolves(existingCertificationCourse);

            const version = domainBuilder.certification.configuration.buildVersion();
            versionApi.getByFrameworkAndDate.resolves(version);

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
            const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
              id: 1,
              accessCode: 'accessCode',
            });
            evaluationSessionRepository.get.withArgs({ id: foundSession.id }).resolves(foundSession);

            const foundCertificationCandidateId = 2;
            domainBuilder.buildCertificationCourse({
              userId: foundCertificationCandidateId,
              sessionId: foundSession.id,
            });

            domainBuilder.buildCertificationCandidate({
              userId: foundCertificationCandidateId,
              sessionId: foundSession.id,
              authorizedToStart: true,
              subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
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
            const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
              id: 1,
              accessCode: 'accessCode',
            });
            evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

            const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
              userId: 2,
              sessionId: 1,
              authorizedToStart: true,
              subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
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

            const version = domainBuilder.certification.configuration.buildVersion({
              challengesConfiguration: { maximumAssessmentLength: 25, defaultCandidateCapacity: -3 },
            });
            versionApi.getByFrameworkAndDate.resolves(version);

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

          it('should set numberOfChallenges when existing certification course is V3', async function () {
            // given
            const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
              id: 1,
              accessCode: 'accessCode',
            });
            evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

            const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
              userId: 2,
              sessionId: 1,
              authorizedToStart: true,
              subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
              reconciledAt,
            });
            sharedCertificationCandidateRepository.getBySessionIdAndUserId
              .withArgs({ sessionId: 1, userId: 2 })
              .resolves(foundCertificationCandidate);

            const existingCertificationCourse = domainBuilder.buildCertificationCourse({
              userId: 2,
              sessionId: 1,
              version: AlgorithmEngineVersion.V3,
            });
            existingCertificationCourse.adjustForAccessibility = sinon.stub();

            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId: 2, sessionId: 1 })
              .resolves(existingCertificationCourse);

            const version = domainBuilder.certification.configuration.buildVersion({
              challengesConfiguration: { maximumAssessmentLength: 25, defaultCandidateCapacity: -3 },
            });
            versionApi.getByFrameworkAndDate.resolves(version);

            // when
            const result = await retrieveLastOrCreateCertificationCourse({
              sessionId: 1,
              accessCode: 'accessCode',
              userId: 2,
              locale: 'fr',
              ...injectables,
            });

            // then
            expect(result.certificationCourse._numberOfChallenges).to.equal(25);
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

              const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
                id: 1,
                accessCode: 'accessCode',
              });
              evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);
              const certificationCandidate = domainBuilder.buildCertificationCandidate({
                userId: user.id,
                sessionId: foundSession.id,
                authorizedToStart: true,
                subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
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

              const version = domainBuilder.certification.configuration.buildVersion();
              versionApi.getByFrameworkAndDate.resolves(version);

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
            let version;

            beforeEach(function () {
              user = domainBuilder.buildUser({ id: 2, lang: FRENCH_SPOKEN });
              userRepository.get.withArgs({ id: user.id }).resolves(user);

              version = domainBuilder.certification.configuration.buildVersion({
                challengesConfiguration: { maximumAssessmentLength: 32, defaultCandidateCapacity: -3 },
              });
              versionApi.getByFrameworkAndDate.resolves(version);
            });

            it('should return it with flag created marked as true with related resources', async function () {
              // given
              const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
                id: 1,
                accessCode: 'accessCode',
              });
              evaluationSessionRepository.get.withArgs({ id: foundSession.id }).resolves(foundSession);
              const certificationVersion = domainBuilder.certification.configuration.buildVersion();

              const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                userId: user.id,
                sessionId: foundSession.id,
                authorizedToStart: true,
                subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
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
                certificationVersion,
                verificationCode,
                algorithmEngineVersion: AlgorithmEngineVersion.V3,
                complementaryCertificationCourses: [],
                lang: user.lang,
                framework: Frameworks.CORE,
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
                  numberOfChallenges: 32,
                }),
              });
            });

            context('when the user language is not available in certification', function () {
              it('should not create a certification', async function () {
                // given
                const userId = 2;

                const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
                  id: 1,
                  accessCode: 'accessCode',
                  version: 3,
                });
                evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                  userId,
                  sessionId: 1,
                  authorizedToStart: true,
                  subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
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

                const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
                  id: 1,
                  accessCode: 'accessCode',
                  version: 3,
                });
                evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);
                const certificationVersion = domainBuilder.certification.configuration.buildVersion();

                const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                  userId,
                  sessionId: 1,
                  authorizedToStart: true,
                  subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
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
                  certificationVersion,
                  verificationCode,
                  algorithmEngineVersion: AlgorithmEngineVersion.V3,
                  lang: user.lang,
                  isAdjustedForAccessibility: foundCertificationCandidate.accessibilityAdjustmentNeeded,
                  framework: Frameworks.CORE,
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
                    version: 3,
                    lang: user.lang,
                    isAdjustedForAccessibility: true,
                    numberOfChallenges: 32,
                  }),
                );
              });
            });

            context('when user is enrolled to core certification', function () {
              it('should not save complementary certification info', async function () {
                // given
                const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
                  id: 1,
                  accessCode: 'accessCode',
                });
                evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);
                const certificationVersion = domainBuilder.certification.configuration.buildVersion();

                const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                  userId: 2,
                  authorizedToStart: true,
                  sessionId: 1,
                  subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
                  complementaryCertification: null,
                  reconciledAt,
                });

                sharedCertificationCandidateRepository.getBySessionIdAndUserId
                  .withArgs({ sessionId: 1, userId: 2 })
                  .resolves(foundCertificationCandidate);

                certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                  .withArgs({ userId: 2, sessionId: 1 })
                  .resolves(null);

                const certificationCenter = domainBuilder.buildCertificationCenter();
                certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                const certificationCourseToSave = CertificationCourse.from({
                  certificationCandidate: foundCertificationCandidate,
                  certificationVersion,
                  verificationCode,
                  complementaryCertificationCourses: [],
                  algorithmEngineVersion: AlgorithmEngineVersion.V3,
                  lang: user.lang,
                  framework: Frameworks.CORE,
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
                expect(result.certificationCourse._complementaryCertificationCourse).to.be.null;
              });
            });

            context('when user is enrolled to a complementary certification', function () {
              let user;

              beforeEach(function () {
                user = domainBuilder.buildUser({ id: 2, lang: FRENCH_SPOKEN });
                userRepository.get.withArgs({ id: user.id }).resolves(user);
              });

              context('when certification center is habilitated', function () {
                it('should save complementary certification info', async function () {
                  // given
                  const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification(
                    {
                      key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
                    },
                  );
                  const certificationVersion = domainBuilder.certification.configuration.buildVersion();

                  const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
                    id: 1,
                    accessCode: 'accessCode',
                  });
                  evaluationSessionRepository.get.withArgs({ id: foundSession.id }).resolves(foundSession);

                  certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                    .withArgs({ userId: user.id, sessionId: foundSession.id })
                    .resolves(null);

                  const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                    userId: user.id,
                    sessionId: foundSession.id,
                    authorizedToStart: true,
                    subscriptions: [
                      domainBuilder.certification.enrolment.buildComplementarySubscription({
                        certificationCandidateId: 123,
                        complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
                      }),
                    ],
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

                  const complementaryCertificationCourse = new ComplementaryCertificationCourse({
                    complementaryCertificationId: complementaryCertification.id,
                    complementaryCertificationBadgeId: null,
                  });

                  const certificationCourseToSave = CertificationCourse.from({
                    certificationCandidate: foundCertificationCandidate,
                    certificationVersion,
                    verificationCode,
                    complementaryCertificationCourse,
                    algorithmEngineVersion: AlgorithmEngineVersion.V3,
                    lang: user.lang,
                    framework: Frameworks.DROIT,
                  });

                  const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                    certificationCourseToSave.toDTO(),
                  );
                  savedCertificationCourse._complementaryCertificationCourse = {
                    ...complementaryCertificationCourse,
                    id: 99,
                    certificationCourseId: savedCertificationCourse.getId(),
                    complementaryCertificationBadgeId: null,
                  };
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
                  expect(result.certificationCourse._complementaryCertificationCourse).to.deep.equal({
                    id: 99,
                    certificationCourseId: savedCertificationCourse.getId(),
                    complementaryCertificationId: complementaryCertification.id,
                    complementaryCertificationBadgeId: null,
                  });
                });
              });

              context('when certification center is not habilitated anymore', function () {
                it('should throw an CenterHabilitationError error', async function () {
                  // given
                  const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification(
                    {
                      key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
                    },
                  );

                  const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
                    id: 1,
                    accessCode: 'accessCode',
                  });
                  evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                  const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                    userId: 2,
                    sessionId: 1,
                    authorizedToStart: true,
                    subscriptions: [
                      domainBuilder.certification.enrolment.buildComplementarySubscription({
                        certificationCandidateId: 123,
                        complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
                      }),
                    ],
                    complementaryCertification,
                    reconciledAt,
                  });

                  sharedCertificationCandidateRepository.getBySessionIdAndUserId
                    .withArgs({ sessionId: 1, userId: 2 })
                    .resolves(foundCertificationCandidate);

                  certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                    .withArgs({ userId: 2, sessionId: 1 })
                    .resolves(null);

                  const certificationCenter = domainBuilder.buildCertificationCenter({
                    habilitations: [],
                  });
                  certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                  // when
                  const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
                    sessionId: 1,
                    accessCode: 'accessCode',
                    userId: 2,
                    locale: 'fr',
                    ...injectables,
                  });

                  // then
                  expect(error).to.be.instanceOf(CenterHabilitationError);
                });
              });
            });

            // clea ;)
            context('when user is enrolled to a double certification', function () {
              let user;

              beforeEach(function () {
                user = domainBuilder.buildUser({ id: 2, lang: FRENCH_SPOKEN });
                userRepository.get.withArgs({ id: user.id }).resolves(user);
              });

              context('when certification center is habilitated', function () {
                context('when user has acquired corresponding badge', function () {
                  it('should save complementary certification info', async function () {
                    // given
                    const cleaCertification = domainBuilder.certification.shared.buildComplementaryCertification({
                      key: ComplementaryCertificationKeys.CLEA,
                    });
                    const certificationVersion = domainBuilder.certification.configuration.buildVersion();

                    const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
                      badgeKey: 'CLEA_BADGE_1',
                      complementaryCertificationBadgeId: 100,
                      complementaryCertificationId: cleaCertification.id,
                      complementaryCertificationKey: cleaCertification.key,
                    });

                    const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
                      id: 1,
                      accessCode: 'accessCode',
                    });
                    evaluationSessionRepository.get.withArgs({ id: foundSession.id }).resolves(foundSession);

                    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                      .withArgs({ userId: user.id, sessionId: foundSession.id })
                      .resolves(null);

                    const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                      userId: user.id,
                      sessionId: foundSession.id,
                      authorizedToStart: true,
                      subscriptions: [
                        domainBuilder.certification.enrolment.buildCoreSubscription(),
                        domainBuilder.certification.enrolment.buildComplementarySubscription({
                          complementaryCertificationKey: cleaCertification.key,
                        }),
                      ],
                      complementaryCertification: cleaCertification,
                      reconciledAt,
                    });

                    sharedCertificationCandidateRepository.getBySessionIdAndUserId
                      .withArgs({ sessionId: foundSession.id, userId: user.id })
                      .resolves(foundCertificationCandidate);

                    const certificationCenter = domainBuilder.buildCertificationCenter({
                      habilitations: [cleaCertification],
                    });
                    certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                    certificationBadgesService.findStillValidBadgeAcquisitions
                      .withArgs({ userId: user.id })
                      .resolves([certifiableBadgeAcquisition]);

                    const complementaryCertificationCourse = new ComplementaryCertificationCourse({
                      complementaryCertificationId: cleaCertification.id,
                      complementaryCertificationBadgeId: 100,
                    });

                    const certificationCourseToSave = CertificationCourse.from({
                      certificationCandidate: foundCertificationCandidate,
                      certificationVersion,
                      verificationCode,
                      complementaryCertificationCourse,
                      algorithmEngineVersion: AlgorithmEngineVersion.V3,
                      lang: user.lang,
                      framework: Frameworks.CLEA,
                    });

                    const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                      certificationCourseToSave.toDTO(),
                    );
                    savedCertificationCourse._complementaryCertificationCourse = {
                      ...complementaryCertificationCourse,
                      id: 99,
                      certificationCourseId: savedCertificationCourse.getId(),
                      complementaryCertificationBadgeId: 100,
                    };
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
                    expect(result.certificationCourse._complementaryCertificationCourse).to.deep.equal({
                      id: 99,
                      certificationCourseId: savedCertificationCourse.getId(),
                      complementaryCertificationId: cleaCertification.id,
                      complementaryCertificationBadgeId: 100,
                    });
                  });

                  context('when user has no certifiable badges', function () {
                    it('should save a certification course but not a complementary course', async function () {
                      // given
                      const cleaCertification = domainBuilder.certification.shared.buildComplementaryCertification({
                        key: ComplementaryCertificationKeys.CLEA,
                      });
                      const certificationVersion = domainBuilder.certification.configuration.buildVersion();

                      const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created(
                        {
                          id: 1,
                          accessCode: 'accessCode',
                        },
                      );
                      evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                      certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                        .withArgs({ userId: 2, sessionId: 1 })
                        .resolves(null);

                      const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                        userId: 2,
                        sessionId: 1,
                        authorizedToStart: true,
                        subscriptions: [
                          domainBuilder.certification.enrolment.buildCoreSubscription(),
                          domainBuilder.certification.enrolment.buildComplementarySubscription({
                            complementaryCertificationKey: cleaCertification.key,
                          }),
                        ],
                        complementaryCertification: cleaCertification,
                        reconciledAt,
                      });

                      sharedCertificationCandidateRepository.getBySessionIdAndUserId
                        .withArgs({ sessionId: 1, userId: 2 })
                        .resolves(foundCertificationCandidate);

                      const certificationCenter = domainBuilder.buildCertificationCenter({
                        habilitations: [cleaCertification],
                      });
                      certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                      certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 2 }).resolves([]);

                      const certificationCourseToSave = CertificationCourse.from({
                        certificationCandidate: foundCertificationCandidate,
                        certificationVersion,
                        verificationCode,
                        algorithmEngineVersion: AlgorithmEngineVersion.V3,
                        lang: user.lang,
                        framework: Frameworks.CORE,
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
                          numberOfChallenges: 32,
                        }),
                      });
                      expect(result.certificationCourse._complementaryCertificationCourse).to.be.null;
                    });
                  });
                });
              });

              context('when certification center is not habilitated anymore', function () {
                it('should throw an CenterHabilitationError error', async function () {
                  // given
                  const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification(
                    {
                      key: ComplementaryCertificationKeys.CLEA,
                    },
                  );

                  const foundSession = domainBuilder.certification.sessionManagement.buildSessionManagement.created({
                    id: 1,
                    accessCode: 'accessCode',
                  });
                  evaluationSessionRepository.get.withArgs({ id: 1 }).resolves(foundSession);

                  const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                    userId: 2,
                    sessionId: 1,
                    authorizedToStart: true,
                    subscriptions: [
                      domainBuilder.certification.enrolment.buildComplementarySubscription({
                        certificationCandidateId: 123,
                        complementaryCertificationKey: ComplementaryCertificationKeys.CLEA,
                      }),
                      domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: 123 }),
                    ],
                    complementaryCertification,
                    reconciledAt,
                  });

                  sharedCertificationCandidateRepository.getBySessionIdAndUserId
                    .withArgs({ sessionId: 1, userId: 2 })
                    .resolves(foundCertificationCandidate);

                  certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                    .withArgs({ userId: 2, sessionId: 1 })
                    .resolves(null);

                  const certificationCenter = domainBuilder.buildCertificationCenter({
                    habilitations: [],
                  });
                  certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                  // when
                  const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
                    sessionId: 1,
                    accessCode: 'accessCode',
                    userId: 2,
                    locale: 'fr',
                    ...injectables,
                  });

                  // then
                  expect(error).to.be.instanceOf(CenterHabilitationError);
                });
              });
            });
          });
        });
      });
    });
  });
});
