import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper.js';

import {
  UserNotAuthorizedToCertifyError,
  NotFoundError,
  SessionNotAccessible,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  UnexpectedUserAccountError,
} from '../../../../lib/domain/errors.js';

import { retrieveLastOrCreateCertificationCourse } from '../../../../lib/domain/usecases/retrieve-last-or-create-certification-course.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { CertificationCourse } from '../../../../lib/domain/models/CertificationCourse.js';
import { ComplementaryCertificationCourse } from '../../../../lib/domain/models/ComplementaryCertificationCourse.js';
import _ from 'lodash';
import { MAX_REACHABLE_LEVEL } from '../../../../lib/domain/constants.js';

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
  };

  beforeEach(function () {
    now = new Date('2019-01-01T05:06:07Z');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    domainTransaction = Symbol('someDomainTransaction');
    verificationCode = Symbol('verificationCode');

    assessmentRepository.save = sinon.stub();
    competenceRepository.listPixCompetencesOnly = sinon.stub();
    certificationBadgesService.findStillValidBadgeAcquisitions = sinon.stub();
    certificationCandidateRepository.getBySessionIdAndUserId = sinon.stub();
    certificationCandidateRepository.update = sinon.stub();
    certificationChallengeRepository.save = sinon.stub();
    certificationChallengesService.pickCertificationChallengesForPixPlus = sinon.stub();
    certificationChallengesService.pickCertificationChallenges = sinon.stub();
    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId = sinon.stub();
    certificationCourseRepository.save = sinon.stub();
    sessionRepository.get = sinon.stub();
    placementProfileService.getPlacementProfile = sinon.stub();

    verifyCertificateCodeService.generateCertificateVerificationCode = sinon.stub().resolves(verificationCode);
    certificationCenterRepository.getBySessionId = sinon.stub();
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
      context('when the candidate IS NOT authorized', function () {
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
      });

      context('when the certification candidate is authorized', function () {
        context('when the user is not connected with the correct account', function () {
          it('should throw a CandidateNotAuthorizedToJoinSessionError xxx', async function () {
            // given
            const domainTransaction = Symbol('someDomainTransaction');
            const foundSession = domainBuilder.buildSession.created({ id: 1, accessCode: 'accessCode' });
            sessionRepository.get.withArgs(1).resolves(foundSession);

            const foundCertificationCandidateId = 2;
            domainBuilder.buildCertificationCourse({ userId: foundCertificationCandidateId, sessionId: 1 });

            domainBuilder.buildCertificationCandidate({
              userId: foundCertificationCandidateId,
              sessionId: 1,
              authorizedToStart: true,
            });

            certificationCandidateRepository.getBySessionIdAndUserId
              .withArgs({ sessionId: 1, userId: foundCertificationCandidateId })
              .resolves(null);

            // when
            const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
              domainTransaction,
              sessionId: 1,
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
              }),
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
                }),
              );

              certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                .resolves(null);

              const competences = [{ id: 'rec123' }, { id: 'rec456' }];
              competenceRepository.listPixCompetencesOnly.resolves(competences);

              const placementProfile = { isCertifiable: sinon.stub().returns(false) };
              placementProfileService.getPlacementProfile
                .withArgs({ userId: 2, limitDate: now, version: 2 })
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

                certificationCandidateRepository.getBySessionIdAndUserId.withArgs({ sessionId: 1, userId: 2 }).resolves(
                  domainBuilder.buildCertificationCandidate({
                    userId: 2,
                    sessionId: 1,
                    authorizedToStart: true,
                  }),
                );

                certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                  .withArgs({ userId: 2, sessionId: 1, domainTransaction })
                  .onCall(0)
                  .resolves(null);

                const { placementProfile, userCompetencesWithChallenges } = _buildPlacementProfileWithTwoChallenges({
                  placementProfileService,
                  userId: 2,
                  now,
                  version: foundSession.version,
                });
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
                  _buildPlacementProfileWithTwoChallenges({
                    placementProfileService,
                    userId: 2,
                    now,
                    version: foundSession.version,
                  });
                certificationChallengesService.pickCertificationChallenges
                  .withArgs(placementProfile)
                  .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                const certificationCenter = domainBuilder.buildCertificationCenter({ habilitations: [] });
                certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                certificationBadgesService.findStillValidBadgeAcquisitions
                  .withArgs({ userId: 2, domainTransaction })
                  .resolves([]);

                // TODO: extraire jusqu'à la ligne 387 dans une fonction ?
                const certificationCourseToSave = CertificationCourse.from({
                  certificationCandidate: foundCertificationCandidate,
                  challenges: [challenge1, challenge2],
                  verificationCode,
                  maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                });
                const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                  certificationCourseToSave.toDTO(),
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

              it('should create a v3 certification', async function () {
                // given
                const domainTransaction = Symbol('someDomainTransaction');

                const foundSession = domainBuilder.buildSession.created({
                  id: 1,
                  accessCode: 'accessCode',
                  version: 3,
                });
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

                _buildPlacementProfileWithTwoChallenges({
                  placementProfileService,
                  userId: 2,
                  now,
                  version: foundSession.version,
                });

                const certificationCenter = domainBuilder.buildCertificationCenter({
                  habilitations: [],
                  isV3Pilot: true,
                });
                certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                certificationBadgesService.findStillValidBadgeAcquisitions
                  .withArgs({ userId: 2, domainTransaction })
                  .resolves([]);

                // TODO: extraire jusqu'à la ligne 387 dans une fonction ?
                const certificationCourseToSave = CertificationCourse.from({
                  certificationCandidate: foundCertificationCandidate,
                  challenges: [],
                  verificationCode,
                  maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                  version: 3,
                });
                const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                  certificationCourseToSave.toDTO(),
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
                    challenges: [],
                    version: 3,
                  }),
                });
              });

              context('#when the user is eligible to one complementary certification', function () {
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
                        complementaryCertification,
                      });

                      const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                        _buildPlacementProfileWithTwoChallenges({
                          placementProfileService,
                          userId: 2,
                          now,
                          version: foundSession.version,
                        });
                      certificationChallengesService.pickCertificationChallenges
                        .withArgs(placementProfile)
                        .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                      certificationCandidateRepository.getBySessionIdAndUserId
                        .withArgs({ sessionId: 1, userId: 2 })
                        .resolves(foundCertificationCandidate);

                      const certificationCenter = domainBuilder.buildCertificationCenter({
                        habilitations: [complementaryCertification],
                      });
                      certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                      const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
                      const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                      const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });

                      certificationBadgesService.findStillValidBadgeAcquisitions
                        .withArgs({ userId: 2, domainTransaction })
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
                        challenges: [challengePlus1, challengePlus2, challengePlus3, challenge1, challenge2],
                        verificationCode,
                        maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                        complementaryCertificationCourses: [complementaryCertificationCourse],
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
                        complementaryCertification,
                      });

                      const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                        _buildPlacementProfileWithTwoChallenges({
                          placementProfileService,
                          userId: 2,
                          now,
                          version: foundSession.version,
                        });
                      certificationChallengesService.pickCertificationChallenges
                        .withArgs(placementProfile)
                        .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                      certificationCandidateRepository.getBySessionIdAndUserId
                        .withArgs({ sessionId: 1, userId: 2 })
                        .resolves(foundCertificationCandidate);

                      const certificationCenter = domainBuilder.buildCertificationCenter({
                        habilitations: [complementaryCertification],
                      });
                      certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                      const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
                      const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                      const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });

                      certificationBadgesService.findStillValidBadgeAcquisitions
                        .withArgs({ userId: 2, domainTransaction })
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
                        challenges: [challengePlus1, challengePlus2, challengePlus3, challenge1, challenge2],
                        verificationCode,
                        maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                        complementaryCertificationCourses: [complementaryCertificationCourse],
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
                        challengePlus1,
                        challengePlus2,
                        challengePlus3,
                        challenge1,
                        challenge2,
                      ]);
                    });

                    context('when user has no certifiable badges', function () {
                      it('should not save challenges from complementary referential', async function () {
                        // given
                        const complementaryCertification = domainBuilder.buildComplementaryCertification({
                          key: 'PIX+TEST',
                        });
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
                          complementaryCertification,
                        });

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges({
                            placementProfileService,
                            userId: 2,
                            now,
                            version: foundSession.version,
                          });
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertification],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({ userId: 2, domainTransaction })
                          .resolves([]);

                        const certificationCourseToSave = CertificationCourse.from({
                          certificationCandidate: foundCertificationCandidate,
                          challenges: [challenge1, challenge2],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                        });

                        const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                          certificationCourseToSave.toDTO(),
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
                          complementaryCertification,
                        });

                        const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                          _buildPlacementProfileWithTwoChallenges({
                            placementProfileService,
                            userId: 2,
                            now,
                            version: foundSession.version,
                          });
                        certificationChallengesService.pickCertificationChallenges
                          .withArgs(placementProfile)
                          .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                        certificationCandidateRepository.getBySessionIdAndUserId
                          .withArgs({ sessionId: 1, userId: 2 })
                          .resolves(foundCertificationCandidate);

                        const certificationCenter = domainBuilder.buildCertificationCenter({
                          habilitations: [complementaryCertification],
                        });
                        certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                        certificationBadgesService.findStillValidBadgeAcquisitions
                          .withArgs({ userId: 2, domainTransaction })
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
                          challenges: [challenge1, challenge2],
                          verificationCode,
                          maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                          complementaryCertificationCourses: [complementaryCertificationCourse],
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
                        complementaryCertification: null,
                      });

                      certificationCandidateRepository.getBySessionIdAndUserId
                        .withArgs({ sessionId: 1, userId: 2 })
                        .resolves(foundCertificationCandidate);

                      const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                        _buildPlacementProfileWithTwoChallenges({
                          placementProfileService,
                          userId: 2,
                          now,
                          version: foundSession.version,
                        });
                      certificationChallengesService.pickCertificationChallenges
                        .withArgs(placementProfile)
                        .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                      const certificationCenter = domainBuilder.buildCertificationCenter({
                        habilitations: [complementaryCertification],
                      });
                      certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                      certificationBadgesService.findStillValidBadgeAcquisitions
                        .withArgs({ userId: 2, domainTransaction })
                        .resolves([badgeAcquisition]);

                      const certificationCourseToSave = CertificationCourse.from({
                        certificationCandidate: foundCertificationCandidate,
                        challenges: [challenge1, challenge2],
                        verificationCode,
                        maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                        complementaryCertificationCourses: [],
                      });

                      const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                        certificationCourseToSave.toDTO(),
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
                      complementaryCertification,
                    });

                    certificationCandidateRepository.getBySessionIdAndUserId
                      .withArgs({ sessionId: 1, userId: 2 })
                      .resolves(foundCertificationCandidate);

                    const { challenge1, challenge2, placementProfile, userCompetencesWithChallenges } =
                      _buildPlacementProfileWithTwoChallenges({
                        placementProfileService,
                        userId: 2,
                        now,
                        version: foundSession.version,
                      });
                    certificationChallengesService.pickCertificationChallenges
                      .withArgs(placementProfile)
                      .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                    const certificationCenter = domainBuilder.buildCertificationCenter({
                      habilitations: [],
                    });
                    certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                    certificationBadgesService.findStillValidBadgeAcquisitions
                      .withArgs({ userId: 2, domainTransaction })
                      .resolves([badgeAcquisition]);

                    const certificationCourseToSave = CertificationCourse.from({
                      certificationCandidate: foundCertificationCandidate,
                      challenges: [challenge1, challenge2],
                      verificationCode,
                      maxReachableLevelOnCertificationDate: MAX_REACHABLE_LEVEL,
                    });

                    const savedCertificationCourse = domainBuilder.buildCertificationCourse(
                      certificationCourseToSave.toDTO(),
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
                    expect(certificationChallengesService.pickCertificationChallengesForPixPlus).not.to.have.been
                      .called;
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

function _buildPlacementProfileWithTwoChallenges({ placementProfileService, userId, now, version }) {
  const challenge1 = domainBuilder.buildChallenge({ id: 'challenge1' });
  const challenge2 = domainBuilder.buildChallenge({ id: 'challenge2' });
  // TODO : use the domainBuilder to instanciate userCompetences
  const placementProfile = {
    isCertifiable: sinon.stub().returns(true),
    userCompetences: [{ challenges: [challenge1] }, { challenges: [challenge2] }],
  };
  placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now, version }).resolves(placementProfile);

  const userCompetencesWithChallenges = _.clone(placementProfile.userCompetences);
  userCompetencesWithChallenges[0].challenges[0].testedSkill = domainBuilder.buildSkill();
  userCompetencesWithChallenges[1].challenges[0].testedSkill = domainBuilder.buildSkill();
  return { challenge1, challenge2, placementProfile, userCompetencesWithChallenges };
}
