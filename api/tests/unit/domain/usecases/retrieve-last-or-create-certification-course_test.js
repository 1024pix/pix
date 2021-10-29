const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const {
  UserNotAuthorizedToCertifyError,
  NotFoundError,
  SessionNotAccessible,
} = require('../../../../lib/domain/errors');
const retrieveLastOrCreateCertificationCourse = require('../../../../lib/domain/usecases/retrieve-last-or-create-certification-course');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const _ = require('lodash');

describe('Unit | UseCase | retrieve-last-or-create-certification-course', function () {
  let clock;
  let now;
  let domainTransaction;
  let verificationCode;

  let sessionRepository;
  let assessmentRepository;
  let competenceRepository;
  let certificationCandidateRepository;
  let certificationChallengeRepository;
  let certificationChallengesService;
  let certificationCourseRepository;
  let certificationCenterRepository;
  let certificationBadgesService;
  let placementProfileService;
  let verifyCertificateCodeService;

  beforeEach(function () {
    now = new Date('2019-01-01T05:06:07Z');
    clock = sinon.useFakeTimers(now);
    domainTransaction = Symbol('someDomainTransaction');
    verificationCode = Symbol('verificationCode');

    assessmentRepository = { save: sinon.stub() };
    competenceRepository = { listPixCompetencesOnly: sinon.stub() };
    certificationBadgesService = { findStillValidBadgeAcquisitions: sinon.stub() };
    certificationCandidateRepository = { getBySessionIdAndUserId: sinon.stub() };
    certificationChallengeRepository = { save: sinon.stub() };
    certificationChallengesService = {
      pickCertificationChallengesForPixPlus: sinon.stub(),
      pickCertificationChallenges: sinon.stub(),
    };
    certificationCourseRepository = {
      findOneCertificationCourseByUserIdAndSessionId: sinon.stub(),
      save: sinon.stub(),
    };
    sessionRepository = { get: sinon.stub() };
    placementProfileService = {
      getPlacementProfile: sinon.stub(),
    };
    verifyCertificateCodeService = {
      generateCertificateVerificationCode: sinon.stub().resolves(verificationCode),
    };
    certificationCenterRepository = {
      getBySessionId: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.reset();
  });

  context('when session access code is different from provided access code', function () {
    it('should throw a not found error', async function () {
      // given
      const sessionId = 1;
      const accessCode = 'accessCode';
      const userId = 2;
      const foundSession = domainBuilder.buildSession({ accessCode: 'differentAccessCode' });
      sessionRepository.get.withArgs(sessionId).resolves(foundSession);

      // when
      const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
        domainTransaction,
        sessionId,
        accessCode,
        userId,
        locale: 'fr',
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
        const sessionId = 1;
        const accessCode = 'accessCode';
        const userId = 2;
        const foundSession = domainBuilder.buildSession.finalized({ id: sessionId, accessCode });
        sessionRepository.get.withArgs(sessionId).resolves(foundSession);

        // when
        const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
          domainTransaction,
          sessionId,
          accessCode,
          userId,
          locale: 'fr',
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
        });

        // then
        expect(error).to.be.instanceOf(SessionNotAccessible);
        expect(certificationCourseRepository.save).not.to.have.been.called;
        expect(verifyCertificateCodeService.generateCertificateVerificationCode).not.to.have.been.called;
      });
    });

    context('when session is accessible', function () {
      context('when a certification course with provided userId and sessionId already exists', function () {
        it('should return it with flag created marked as false', async function () {
          // given
          const sessionId = 1;
          const accessCode = 'accessCode';
          const userId = 2;
          const domainTransaction = Symbol('someDomainTransaction');

          const foundSession = domainBuilder.buildSession.created({ id: sessionId, accessCode });
          sessionRepository.get.withArgs(sessionId).resolves(foundSession);

          const existingCertificationCourse = domainBuilder.buildCertificationCourse({ userId, sessionId });
          certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
            .withArgs({ userId, sessionId, domainTransaction })
            .resolves(existingCertificationCourse);

          // when
          const result = await retrieveLastOrCreateCertificationCourse({
            domainTransaction,
            sessionId,
            accessCode,
            userId,
            locale: 'fr',
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
          });

          // then
          expect(result).to.deep.equal({
            created: false,
            certificationCourse: existingCertificationCourse,
          });

          expect(certificationCourseRepository.save).not.to.have.been.called;
          expect(verifyCertificateCodeService.generateCertificateVerificationCode).not.to.have.been.called;
        });
      });

      context('when no certification course exists for this userId and sessionId', function () {
        context('when the user is not certifiable', function () {
          it('should throw a UserNotAuthorizedToCertifyError', async function () {
            // given
            const sessionId = 1;
            const accessCode = 'accessCode';
            const userId = 2;
            const domainTransaction = Symbol('someDomainTransaction');

            const foundSession = domainBuilder.buildSession.created({ id: sessionId, accessCode });
            sessionRepository.get.withArgs(sessionId).resolves(foundSession);

            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId, sessionId, domainTransaction })
              .resolves(null);

            const competences = [{ id: 'rec123' }, { id: 'rec456' }];
            competenceRepository.listPixCompetencesOnly.resolves(competences);

            const placementProfile = { isCertifiable: sinon.stub().returns(false) };
            placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now }).resolves(placementProfile);
            // when
            const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
              domainTransaction,
              sessionId,
              accessCode,
              userId,
              locale: 'fr',
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
            });

            // then
            expect(error).to.be.an.instanceOf(UserNotAuthorizedToCertifyError);
          });

          it('should not create any new resource', async function () {
            // given
            const sessionId = 1;
            const accessCode = 'accessCode';
            const userId = 2;
            const domainTransaction = Symbol('someDomainTransaction');

            const foundSession = domainBuilder.buildSession.created({ id: sessionId, accessCode });
            sessionRepository.get.withArgs(sessionId).resolves(foundSession);

            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId, sessionId, domainTransaction })
              .resolves(null);

            const competences = [{ id: 'rec123' }, { id: 'rec456' }];
            competenceRepository.listPixCompetencesOnly.resolves(competences);

            const placementProfile = { isCertifiable: sinon.stub().returns(false) };
            placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now }).resolves(placementProfile);
            // when
            await catchErr(retrieveLastOrCreateCertificationCourse)({
              domainTransaction,
              sessionId,
              accessCode,
              userId,
              locale: 'fr',
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
            });

            // then
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
              const sessionId = 1;
              const accessCode = 'accessCode';
              const userId = 2;
              const domainTransaction = Symbol('someDomainTransaction');

              const foundSession = domainBuilder.buildSession.created({ id: sessionId, accessCode });
              sessionRepository.get.withArgs(sessionId).resolves(foundSession);

              const existingCertificationCourse = domainBuilder.buildCertificationCourse({ userId, sessionId });
              certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                .withArgs({ userId, sessionId, domainTransaction })
                .onCall(0)
                .resolves(null);

              certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                .withArgs({ userId, sessionId, domainTransaction })
                .onCall(1)
                .resolves(existingCertificationCourse);

              const skill1 = domainBuilder.buildSkill();
              const skill2 = domainBuilder.buildSkill();
              const challenge1 = domainBuilder.buildChallenge({ id: 'challenge1' });
              const challenge2 = domainBuilder.buildChallenge({ id: 'challenge2' });
              // TODO : use the domainBuilder to instanciate userCompetences
              const placementProfile = {
                isCertifiable: sinon.stub().returns(true),
                userCompetences: [{ challenges: [challenge1] }, { challenges: [challenge2] }],
              };
              placementProfileService.getPlacementProfile
                .withArgs({ userId, limitDate: now })
                .resolves(placementProfile);

              const userCompetencesWithChallenges = _.clone(placementProfile.userCompetences);
              userCompetencesWithChallenges[0].challenges[0].testedSkill = skill1;
              userCompetencesWithChallenges[1].challenges[0].testedSkill = skill2;
              certificationChallengesService.pickCertificationChallenges
                .withArgs(placementProfile)
                .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

              // when
              const result = await retrieveLastOrCreateCertificationCourse({
                domainTransaction,
                sessionId,
                accessCode,
                userId,
                locale: 'fr',
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
              });

              // then
              expect(result).to.deep.equal({
                created: false,
                certificationCourse: existingCertificationCourse,
              });
              expect(certificationCourseRepository.save).not.to.have.been.called;
              expect(verifyCertificateCodeService.generateCertificateVerificationCode).not.to.have.been.called;
            });
          });

          context('when a certification still has not been created meanwhile', function () {
            it('should return it with flag created marked as true with related resources', async function () {
              // given
              const sessionId = 1;
              const accessCode = 'accessCode';
              const userId = 2;
              const domainTransaction = Symbol('someDomainTransaction');

              const foundSession = domainBuilder.buildSession.created({ id: sessionId, accessCode });
              sessionRepository.get.withArgs(sessionId).resolves(foundSession);

              certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                .withArgs({ userId, sessionId, domainTransaction })
                .resolves(null);

              const skill1 = domainBuilder.buildSkill();
              const skill2 = domainBuilder.buildSkill();
              const challenge1 = domainBuilder.buildChallenge({ id: 'challenge1' });
              const challenge2 = domainBuilder.buildChallenge({ id: 'challenge2' });
              // TODO : use the domainBuilder to instanciate userCompetences
              const placementProfile = {
                isCertifiable: sinon.stub().returns(true),
                userCompetences: [{ challenges: [challenge1] }, { challenges: [challenge2] }],
              };
              placementProfileService.getPlacementProfile
                .withArgs({ userId, limitDate: now })
                .resolves(placementProfile);

              const userCompetencesWithChallenges = _.clone(placementProfile.userCompetences);
              userCompetencesWithChallenges[0].challenges[0].testedSkill = skill1;
              userCompetencesWithChallenges[1].challenges[0].testedSkill = skill2;
              certificationChallengesService.pickCertificationChallenges
                .withArgs(placementProfile)
                .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

              const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({ userId, sessionId });
              certificationCandidateRepository.getBySessionIdAndUserId
                .withArgs({ sessionId, userId })
                .resolves(foundCertificationCandidate);

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
                userId,
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

              certificationBadgesService.findStillValidBadgeAcquisitions
                .withArgs({ userId, domainTransaction })
                .resolves([]);

              const certificationCenter = domainBuilder.buildCertificationCenter({ habilitations: [] });
              certificationCenterRepository.getBySessionId.resolves(certificationCenter);

              // when
              const result = await retrieveLastOrCreateCertificationCourse({
                domainTransaction,
                sessionId,
                accessCode,
                userId,
                locale: 'fr',
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

            context('when user has certifiable badges with pix plus', function () {
              it('should save all the challenges from pix and pix plus', async function () {
                // given
                const sessionId = 1;
                const accessCode = 'accessCode';
                const userId = 2;
                const domainTransaction = Symbol('someDomainTransaction');

                const foundSession = domainBuilder.buildSession.created({ id: sessionId, accessCode });
                sessionRepository.get.withArgs(sessionId).resolves(foundSession);

                certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                  .withArgs({ userId, sessionId, domainTransaction })
                  .resolves(null);

                const skill1 = domainBuilder.buildSkill();
                const skill2 = domainBuilder.buildSkill();
                const challenge1 = domainBuilder.buildChallenge({ id: 'challenge1' });
                const challenge2 = domainBuilder.buildChallenge({ id: 'challenge2' });
                // TODO : use the domainBuilder to instanciate userCompetences
                const placementProfile = {
                  isCertifiable: sinon.stub().returns(true),
                  userCompetences: [{ challenges: [challenge1] }, { challenges: [challenge2] }],
                };
                placementProfileService.getPlacementProfile
                  .withArgs({ userId, limitDate: now })
                  .resolves(placementProfile);

                const userCompetencesWithChallenges = _.clone(placementProfile.userCompetences);
                userCompetencesWithChallenges[0].challenges[0].testedSkill = skill1;
                userCompetencesWithChallenges[1].challenges[0].testedSkill = skill2;
                certificationChallengesService.pickCertificationChallenges
                  .withArgs(placementProfile)
                  .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                const certificationCenter = domainBuilder.buildCertificationCenter({
                  habilitations: [domainBuilder.buildComplementaryCertification({ name: 'Pix+ Droit' })],
                });
                certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
                const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
                const certifiableBadge1 = domainBuilder.buildBadge({ key: 'COUCOU', targetProfileId: 11 });
                const certifiableBadge2 = domainBuilder.buildBadge({ key: 'SALUT', targetProfileId: 22 });
                const certifiableBadgeAcquisition1 = domainBuilder.buildBadgeAcquisition({ badge: certifiableBadge1 });
                const certifiableBadgeAcquisition2 = domainBuilder.buildBadgeAcquisition({ badge: certifiableBadge2 });

                certificationBadgesService.findStillValidBadgeAcquisitions
                  .withArgs({ userId, domainTransaction })
                  .resolves([certifiableBadgeAcquisition1, certifiableBadgeAcquisition2]);

                certificationChallengesService.pickCertificationChallengesForPixPlus
                  .withArgs(certifiableBadge1, userId)
                  .resolves([challengePlus1, challengePlus2])
                  .withArgs(certifiableBadge2, userId)
                  .resolves([challengePlus3]);

                const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({ userId, sessionId });
                certificationCandidateRepository.getBySessionIdAndUserId
                  .withArgs({ sessionId, userId })
                  .resolves(foundCertificationCandidate);

                const certificationCourseToSave = CertificationCourse.from({
                  certificationCandidate: foundCertificationCandidate,
                  challenges: [challenge1, challenge2, challengePlus1, challengePlus2, challengePlus3],
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
                  userId,
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
                  sessionId,
                  accessCode,
                  userId,
                  locale: 'fr',
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
                });

                // then
                expect(result).to.deep.equal({
                  created: true,
                  certificationCourse: new CertificationCourse({
                    ...savedCertificationCourse.toDTO(),
                    assessment: savedAssessment,
                    challenges: [challenge1, challenge2, challengePlus1, challengePlus2, challengePlus3],
                  }),
                });
              });

              context('pix+ droit', function () {
                it('should generate challenges for expert badge only if both maitre and expert badges are acquired', async function () {
                  // given
                  const sessionId = 1;
                  const accessCode = 'accessCode';
                  const userId = 2;
                  const domainTransaction = Symbol('someDomainTransaction');

                  const foundSession = domainBuilder.buildSession.created({ id: sessionId, accessCode });
                  sessionRepository.get.withArgs(sessionId).resolves(foundSession);

                  certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                    .withArgs({ userId, sessionId, domainTransaction })
                    .resolves(null);

                  const skill1 = domainBuilder.buildSkill();
                  const skill2 = domainBuilder.buildSkill();
                  const challenge1 = domainBuilder.buildChallenge({ id: 'challenge1' });
                  const challenge2 = domainBuilder.buildChallenge({ id: 'challenge2' });
                  // TODO : use the domainBuilder to instanciate userCompetences
                  const placementProfile = {
                    isCertifiable: sinon.stub().returns(true),
                    userCompetences: [{ challenges: [challenge1] }, { challenges: [challenge2] }],
                  };
                  placementProfileService.getPlacementProfile
                    .withArgs({ userId, limitDate: now })
                    .resolves(placementProfile);

                  const userCompetencesWithChallenges = _.clone(placementProfile.userCompetences);
                  userCompetencesWithChallenges[0].challenges[0].testedSkill = skill1;
                  userCompetencesWithChallenges[1].challenges[0].testedSkill = skill2;
                  certificationChallengesService.pickCertificationChallenges
                    .withArgs(placementProfile)
                    .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                  const certificationCenter = domainBuilder.buildCertificationCenter({
                    habilitations: [domainBuilder.buildComplementaryCertification({ name: 'Pix+ Droit' })],
                  });
                  certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                  const challengesForMaitre = [
                    domainBuilder.buildChallenge({ id: 'challenge-pixmaitre1' }),
                    domainBuilder.buildChallenge({ id: 'challenge-pixmaitre2' }),
                  ];
                  const challengesForExpert = [
                    domainBuilder.buildChallenge({ id: 'challenge-pixexpert1' }),
                    domainBuilder.buildChallenge({ id: 'challenge-pixexpert2' }),
                  ];
                  const maitreBadge = domainBuilder.buildBadge({ key: 'PIX_DROIT_MAITRE_CERTIF', targetProfileId: 11 });
                  const expertBadge = domainBuilder.buildBadge({ key: 'PIX_DROIT_EXPERT_CERTIF', targetProfileId: 22 });
                  domainBuilder.buildBadgeAcquisition({ badge: maitreBadge });
                  const certifiableBadgeAcquisition2 = domainBuilder.buildBadgeAcquisition({ badge: expertBadge });
                  certificationBadgesService.findStillValidBadgeAcquisitions
                    .withArgs({ userId, domainTransaction })
                    .resolves([certifiableBadgeAcquisition2]);

                  certificationChallengesService.pickCertificationChallengesForPixPlus
                    .withArgs(maitreBadge, userId)
                    .resolves(challengesForMaitre)
                    .withArgs(expertBadge, userId)
                    .resolves(challengesForExpert);

                  const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({ userId, sessionId });
                  certificationCandidateRepository.getBySessionIdAndUserId
                    .withArgs({ sessionId, userId })
                    .resolves(foundCertificationCandidate);
                  const savedCertificationCourse = domainBuilder.buildCertificationCourse({
                    ...foundCertificationCandidate,
                    isV2Certification: true,
                    challenges: [challenge1, challenge2, ...challengesForExpert],
                  });
                  certificationCourseRepository.save.resolves(savedCertificationCourse);
                  const savedAssessment = domainBuilder.buildAssessment({
                    userId,
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
                    sessionId,
                    accessCode,
                    userId,
                    locale: 'fr',
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
                  });

                  // then
                  expect(result).to.deep.equal({
                    created: true,
                    certificationCourse: new CertificationCourse({
                      ...savedCertificationCourse.toDTO(),
                      assessment: savedAssessment,
                      challenges: [challenge1, challenge2, ...challengesForExpert],
                    }),
                  });
                });
              });
            });

            context('when certification center has no habilitation for pix plus', function () {
              it('should save only the challenges from pix', async function () {
                // given
                const sessionId = 1;
                const accessCode = 'accessCode';
                const userId = 2;
                const domainTransaction = Symbol('someDomainTransaction');

                const foundSession = domainBuilder.buildSession.created({ id: sessionId, accessCode });
                sessionRepository.get.withArgs(sessionId).resolves(foundSession);

                certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
                  .withArgs({ userId, sessionId, domainTransaction })
                  .resolves(null);

                const skill1 = domainBuilder.buildSkill();
                const skill2 = domainBuilder.buildSkill();
                const challenge1 = domainBuilder.buildChallenge({ id: 'challenge1' });
                const challenge2 = domainBuilder.buildChallenge({ id: 'challenge2' });
                // TODO : use the domainBuilder to instanciate userCompetences
                const placementProfile = {
                  isCertifiable: sinon.stub().returns(true),
                  userCompetences: [{ challenges: [challenge1] }, { challenges: [challenge2] }],
                };
                placementProfileService.getPlacementProfile
                  .withArgs({ userId, limitDate: now })
                  .resolves(placementProfile);

                const userCompetencesWithChallenges = _.clone(placementProfile.userCompetences);
                userCompetencesWithChallenges[0].challenges[0].testedSkill = skill1;
                userCompetencesWithChallenges[1].challenges[0].testedSkill = skill2;
                certificationChallengesService.pickCertificationChallenges
                  .withArgs(placementProfile)
                  .resolves(_.flatMap(userCompetencesWithChallenges, 'challenges'));

                const certificationCenter = domainBuilder.buildCertificationCenter({
                  habilitations: [],
                });
                certificationCenterRepository.getBySessionId.resolves(certificationCenter);

                const foundCertificationCandidate = domainBuilder.buildCertificationCandidate({ userId, sessionId });
                certificationCandidateRepository.getBySessionIdAndUserId
                  .withArgs({ sessionId, userId })
                  .resolves(foundCertificationCandidate);

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
                  userId,
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
                  sessionId,
                  accessCode,
                  userId,
                  locale: 'fr',
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
          });
        });
      });
    });
  });
});
