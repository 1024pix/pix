const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { PIX_PLUS_DROIT, CLEA, PIX_PLUS_EDU } = require('../../../../lib/domain/models/ComplementaryCertification');
const {
  UserNotAuthorizedToCertifyError,
  NotFoundError,
  SessionNotAccessible,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
} = require('../../../../lib/domain/errors');
const retrieveLastOrCreateCertificationCourse = require('../../../../lib/domain/usecases/retrieve-last-or-create-certification-course');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const ComplementaryCertificationCourse = require('../../../../lib/domain/models/ComplementaryCertificationCourse');
const _ = require('lodash');

describe('Unit | UseCase | retrieve-last-or-create-certification-course', function () {
  let clock;
  let now;
  let domainTransaction;
  let verificationCode;

  const sessionRepository = {};
  const assessmentRepository = {};
  const competenceRepository = {};
  const certificationCandidateRepository = {};
  const certificationChallengeRepository = {};
  const certificationChallengesService = {};
  const certificationCourseRepository = {};
  const certificationCenterRepository = {};
  const certificationBadgesService = {};
  const placementProfileService = {};
  const verifyCertificateCodeService = {};
  const complementaryCertificationRepository = {};
  const endTestScreenRemovalService = {};

  const injectables = {
    assessmentRepository,
    competenceRepository,
    certificationCandidateRepository,
    certificationChallengeRepository,
    certificationCourseRepository,
    sessionRepository,
    certificationCenterRepository,
    certificationBadgesService,
    certificationChallengesService,
    placementProfileService,
    verifyCertificateCodeService,
    complementaryCertificationRepository,
    endTestScreenRemovalService,
  };

  beforeEach(function () {
    now = new Date('2019-01-01T05:06:07Z');
    clock = sinon.useFakeTimers(now);
    domainTransaction = Symbol('someDomainTransaction');
    verificationCode = Symbol('verificationCode');

    assessmentRepository.save = sinon.stub();
    competenceRepository.listPixCompetencesOnly = sinon.stub();
    certificationBadgesService.findStillValidBadgeAcquisitions = sinon.stub();
    certificationBadgesService.hasStillValidCleaBadgeAcquisition = sinon.stub();
    certificationCandidateRepository.getBySessionIdAndUserId = sinon.stub();
    certificationCandidateRepository.update = sinon.stub();
    certificationChallengeRepository.save = sinon.stub();
    certificationChallengesService.pickCertificationChallengesForPixPlus = sinon.stub();
    certificationChallengesService.pickCertificationChallenges = sinon.stub();
    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId = sinon.stub();
    certificationCourseRepository.save = sinon.stub();
    sessionRepository.get = sinon.stub();
    placementProfileService.getPlacementProfile = sinon.stub();
    endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId = sinon.stub();

    verifyCertificateCodeService.generateCertificateVerificationCode = sinon.stub().resolves(verificationCode);
    certificationCenterRepository.getBySessionId = sinon.stub();
    complementaryCertificationRepository.findAll = sinon.stub();
  });

  afterEach(function () {
    clock.restore();
  });

  context('when session access code is different from provided access code', function () {
    it('should throw a not found error', async function () {
      // given
      const foundSession = domainBuilder.buildSession({ accessCode: 'differentAccessCode' });
      sessionRepository.get.withArgs(1).resolves(foundSession);

      // when
      const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
        domainTransaction,
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
        const foundSession = domainBuilder.buildSession.finalized({ id: 1, accessCode: 'accessCode' });
        sessionRepository.get.withArgs(1).resolves(foundSession);

        // when
        const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
          domainTransaction,
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
      context(
        'when FT_END_TEST_SCREEN_REMOVAL_ENABLED_CERTIFICATION_CENTER_IDS is enabled for the session and the candidate IS NOT authorized',
        function () {
          beforeEach(function () {
            endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(1).resolves(true);
          });

          context('when the user tries to join the session for the first time', function () {
            it('should throw a CandidateNotAuthorizedToJoinSessionError', async function () {
              // given
              const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
              sessionRepository.get.withArgs(1).resolves(foundSession);

              const candidateNotAuthorizedToStart = domainBuilder.buildCertificationCandidate({
                userId: 2,
                sessionId: 1,
                authorizedToStart: false,
              });
              certificationCandidateRepository.getBySessionIdAndUserId
                .withArgs({ sessionId: 1, userId: 2 })
                .resolves(candidateNotAuthorizedToStart);

              // when
              const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
                domainTransaction: Symbol('someDomainTransaction'),
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
              const domainTransaction = Symbol('someDomainTransaction');
              const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
              sessionRepository.get.withArgs(1).resolves(foundSession);

              const candidateNotAuthorizedToStart = domainBuilder.buildCertificationCandidate({
                userId: 2,
                sessionId: 1,
                authorizedToStart: false,
              });
              certificationCandidateRepository.getBySessionIdAndUserId
                .withArgs({ sessionId: 1, userId: 2 })
                .resolves(candidateNotAuthorizedToStart);

              const existingCertificationCourse = domainBuilder.buildCertificationCourse({ userId: 2, sessionId: 1 });
              certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                .resolves(existingCertificationCourse);

              // when
              const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
                domainTransaction,
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
        }
      );

      context(
        'when FT_END_TEST_SCREEN_REMOVAL_ENABLED_CERTIFICATION_CENTER_IDS is enabled for the session and when the certification candidate is authorized',
        function () {
          beforeEach(function () {
            endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(1).resolves(true);
          });

          context('when a certification course with provided userId and sessionId already exists', function () {
            it('return existing certification course and unauthorize candidate to start', async function () {
              // given
              const domainTransaction = Symbol('someDomainTransaction');
              const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
              sessionRepository.get.withArgs(1).resolves(foundSession);

              const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                userId: 2,
                sessionId: 1,
                authorizedToStart: true,
              });
              certificationCandidateRepository.getBySessionIdAndUserId
                .withArgs({ sessionId: 1, userId: 2 })
                .resolves(foundCertificationCandidate);

              const existingCertificationCourse = domainBuilder.buildCertificationCourse({ userId: 2, sessionId: 1 });
              certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                .resolves(existingCertificationCourse);

              // when
              const result = await retrieveLastOrCreateCertificationCourse({
                domainTransaction,
                sessionId: 1,
                accessCode: 'accessCode',
                userId: 2,
                locale: 'fr',
                ...injectables,
              });

              // then
              expect(result).to.deep.equal({
                created: false,
                certificationCourse: existingCertificationCourse,
              });
              expect(certificationCandidateRepository.update).to.have.been.calledOnceWith(
                domainBuilder.buildCertificationCandidate({
                  ...foundCertificationCandidate,
                  authorizedToStart: false,
                })
              );
            });
          });

          context('when no certification course exists for this userId and sessionId', function () {
            context('when the user is not certifiable', function () {
              it('should throw a UserNotAuthorizedToCertifyError', async function () {
                // given
                const domainTransaction = Symbol('someDomainTransaction');

                const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
                sessionRepository.get.withArgs(1).resolves(foundSession);

                certificationCandidateRepository.getBySessionIdAndUserId.withArgs({ sessionId: 1, userId: 2 }).resolves(
                  domainBuilder.buildCertificationCandidate({
                    userId: 2,
                    sessionId: 1,
                    authorizedToStart: true,
                  })
                );

                certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                  .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                  .resolves(null);

                const competences = [{ id: 'rec123' }, { id: 'rec456' }];
                competenceRepository.listPixCompetencesOnly.resolves(competences);

                const placementProfile = { isCertifiable: sinon.stub().returns(false) };
                placementProfileService.getPlacementProfile
                  .withArgs({ userId: 2, limitDate: now })
                  .resolves(placementProfile);

                // when
                const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
                  domainTransaction,
                  sessionId: 1,
                  accessCode: 'accessCode',
                  userId: 2,
                  locale: 'fr',
                  ...injectables,
                });

                // then
                expect(error).to.be.an.instanceOf(UserNotAuthorizedToCertifyError);
                sinon.assert.notCalled(certificationCourseRepository.save);
                sinon.assert.notCalled(assessmentRepository.save);
                sinon.assert.notCalled(certificationChallengeRepository.save);
                expect(verifyCertificateCodeService.generateCertificateVerificationCode).not.to.have.been.called;
              });
            });

            context('when user is certifiable', function () {
              context('when a certification course has been created meanwhile', function () {
                it('should return it with flag created marked as false', async function () {
                  // given
                  const domainTransaction = Symbol('someDomainTransaction');
                  const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
                  sessionRepository.get.withArgs(1).resolves(foundSession);

                  certificationCandidateRepository.getBySessionIdAndUserId
                    .withArgs({ sessionId: 1, userId: 2 })
                    .resolves(
                      domainBuilder.buildCertificationCandidate({
                        userId: 2,
                        sessionId: 1,
                        authorizedToStart: true,
                      })
                    );

                  certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                    .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                    .onCall(0)
                    .resolves(null);

                  const { placementProfile, userCompetencesWithChallenges } = _buildPlacementProfileWithTwoChallenges(
                    placementProfileService,
                    2,
                    now
                  );
                  certificationChallengesService.pickCertificationChallenges
                    .withArgs(placementProfile)
                    .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                  const certificationCourseCreatedMeanwhile = domainBuilder.buildCertificationCourse({
                    userId: 2,
                    sessionId: 1,
                  });
                  certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                    .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                    .onCall(1)
                    .resolves(certificationCourseCreatedMeanwhile);

                  // when
                  const result = await retrieveLastOrCreateCertificationCourse({
                    domainTransaction,
                    sessionId: 1,
                    accessCode: 'accessCode',
                    userId: 2,
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
                it('should return it with flag created marked as true with related resources', async function () {
                  // given
                  const domainTransaction = Symbol('someDomainTransaction');

                  const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
                  sessionRepository.get.withArgs(1).resolves(foundSession);

                  const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                    userId: 2,
                    sessionId: 1,
                    authorizedToStart: true,
                  });
                  certificationCandidateRepository.getBySessionIdAndUserId
                    .withArgs({ sessionId: 1, userId: 2 })
                    .resolves(foundCertificationCandidate);

                  certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                    .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                    .resolves(null);

                  const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                    _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                  certificationChallengesService.pickCertificationChallenges
                    .withArgs(placementProfile)
                    .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                  const certificationCenter = domainBuilder.buildCertificationCenter({ habilitations: [] });
                  certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                  certificationBadgesService.findStillValidBadgeAcquisitions
                    .withArgs({ userId: 2, domainTransaction })
                    .resolves([]);
                  certificationBadgesService.hasStillValidCleaBadgeAcquisition.withArgs({ userId: 2 }).resolves(false);

                  // TODO: extraire jusqu'à la ligne 387 dans une fonction ?
                  const certificationCourseToSave = CertificationCourse.from({
                    certificationCandidate: foundCertificationCandidate,
                    challenges: [challenge1, challenge2],
                    verificationCode,
                    maxReachableLevelOnCertificationDate: 5,
                  });
                  const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                    certificationCourseToSave.toDTO()
                  );
                  certificationCourseRepository.save
                    .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
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
                  assessmentRepository.save
                    .withArgs({ assessment: assessmentToSave, domainTransaction })
                    .resolves(savedAssessment);

                  // when
                  const result = await retrieveLastOrCreateCertificationCourse({
                    domainTransaction,
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
                      challenges: [challenge1, challenge2],
                    }),
                  });
                });

                context('when certification center has habilitation for Pix+ Droit', function () {
                  context('when user has certifiable badges with Pix+ Droit', function () {
                    context('when user is granted for Pix+ Droit complementary certification', function () {
                      it('should save complementary certification info for Pix+ Droit', async function () {
                        // given
                        const domainTransaction = Symbol('someDomainTransaction');

                        const foundSession = domainBuilder.buildSession.created({
                          id: 1,
                          accessCode: 'accessCode',
                        });
                        sessionRepository.get.withArgs(1).resolves(foundSession);

                        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                          .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                          .resolves(null);

                        const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                          userId: 2,
                          sessionId: 1,
                          authorizedToStart: true,
                          complementaryCertifications: [{ name: PIX_PLUS_DROIT }],
                        });

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const complementaryCertificationPixPlusDroit = domainBuilder.buildComplementaryCertification({
                          name: PIX_PLUS_DROIT,
                        });
                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertificationPixPlusDroit],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                        complementaryCertificationRepository.findAll.resolves([complementaryCertificationPixPlusDroit]);

                        const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
                        const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                        const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });

                        const pixDroitMaitreBadgeAcquisition = domainBuilder.buildBadgeAcquisition.forPixDroitMaitre();
                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({ userId: 2, domainTransaction })
                          .resolves([pixDroitMaitreBadgeAcquisition]);

                        certificationChallengesService.pickCertificationChallengesForPixPlus
                          .withArgs(pixDroitMaitreBadgeAcquisition.badge, 2)
                          .resolves([challengePlus1, challengePlus2, challengePlus3]);

                        const complementaryCertificationCourse =
                          ComplementaryCertificationCourse.fromComplementaryCertificationId(
                            complementaryCertificationPixPlusDroit.id
                          );

                        const certificationCourseToSave = CertificationCourse.from({
                          certificationCandidate: foundCertificationCandidate,
                          challenges: [challenge1, challenge2, challengePlus1, challengePlus2, challengePlus3],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: 5,
                          complementaryCertificationCourses: [complementaryCertificationCourse],
                        });

                        const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                          certificationCourseToSave.toDTO()
                        );
                        savedCertificationCourse._complementaryCertificationCourses = [
                          {
                            ...complementaryCertificationCourse,
                            id: 99,
                            certificationCourseId: savedCertificationCourse.getId(),
                          },
                        ];
                        certificationCourseRepository.save
                          .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
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
                        assessmentRepository.save
                          .withArgs({ assessment: assessmentToSave, domainTransaction })
                          .resolves(savedAssessment);

                        // when
                        const result = await retrieveLastOrCreateCertificationCourse({
                          domainTransaction,
                          sessionId: 1,
                          accessCode: 'accessCode',
                          userId: 2,
                          locale: 'fr',
                          ...injectables,
                        });

                        // then
                        expect(result.certificationCourse._complementaryCertificationCourses).to.deep.equal([
                          {
                            id: 99,
                            certificationCourseId: savedCertificationCourse.getId(),
                            complementaryCertificationId: complementaryCertificationPixPlusDroit.id,
                          },
                        ]);
                      });

                      it('should save all the challenges from pix and Pix+ Droit', async function () {
                        // given
                        const domainTransaction = Symbol('someDomainTransaction');

                        const foundSession = domainBuilder.buildSession.created({
                          id: 1,
                          accessCode: 'accessCode',
                        });
                        sessionRepository.get.withArgs(1).resolves(foundSession);

                        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                          .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                          .resolves(null);

                        const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                          userId: 2,
                          sessionId: 1,
                          authorizedToStart: true,
                          complementaryCertifications: [{ name: PIX_PLUS_DROIT }],
                        });

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const complementaryCertificationPixPlusDroit = domainBuilder.buildComplementaryCertification({
                          name: PIX_PLUS_DROIT,
                        });
                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertificationPixPlusDroit],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                        complementaryCertificationRepository.findAll.resolves([complementaryCertificationPixPlusDroit]);

                        const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
                        const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                        const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });

                        const pixDroitMaitreBadgeAcquisition = domainBuilder.buildBadgeAcquisition.forPixDroitMaitre();
                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({ userId: 2, domainTransaction })
                          .resolves([pixDroitMaitreBadgeAcquisition]);

                        certificationChallengesService.pickCertificationChallengesForPixPlus
                          .withArgs(pixDroitMaitreBadgeAcquisition.badge, 2)
                          .resolves([challengePlus1, challengePlus2, challengePlus3]);

                        const complementaryCertificationCourse =
                          ComplementaryCertificationCourse.fromComplementaryCertificationId(
                            complementaryCertificationPixPlusDroit.id
                          );
                        const certificationCourseToSave = CertificationCourse.from({
                          certificationCandidate: foundCertificationCandidate,
                          challenges: [challenge1, challenge2, challengePlus1, challengePlus2, challengePlus3],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: 5,
                          complementaryCertificationCourses: [complementaryCertificationCourse],
                        });

                        const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                          certificationCourseToSave.toDTO()
                        );
                        savedCertificationCourse._complementaryCertificationCourses = [
                          {
                            ...complementaryCertificationCourse,
                            certificationCourseId: savedCertificationCourse.getId(),
                          },
                        ];
                        certificationCourseRepository.save
                          .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
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
                        assessmentRepository.save
                          .withArgs({ assessment: assessmentToSave, domainTransaction })
                          .resolves(savedAssessment);

                        // when
                        const result = await retrieveLastOrCreateCertificationCourse({
                          domainTransaction,
                          sessionId: 1,
                          accessCode: 'accessCode',
                          userId: 2,
                          locale: 'fr',
                          ...injectables,
                        });

                        // then
                        expect(result.certificationCourse._challenges).to.deep.equal([
                          challenge1,
                          challenge2,
                          challengePlus1,
                          challengePlus2,
                          challengePlus3,
                        ]);
                      });

                      it('should generate challenges for expert badge only if both maitre and expert badges are acquired', async function () {
                        // given
                        const domainTransaction = Symbol('someDomainTransaction');

                        const foundSession = domainBuilder.buildSession.created({
                          id: 1,
                          accessCode: 'accessCode',
                        });
                        sessionRepository.get.withArgs(1).resolves(foundSession);

                        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                          .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                          .resolves(null);

                        const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                          userId: 2,
                          sessionId: 1,
                          authorizedToStart: true,
                          complementaryCertifications: [{ name: PIX_PLUS_DROIT }],
                        });

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        const complementaryCertificationPixPlusDroit = domainBuilder.buildComplementaryCertification({
                          name: PIX_PLUS_DROIT,
                        });
                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertificationPixPlusDroit],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                        complementaryCertificationRepository.findAll.resolves([complementaryCertificationPixPlusDroit]);

                        const challengesForMaitre = [
                          domainBuilder.buildChallenge({ id: 'challenge-pixmaitre1' }),
                          domainBuilder.buildChallenge({ id: 'challenge-pixmaitre2' }),
                        ];
                        const challengesForExpert = [
                          domainBuilder.buildChallenge({ id: 'challenge-pixexpert1' }),
                          domainBuilder.buildChallenge({ id: 'challenge-pixexpert2' }),
                        ];
                        const maitreBadge = domainBuilder.buildBadge({
                          key: 'PIX_DROIT_MAITRE_CERTIF',
                          targetProfileId: 11,
                        });
                        const expertBadge = domainBuilder.buildBadge({
                          key: 'PIX_DROIT_EXPERT_CERTIF',
                          targetProfileId: 22,
                        });
                        domainBuilder.buildBadgeAcquisition({ badge: maitreBadge });
                        const certifiableBadgeAcquisition2 = domainBuilder.buildBadgeAcquisition({
                          badge: expertBadge,
                        });
                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({ userId: 2, domainTransaction })
                          .resolves([certifiableBadgeAcquisition2]);

                        certificationChallengesService.pickCertificationChallengesForPixPlus
                          .withArgs(maitreBadge, 2)
                          .resolves(challengesForMaitre)
                          .withArgs(expertBadge, 2)
                          .resolves(challengesForExpert);

                        const complementaryCertificationCourse =
                          ComplementaryCertificationCourse.fromComplementaryCertificationId(
                            complementaryCertificationPixPlusDroit.id
                          );

                        const certificationCourseToSave = CertificationCourse.from({
                          certificationCandidate: foundCertificationCandidate,
                          challenges: [challenge1, challenge2, ...challengesForExpert],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: 5,
                          complementaryCertificationCourses: [complementaryCertificationCourse],
                        });

                        const savedCertificationCourse = domainBuilder.buildCertificationCourse({
                          ...foundCertificationCandidate,
                          isV2Certification: true,
                          challenges: [challenge1, challenge2, ...challengesForExpert],
                        });

                        savedCertificationCourse._complementaryCertificationCourses = [
                          {
                            ...complementaryCertificationCourse,
                            certificationCourseId: savedCertificationCourse.getId(),
                          },
                        ];

                        certificationCourseRepository.save
                          .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
                          .resolves(savedCertificationCourse);

                        const savedAssessment = domainBuilder.buildAssessment({
                          userId: 2,
                          certificationCourseId: savedCertificationCourse.id,
                          state: Assessment.states.STARTED,
                          type: Assessment.types.CERTIFICATION,
                          isImproving: false,
                          method: Assessment.methods.CERTIFICATION_DETERMINED,
                        });
                        assessmentRepository.save.resolves(savedAssessment);

                        // when
                        const result = await retrieveLastOrCreateCertificationCourse({
                          domainTransaction,
                          sessionId: 1,
                          accessCode: 'accessCode',
                          userId: 2,
                          locale: 'fr',
                          ...injectables,
                        });

                        // then
                        expect(result.certificationCourse._challenges).to.deep.equal([
                          challenge1,
                          challenge2,
                          ...challengesForExpert,
                        ]);
                      });
                    });

                    context('when user is not granted for Pix+ Droit complementary certification', function () {
                      it('should not save complementary certification info', async function () {
                        // given
                        const domainTransaction = Symbol('someDomainTransaction');

                        const foundSession = domainBuilder.buildSession.created({
                          id: 1,
                          accessCode: 'accessCode',
                        });
                        sessionRepository.get.withArgs(1).resolves(foundSession);

                        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                          .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                          .resolves(null);

                        const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                          userId: 2,
                          authorizedToStart: true,
                          sessionId: 1,
                          complementaryCertifications: [],
                        });

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        const complementaryCertificationPixPlusDroit = domainBuilder.buildComplementaryCertification({
                          name: PIX_PLUS_DROIT,
                        });
                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertificationPixPlusDroit],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                        complementaryCertificationRepository.findAll.resolves([complementaryCertificationPixPlusDroit]);

                        const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
                        const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                        const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                        const certifiableBadge1 = domainBuilder.buildBadge({ key: 'COUCOU', targetProfileId: 11 });
                        const certifiableBadge2 = domainBuilder.buildBadge({ key: 'SALUT', targetProfileId: 22 });
                        const certifiableBadgeAcquisition1 = domainBuilder.buildBadgeAcquisition({
                          badge: certifiableBadge1,
                        });
                        const certifiableBadgeAcquisition2 = domainBuilder.buildBadgeAcquisition({
                          badge: certifiableBadge2,
                        });

                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({ userId: 2, domainTransaction })
                          .resolves([certifiableBadgeAcquisition1, certifiableBadgeAcquisition2]);

                        certificationChallengesService.pickCertificationChallengesForPixPlus
                          .withArgs(certifiableBadge1, 2)
                          .resolves([challengePlus1, challengePlus2])
                          .withArgs(certifiableBadge2, 2)
                          .resolves([challengePlus3]);

                        const certificationCourseToSave = CertificationCourse.from({
                          certificationCandidate: foundCertificationCandidate,
                          challenges: [challenge1, challenge2],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: 5,
                          complementaryCertificationCourses: [],
                        });

                        const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                          certificationCourseToSave.toDTO()
                        );
                        certificationCourseRepository.save
                          .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
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
                        assessmentRepository.save
                          .withArgs({ assessment: assessmentToSave, domainTransaction })
                          .resolves(savedAssessment);

                        // when
                        const result = await retrieveLastOrCreateCertificationCourse({
                          domainTransaction,
                          sessionId: 1,
                          accessCode: 'accessCode',
                          userId: 2,
                          locale: 'fr',
                          ...injectables,
                        });

                        // then
                        expect(result.certificationCourse._complementaryCertificationCourses).to.be.empty;
                      });
                    });
                  });

                  context('when user has no certifiable badges for Pix+ Droit', function () {
                    context('when user has no certifiable badges for Pix+ Droit', function () {
                      it('should not save challenges from Pix+ Droit', async function () {
                        // given
                        const domainTransaction = Symbol('someDomainTransaction');

                        const foundSession = domainBuilder.buildSession.created({
                          id: 1,
                          accessCode: 'accessCode',
                        });
                        sessionRepository.get.withArgs(1).resolves(foundSession);

                        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                          .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                          .resolves(null);

                        const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                          userId: 2,
                          sessionId: 1,
                          authorizedToStart: true,
                          complementaryCertifications: [{ name: PIX_PLUS_DROIT }],
                        });

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        const complementaryCertificationPixPlusDroit = domainBuilder.buildComplementaryCertification({
                          name: PIX_PLUS_DROIT,
                        });
                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertificationPixPlusDroit],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                        complementaryCertificationRepository.findAll.resolves([complementaryCertificationPixPlusDroit]);

                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({ userId: 2, domainTransaction })
                          .resolves([]);

                        const certificationCourseToSave = CertificationCourse.from({
                          certificationCandidate: foundCertificationCandidate,
                          challenges: [challenge1, challenge2],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: 5,
                        });

                        const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                          certificationCourseToSave.toDTO()
                        );
                        certificationCourseRepository.save
                          .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
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
                        assessmentRepository.save
                          .withArgs({ assessment: assessmentToSave, domainTransaction })
                          .resolves(savedAssessment);

                        // when
                        const result = await retrieveLastOrCreateCertificationCourse({
                          domainTransaction,
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
                            challenges: [challenge1, challenge2],
                          }),
                        });
                      });

                      it('should not generate challenges for expert badge', async function () {
                        // given
                        const domainTransaction = Symbol('someDomainTransaction');

                        const foundSession = domainBuilder.buildSession.created({
                          id: 1,
                          accessCode: 'accessCode',
                        });
                        sessionRepository.get.withArgs(1).resolves(foundSession);

                        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                          .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                          .resolves(null);

                        const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                          userId: 2,
                          sessionId: 1,
                          authorizedToStart: true,
                          complementaryCertifications: [{ name: PIX_PLUS_DROIT }],
                        });

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        const complementaryCertificationPixPlusDroit = domainBuilder.buildComplementaryCertification({
                          name: PIX_PLUS_DROIT,
                        });
                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertificationPixPlusDroit],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                        complementaryCertificationRepository.findAll.resolves([complementaryCertificationPixPlusDroit]);

                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({ userId: 2, domainTransaction })
                          .resolves([]);

                        const certificationCourseToSave = CertificationCourse.from({
                          certificationCandidate: foundCertificationCandidate,
                          challenges: [challenge1, challenge2],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: 5,
                        });

                        const savedCertificationCourse = domainBuilder.buildCertificationCourse({
                          ...foundCertificationCandidate,
                          isV2Certification: true,
                          challenges: [challenge1, challenge2],
                        });

                        certificationCourseRepository.save
                          .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
                          .resolves(savedCertificationCourse);
                        const savedAssessment = domainBuilder.buildAssessment({
                          userId: 2,
                          certificationCourseId: savedCertificationCourse.id,
                          state: Assessment.states.STARTED,
                          type: Assessment.types.CERTIFICATION,
                          isImproving: false,
                          method: Assessment.methods.CERTIFICATION_DETERMINED,
                        });
                        assessmentRepository.save.resolves(savedAssessment);

                        // when
                        const result = await retrieveLastOrCreateCertificationCourse({
                          domainTransaction,
                          sessionId: 1,
                          accessCode: 'accessCode',
                          userId: 2,
                          locale: 'fr',
                          ...injectables,
                        });

                        // then
                        expect(result.certificationCourse._challenges).to.deep.equal([challenge1, challenge2]);
                      });
                    });
                  });
                });

                context('when certification center has no habilitation for Pix+ Droit', function () {
                  it('should save only the challenges from pix', async function () {
                    // given
                    const domainTransaction = Symbol('someDomainTransaction');

                    const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
                    sessionRepository.get.withArgs(1).resolves(foundSession);

                    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                      .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                      .resolves(null);

                    const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                      userId: 2,
                      sessionId: 1,
                      authorizedToStart: true,
                    });

                    certificationCandidateRepository.getBySessionIdAndUserId
                      .withArgs({ sessionId: 1, userId: 2 })
                      .resolves(foundCertificationCandidate);

                    const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                      _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                    certificationChallengesService.pickCertificationChallenges
                      .withArgs(placementProfile)
                      .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                    const complementaryCertificationPixPlusDroit = domainBuilder.buildComplementaryCertification({
                      name: PIX_PLUS_DROIT,
                    });
                    const certificationCenter = domainBuilder.buildCertificationCenter({
                      habilitations: [complementaryCertificationPixPlusDroit],
                    });
                    certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                    complementaryCertificationRepository.findAll.resolves([complementaryCertificationPixPlusDroit]);

                    certificationBadgesService.findStillValidBadgeAcquisitions
                      .withArgs({ userId: 2, domainTransaction })
                      .resolves([]);

                    const certificationCourseToSave = CertificationCourse.from({
                      certificationCandidate: foundCertificationCandidate,
                      challenges: [challenge1, challenge2],
                      verificationCode,
                      maxReachableLevelOnCertificationDate: 5,
                    });

                    const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                      certificationCourseToSave.toDTO()
                    );
                    certificationCourseRepository.save
                      .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
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
                    assessmentRepository.save
                      .withArgs({ assessment: assessmentToSave, domainTransaction })
                      .resolves(savedAssessment);

                    // when
                    const result = await retrieveLastOrCreateCertificationCourse({
                      domainTransaction,
                      sessionId: 1,
                      accessCode: 'accessCode',
                      userId: 2,
                      locale: 'fr',
                      ...injectables,
                    });

                    // then
                    expect(result.certificationCourse._challenges).to.deep.equal([challenge1, challenge2]);
                    expect(
                      certificationChallengesService.pickCertificationChallengesForPixPlus
                    ).not.to.have.been.called;
                  });
                });

                context('when certification center has habilitation for CleA', function () {
                  context('when user has no certifiable badges with CleA', function () {
                    context('when user is granted for CleA certification', function () {
                      it('should not save complementary certification info', async function () {
                        // given
                        const domainTransaction = Symbol('someDomainTransaction');

                        const foundSession = domainBuilder.buildSession.created({
                          id: 1,
                          accessCode: 'accessCode',
                        });
                        sessionRepository.get.withArgs(1).resolves(foundSession);

                        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                          .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                          .resolves(null);

                        const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                          userId: 2,
                          sessionId: 1,
                          authorizedToStart: true,
                          complementaryCertifications: [{ name: CLEA }],
                        });

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        const complementaryCertificationCleA = domainBuilder.buildComplementaryCertification({
                          name: CLEA,
                        });
                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertificationCleA],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                        complementaryCertificationRepository.findAll.resolves([complementaryCertificationCleA]);

                        const certificationCourseToSave = CertificationCourse.from({
                          certificationCandidate: foundCertificationCandidate,
                          challenges: [challenge1, challenge2],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: 5,
                          complementaryCertificationCourses: [],
                        });

                        const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                          certificationCourseToSave.toDTO()
                        );
                        certificationCourseRepository.save.resolves(savedCertificationCourse);

                        const assessmentToSave = new Assessment({
                          userId: 2,
                          certificationCourseId: savedCertificationCourse.getId(),
                          state: Assessment.states.STARTED,
                          type: Assessment.types.CERTIFICATION,
                          isImproving: false,
                          method: Assessment.methods.CERTIFICATION_DETERMINED,
                        });
                        const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                        assessmentRepository.save
                          .withArgs({ assessment: assessmentToSave, domainTransaction })
                          .resolves(savedAssessment);

                        certificationBadgesService.hasStillValidCleaBadgeAcquisition
                          .withArgs({ userId: 2 })
                          .resolves(false);

                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({
                            userId: 2,
                            domainTransaction,
                          })
                          .resolves([]);

                        // when
                        const result = await retrieveLastOrCreateCertificationCourse({
                          domainTransaction,
                          sessionId: 1,
                          accessCode: 'accessCode',
                          userId: 2,
                          locale: 'fr',
                          ...injectables,
                        });

                        // then
                        expect(certificationCourseRepository.save).to.have.been.calledWith({
                          certificationCourse: certificationCourseToSave,
                          domainTransaction,
                        });

                        expect(result.certificationCourse._complementaryCertificationCourses).to.be.empty;
                      });
                    });
                  });

                  context('when user has certifiable badges with CleA', function () {
                    it('should save complementary certification info', async function () {
                      // given
                      const domainTransaction = Symbol('someDomainTransaction');

                      const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
                      sessionRepository.get.withArgs(1).resolves(foundSession);

                      certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                        .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                        .resolves(null);

                      const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                        userId: 2,
                        sessionId: 1,
                        authorizedToStart: true,
                        complementaryCertifications: [{ name: CLEA }],
                      });

                      certificationCandidateRepository.getBySessionIdAndUserId
                        .withArgs({ sessionId: 1, userId: 2 })
                        .resolves(foundCertificationCandidate);

                      const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                        _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                      certificationChallengesService.pickCertificationChallenges
                        .withArgs(placementProfile)
                        .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                      const complementaryCertificationCleA = domainBuilder.buildComplementaryCertification({
                        name: CLEA,
                      });
                      const certificationCenter = domainBuilder.buildCertificationCenter({
                        habilitations: [complementaryCertificationCleA],
                      });
                      certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                      complementaryCertificationRepository.findAll.resolves([complementaryCertificationCleA]);

                      certificationBadgesService.hasStillValidCleaBadgeAcquisition
                        .withArgs({ userId: 2 })
                        .resolves(true);

                      certificationBadgesService.findStillValidBadgeAcquisitions
                        .withArgs({ userId: 2, domainTransaction })
                        .resolves([]);

                      certificationChallengesService.pickCertificationChallengesForPixPlus.resolves([]);

                      const complementaryCertificationCourse =
                        ComplementaryCertificationCourse.fromComplementaryCertificationId(
                          complementaryCertificationCleA.id
                        );
                      const certificationCourseToSave = CertificationCourse.from({
                        certificationCandidate: foundCertificationCandidate,
                        challenges: [challenge1, challenge2],
                        verificationCode,
                        maxReachableLevelOnCertificationDate: 5,
                        complementaryCertificationCourses: [complementaryCertificationCourse],
                      });

                      const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                        certificationCourseToSave.toDTO()
                      );

                      savedCertificationCourse._complementaryCertificationCourses = [
                        {
                          ...complementaryCertificationCourse,
                          id: 99,
                          certificationCourseId: savedCertificationCourse.getId(),
                        },
                      ];
                      certificationCourseRepository.save.resolves(savedCertificationCourse);

                      const assessmentToSave = new Assessment({
                        userId: 2,
                        certificationCourseId: savedCertificationCourse.getId(),
                        state: Assessment.states.STARTED,
                        type: Assessment.types.CERTIFICATION,
                        isImproving: false,
                        method: Assessment.methods.CERTIFICATION_DETERMINED,
                      });
                      const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                      assessmentRepository.save
                        .withArgs({ assessment: assessmentToSave, domainTransaction })
                        .resolves(savedAssessment);

                      certificationBadgesService.hasStillValidCleaBadgeAcquisition
                        .withArgs({ userId: 2 })
                        .resolves(true);

                      // when
                      const result = await retrieveLastOrCreateCertificationCourse({
                        domainTransaction,
                        sessionId: 1,
                        accessCode: 'accessCode',
                        userId: 2,
                        locale: 'fr',
                        ...injectables,
                      });

                      // then
                      expect(certificationCourseRepository.save).to.have.been.calledWith({
                        certificationCourse: certificationCourseToSave,
                        domainTransaction,
                      });

                      expect(result.certificationCourse._complementaryCertificationCourses).to.deep.equal([
                        {
                          id: 99,
                          certificationCourseId: result.certificationCourse.getId(),
                          complementaryCertificationId: complementaryCertificationCleA.id,
                        },
                      ]);
                    });

                    context('when user is not granted for CleA certification', function () {
                      it('should not save complementary certification info', async function () {
                        // given
                        const domainTransaction = Symbol('someDomainTransaction');

                        const foundSession = domainBuilder.buildSession.created({
                          id: 1,
                          accessCode: 'accessCode',
                        });
                        sessionRepository.get.withArgs(1).resolves(foundSession);

                        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                          .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                          .resolves(null);

                        const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                          userId: 2,
                          sessionId: 1,
                          authorizedToStart: true,
                        });

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        const complementaryCertificationCleA = domainBuilder.buildComplementaryCertification({
                          name: CLEA,
                        });
                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertificationCleA],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                        complementaryCertificationRepository.findAll.resolves([complementaryCertificationCleA]);

                        const certificationCourseToSave = CertificationCourse.from({
                          certificationCandidate: foundCertificationCandidate,
                          challenges: [challenge1, challenge2],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: 5,
                          complementaryCertificationCourses: [],
                        });

                        const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                          certificationCourseToSave.toDTO()
                        );
                        certificationCourseRepository.save.resolves(savedCertificationCourse);

                        const assessmentToSave = new Assessment({
                          userId: 2,
                          certificationCourseId: savedCertificationCourse.getId(),
                          state: Assessment.states.STARTED,
                          type: Assessment.types.CERTIFICATION,
                          isImproving: false,
                          method: Assessment.methods.CERTIFICATION_DETERMINED,
                        });
                        const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                        assessmentRepository.save
                          .withArgs({ assessment: assessmentToSave, domainTransaction })
                          .resolves(savedAssessment);

                        certificationBadgesService.hasStillValidCleaBadgeAcquisition
                          .withArgs({ userId: 2 })
                          .resolves(true);

                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({
                            userId: 2,
                            domainTransaction,
                          })
                          .resolves([]);

                        // when
                        const result = await retrieveLastOrCreateCertificationCourse({
                          domainTransaction,
                          sessionId: 1,
                          accessCode: 'accessCode',
                          userId: 2,
                          locale: 'fr',
                          ...injectables,
                        });

                        // then
                        expect(certificationCourseRepository.save).to.have.been.calledWith({
                          certificationCourse: certificationCourseToSave,
                          domainTransaction,
                        });

                        expect(result.certificationCourse._complementaryCertificationCourses).to.deep.equal([]);
                      });
                    });
                  });
                });

                context('when certification center has no habilitation for CleA', function () {
                  context('when user has certifiable badges with CleA', function () {
                    it('should not save complementary certification info', async function () {
                      // given
                      const domainTransaction = Symbol('someDomainTransaction');

                      const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
                      sessionRepository.get.withArgs(1).resolves(foundSession);

                      certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                        .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                        .resolves(null);

                      const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                        userId: 2,
                        sessionId: 1,
                        authorizedToStart: true,
                      });

                      certificationCandidateRepository.getBySessionIdAndUserId
                        .withArgs({ sessionId: 1, userId: 2 })
                        .resolves(foundCertificationCandidate);

                      const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                        _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                      certificationChallengesService.pickCertificationChallenges
                        .withArgs(placementProfile)
                        .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                      const complementaryCertificationCleA = domainBuilder.buildComplementaryCertification({
                        name: CLEA,
                      });
                      const certificationCenter = domainBuilder.buildCertificationCenter();
                      certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                      complementaryCertificationRepository.findAll.resolves([complementaryCertificationCleA]);

                      const certificationCourseToSave = CertificationCourse.from({
                        certificationCandidate: foundCertificationCandidate,
                        challenges: [challenge1, challenge2],
                        verificationCode,
                        maxReachableLevelOnCertificationDate: 5,
                        complementaryCertificationCourses: [],
                      });

                      const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                        certificationCourseToSave.toDTO()
                      );
                      certificationCourseRepository.save.resolves(savedCertificationCourse);

                      const assessmentToSave = new Assessment({
                        userId: 2,
                        certificationCourseId: savedCertificationCourse.getId(),
                        state: Assessment.states.STARTED,
                        type: Assessment.types.CERTIFICATION,
                        isImproving: false,
                        method: Assessment.methods.CERTIFICATION_DETERMINED,
                      });
                      const savedAssessment = domainBuilder.buildAssessment(assessmentToSave);
                      assessmentRepository.save
                        .withArgs({ assessment: assessmentToSave, domainTransaction })
                        .resolves(savedAssessment);

                      certificationBadgesService.hasStillValidCleaBadgeAcquisition
                        .withArgs({ userId: 2 })
                        .resolves(true);

                      certificationBadgesService.findStillValidBadgeAcquisitions
                        .withArgs({
                          userId: 2,
                          domainTransaction,
                        })
                        .resolves([]);

                      // when
                      const result = await retrieveLastOrCreateCertificationCourse({
                        domainTransaction,
                        sessionId: 1,
                        accessCode: 'accessCode',
                        userId: 2,
                        locale: 'fr',
                        ...injectables,
                      });

                      // then
                      expect(certificationCourseRepository.save).to.have.been.calledWith({
                        certificationCourse: certificationCourseToSave,
                        domainTransaction,
                      });

                      expect(result.certificationCourse._complementaryCertificationCourses).to.deep.equal([]);
                    });
                  });
                });

                context('when user has certifiable badge for Pix+ Édu', function () {
                  it('should save complementary certification info for Pix+ Édu', async function () {
                    // given
                    const domainTransaction = Symbol('someDomainTransaction');

                    const foundSession = domainBuilder.buildSession.created({
                      id: 1,
                      accessCode: 'accessCode',
                    });
                    sessionRepository.get.withArgs(1).resolves(foundSession);

                    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                      .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                      .resolves(null);

                    const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                      userId: 2,
                      sessionId: 1,
                      authorizedToStart: true,
                      complementaryCertifications: [],
                    });

                    const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                      _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                    certificationChallengesService.pickCertificationChallenges
                      .withArgs(placementProfile)
                      .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                    certificationCandidateRepository.getBySessionIdAndUserId
                      .withArgs({ sessionId: 1, userId: 2 })
                      .resolves(foundCertificationCandidate);

                    const complementaryCertificationPixPlusEdu = domainBuilder.buildComplementaryCertification({
                      name: PIX_PLUS_EDU,
                    });
                    const certificationCenter = domainBuilder.buildCertificationCenter({
                      habilitations: [],
                    });
                    certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                    complementaryCertificationRepository.findAll.resolves([complementaryCertificationPixPlusEdu]);

                    const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
                    const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                    const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });

                    const pixEduBadgeAcquisition =
                      domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAvance();
                    certificationBadgesService.findStillValidBadgeAcquisitions
                      .withArgs({ userId: 2, domainTransaction })
                      .resolves([pixEduBadgeAcquisition]);

                    certificationChallengesService.pickCertificationChallengesForPixPlus
                      .withArgs(pixEduBadgeAcquisition.badge, 2)
                      .resolves([challengePlus1, challengePlus2, challengePlus3]);

                    const complementaryCertificationCourse =
                      ComplementaryCertificationCourse.fromComplementaryCertificationId(
                        complementaryCertificationPixPlusEdu.id
                      );

                    const certificationCourseToSave = CertificationCourse.from({
                      certificationCandidate: foundCertificationCandidate,
                      challenges: [challenge1, challenge2, challengePlus1, challengePlus2, challengePlus3],
                      verificationCode,
                      maxReachableLevelOnCertificationDate: 5,
                      complementaryCertificationCourses: [complementaryCertificationCourse],
                    });

                    const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                      certificationCourseToSave.toDTO()
                    );
                    savedCertificationCourse._complementaryCertificationCourses = [
                      {
                        ...complementaryCertificationCourse,
                        id: 99,
                        certificationCourseId: savedCertificationCourse.getId(),
                      },
                    ];
                    certificationCourseRepository.save
                      .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
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
                    assessmentRepository.save
                      .withArgs({ assessment: assessmentToSave, domainTransaction })
                      .resolves(savedAssessment);

                    // when
                    const result = await retrieveLastOrCreateCertificationCourse({
                      domainTransaction,
                      sessionId: 1,
                      accessCode: 'accessCode',
                      userId: 2,
                      locale: 'fr',
                      ...injectables,
                    });

                    // then
                    expect(result.certificationCourse._complementaryCertificationCourses).to.deep.equal([
                      {
                        id: 99,
                        certificationCourseId: savedCertificationCourse.getId(),
                        complementaryCertificationId: complementaryCertificationPixPlusEdu.id,
                      },
                    ]);
                  });
                  it('should save all the challenges from pix and Pix+ Édu', async function () {
                    // given
                    const domainTransaction = Symbol('someDomainTransaction');

                    const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
                    sessionRepository.get.withArgs(1).resolves(foundSession);

                    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                      .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                      .resolves(null);

                    const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({
                      userId: 2,
                      sessionId: 1,
                      authorizedToStart: true,
                      complementaryCertifications: [],
                    });

                    certificationCandidateRepository.getBySessionIdAndUserId
                      .withArgs({ sessionId: 1, userId: 2 })
                      .resolves(foundCertificationCandidate);

                    const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                      _buildPlacementProfileWithTwoChallenges(placementProfileService, 2, now);
                    certificationChallengesService.pickCertificationChallenges
                      .withArgs(placementProfile)
                      .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                    const certificationCenter = domainBuilder.buildCertificationCenter({
                      habilitations: [],
                    });
                    certificationCenterRepository.getBySessionId.resolves(certificationCenter);
                    complementaryCertificationRepository.findAll.resolves([]);

                    const challengeEdu1 = domainBuilder.buildChallenge({ id: 'challenge-pix-edu1' });
                    const challengeEdu2 = domainBuilder.buildChallenge({ id: 'challenge-pix-edu2' });

                    const pixEduFormationContinueFormateurBadgeAcquisition =
                      domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreFormateur();
                    certificationBadgesService.findStillValidBadgeAcquisitions
                      .withArgs({ userId: 2, domainTransaction })
                      .resolves([pixEduFormationContinueFormateurBadgeAcquisition]);

                    certificationChallengesService.pickCertificationChallengesForPixPlus
                      .withArgs(pixEduFormationContinueFormateurBadgeAcquisition.badge, 2)
                      .resolves([challengeEdu1, challengeEdu2]);

                    const certificationCourseToSave = CertificationCourse.from({
                      certificationCandidate: foundCertificationCandidate,
                      challenges: [challenge1, challenge2, challengeEdu1, challengeEdu2],
                      verificationCode,
                      maxReachableLevelOnCertificationDate: 5,
                      complementaryCertificationCourses: [],
                    });

                    const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                      certificationCourseToSave.toDTO()
                    );
                    certificationCourseRepository.save
                      .withArgs({ certificationCourse: certificationCourseToSave, domainTransaction })
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
                    assessmentRepository.save
                      .withArgs({ assessment: assessmentToSave, domainTransaction })
                      .resolves(savedAssessment);

                    // when
                    const result = await retrieveLastOrCreateCertificationCourse({
                      domainTransaction,
                      sessionId: 1,
                      accessCode: 'accessCode',
                      userId: 2,
                      locale: 'fr',
                      ...injectables,
                    });

                    // then
                    expect(result.certificationCourse._challenges).to.deep.equal([
                      challenge1,
                      challenge2,
                      challengeEdu1,
                      challengeEdu2,
                    ]);
                  });
                });
              });
            });
          });
        }
      );
    });
  });
});

function _buildPlacementProfileWithTwoChallenges(placementProfileService, userId, now) {
  const challenge1 = domainBuilder.buildChallenge({ id: 'challenge1' });
  const challenge2 = domainBuilder.buildChallenge({ id: 'challenge2' });
  // TODO : use the domainBuilder to instanciate userCompetences
  const placementProfile = {
    isCertifiable: sinon.stub().returns(true),
    userCompetences: [{ challenges: [challenge1] }, { challenges: [challenge2] }],
  };
  placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now }).resolves(placementProfile);

  const userCompetencesWithChallenges = _.clone(placementProfile.userCompetences);
  userCompetencesWithChallenges[0].challenges[0].testedSkill = domainBuilder.buildSkill();
  userCompetencesWithChallenges[1].challenges[0].testedSkill = domainBuilder.buildSkill();
  return { challenge1, challenge2, placementProfile, userCompetencesWithChallenges };
}
