const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToCertifyError, NotFoundError } = require('../../../../lib/domain/errors');
const retrieveLastOrCreateCertificationCourse = require('../../../../lib/domain/usecases/retrieve-last-or-create-certification-course');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const _ = require('lodash');

describe('Unit | UseCase | retrieve-last-or-create-certification-course', () => {

  let clock;
  const now = new Date('2019-01-01T05:06:07Z');
  const domainTransaction = Symbol('someDomainTransaction');
  const userId = 'userId';
  const sessionId = 'sessionId';
  const accessCode = 'accessCode';
  let foundSession;
  const assessmentRepository = { save: sinon.stub() };
  const competenceRepository = { listPixCompetencesOnly: sinon.stub() };
  const certificationCandidateRepository = { getBySessionIdAndUserId: sinon.stub() };
  const certificationChallengeRepository = { save: sinon.stub() };
  const certificationChallengesService = { pickCertificationChallengesForPixPlus: sinon.stub(), pickCertificationChallenges: sinon.stub() };
  const badgeAcquisitionRepository = { findCertifiable: sinon.stub() };
  const certificationCourseRepository = {
    findOneCertificationCourseByUserIdAndSessionId: sinon.stub(),
    save: sinon.stub(),
  };
  const sessionRepository = { get: sinon.stub() };
  const placementProfileService = {
    getPlacementProfile: sinon.stub(),
  };

  const parameters = {
    domainTransaction,
    assessmentRepository,
    competenceRepository,
    certificationCandidateRepository,
    certificationChallengeRepository,
    certificationCourseRepository,
    sessionRepository,
    badgeAcquisitionRepository,
    certificationChallengesService,
    placementProfileService,
  };

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(() => {
    clock.restore();
    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.reset();
  });

  context('when session access code is different from provided access code', () => {

    beforeEach(() => {
      foundSession = { accessCode: 'differentAccessCode' };
      sessionRepository.get.withArgs(sessionId).resolves(foundSession);
    });

    it('should throw a not found error', async () => {
      // when
      const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
        sessionId,
        accessCode,
        userId,
        ...parameters,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when session access code is the same as the provided access code', () => {

    beforeEach(() => {
      foundSession = { accessCode };
      sessionRepository.get.withArgs(sessionId).resolves(foundSession);
    });

    context('when a certification course with provided userId and sessionId already exists', () => {

      let existingCertificationCourse;
      beforeEach(() => {
        existingCertificationCourse = Symbol('existingCertificationCourse');
        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.withArgs({ userId, sessionId, domainTransaction }).resolves(existingCertificationCourse);
      });

      it('should return it with flag created marked as false', async function() {
        // when
        const result = await retrieveLastOrCreateCertificationCourse({
          sessionId,
          accessCode,
          userId,
          ...parameters,
        });

        // then
        expect(result).to.deep.equal({
          created: false,
          certificationCourse: existingCertificationCourse,
        });
      });

    });

    context('when no certification course exists for this userId and sessionId', () => {
      let placementProfile;
      let competences;

      beforeEach(() => {
        competences = [{ id: 'rec123' }, { id: 'rec456' }];
        competenceRepository.listPixCompetencesOnly.resolves(competences);
        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
          .withArgs({ userId, sessionId, domainTransaction }).onCall(0).resolves(null);
      });

      context('when the user is not certifiable', () => {

        beforeEach(() => {
          placementProfile = { isCertifiable: sinon.stub().returns(false) };
          placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now }).resolves(placementProfile);
        });

        it('should throw a UserNotAuthorizedToCertifyError', async function() {
          // when
          const error = await catchErr(retrieveLastOrCreateCertificationCourse)({
            sessionId,
            accessCode,
            userId,
            ...parameters,
          });

          // then
          expect(error).to.be.an.instanceOf(UserNotAuthorizedToCertifyError);
        });

        it('should not create any new resource', async function() {
          // when
          await catchErr(retrieveLastOrCreateCertificationCourse)({
            sessionId,
            accessCode,
            userId,
            ...parameters,
          });

          // then
          sinon.assert.notCalled(certificationCourseRepository.save);
          sinon.assert.notCalled(assessmentRepository.save);
          sinon.assert.notCalled(certificationChallengeRepository.save);
        });
      });

      context('when user is certifiable', () => {

        const skill1 = domainBuilder.buildSkill();
        const skill2 = domainBuilder.buildSkill();
        const challenge1 = domainBuilder.buildChallenge({ id: 'challenge1' });
        const challenge2 = domainBuilder.buildChallenge({ id: 'challenge2' });

        beforeEach(() => {
          // TODO : use the domainBuilder to instanciate userCompetences
          placementProfile = { isCertifiable: sinon.stub().returns(true), userCompetences: [{ challenges: [challenge1] }, { challenges: [challenge2] }] };
          placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now }).resolves(placementProfile);
          const userCompetencesWithChallenges = _.clone(placementProfile.userCompetences);
          userCompetencesWithChallenges[0].challenges[0].testedSkill = skill1;
          userCompetencesWithChallenges[1].challenges[0].testedSkill = skill2;
          certificationChallengesService.pickCertificationChallenges.withArgs(placementProfile).resolves(
            _.flatMap(userCompetencesWithChallenges, 'challenges'),
          );
        });

        context('when a certification course has been created meanwhile', () => {

          let existingCertificationCourse;
          beforeEach(() => {
            existingCertificationCourse = Symbol('existingCertificationCourse');
            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId, sessionId, domainTransaction }).onCall(1).resolves(existingCertificationCourse);
          });

          it('should return it with flag created marked as false', async function() {
            // when
            const result = await retrieveLastOrCreateCertificationCourse({
              sessionId,
              accessCode,
              userId,
              ...parameters,
            });

            // then
            expect(result).to.deep.equal({
              created: false,
              certificationCourse: existingCertificationCourse,
            });
          });

          it('should have filled the certification profile with challenges anyway', async () => {
            // when
            await retrieveLastOrCreateCertificationCourse({
              sessionId,
              accessCode,
              userId,
              ...parameters,
            });

            // then
            expect(certificationChallengesService.pickCertificationChallenges).to.have.been.calledWith(placementProfile);
          });

        });

        context('when a certification still has not been created meanwhile', () => {

          const foundCertificationCandidate = {
            firstName: Symbol('firstName'),
            lastName: Symbol('lastName'),
            birthdate: Symbol('birthdate'),
            birthCity: Symbol('birthCity'),
            externalId: Symbol('externalId'),
            userId,
            sessionId,
          };
          const mockCertificationCourse = {
            userId,
            sessionId,
            firstName: foundCertificationCandidate.firstName,
            lastName: foundCertificationCandidate.lastName,
            birthdate: foundCertificationCandidate.birthdate,
            birthplace: foundCertificationCandidate.birthCity,
            externalId: foundCertificationCandidate.externalId,
            isV2Certification: true,
          };

          const savedCertificationChallenge1 = { id: 'savedCertificationChallenge1' };
          const savedCertificationChallenge2 = { id: 'savedCertificationChallenge2' };

          const savedCertificationCourse = {
            id: 'savedCertificationCourse',
            challenges: [savedCertificationChallenge1, savedCertificationChallenge2],
          };

          const mockAssessment = {
            userId,
            certificationCourseId: savedCertificationCourse.id,
            state: Assessment.states.STARTED,
            type: Assessment.types.CERTIFICATION,
          };
          const savedAssessment = {
            id: 'savedAssessment',
          };

          beforeEach(() => {
            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId, sessionId, domainTransaction }).onCall(1).resolves(null);
            placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now }).resolves(placementProfile);
            certificationCandidateRepository.getBySessionIdAndUserId.withArgs({ sessionId, userId }).resolves(foundCertificationCandidate);
            certificationCourseRepository.save.resolves(savedCertificationCourse);
            assessmentRepository.save.resolves(savedAssessment);
            badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([]);
          });

          it('should return it with flag created marked as true with related ressources', async function() {
            // when
            const result = await retrieveLastOrCreateCertificationCourse({
              sessionId,
              accessCode,
              userId,
              ...parameters,
            });

            // then
            expect(result).to.deep.equal({
              created: true,
              certificationCourse: {
                ...savedCertificationCourse,
                assessment: savedAssessment,
                challenges: [savedCertificationChallenge1, savedCertificationChallenge2],
              },
            });
          });

          it('should have save the certification course based on an appropriate argument', async function() {
            // when
            await retrieveLastOrCreateCertificationCourse({
              sessionId,
              accessCode,
              userId,
              ...parameters,
            });

            // then
            expect(certificationCourseRepository.save).to.have.been.calledWith({ certificationCourse: sinon.match(mockCertificationCourse), domainTransaction });
          });

          it('should have save the assessment based on an appropriate argument', async function() {
            // when
            await retrieveLastOrCreateCertificationCourse({
              sessionId,
              accessCode,
              userId,
              ...parameters,
            });

            // then
            expect(assessmentRepository.save).to.have.been.calledWith({ assessment: sinon.match(mockAssessment), domainTransaction });
          });

          context('when user has certifiable badges with pix plus', async function() {

            it('should save all the challenges from pix and pix plus', async function() {
              // given
              sinon.spy(CertificationCourse, 'from');
              const challengePlus1 = domainBuilder.buildChallenge({ id: 'challenge-pixplus1' });
              const challengePlus2 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
              const challengePlus3 = domainBuilder.buildChallenge({ id: 'challenge-pixplus2' });
              const certifiableBadge1 = domainBuilder.buildBadge({ key: 'COUCOU', targetProfileId: 11 });
              const certifiableBadge2 = domainBuilder.buildBadge({ key: 'SALUT', targetProfileId: 22 });
              const certifiableBadgeAcquisition1 = domainBuilder.buildBadgeAcquisition({ badge: certifiableBadge1 });
              const certifiableBadgeAcquisition2 = domainBuilder.buildBadgeAcquisition({ badge: certifiableBadge2 });
              badgeAcquisitionRepository.findCertifiable
                .withArgs({ userId, domainTransaction })
                .resolves([certifiableBadgeAcquisition1, certifiableBadgeAcquisition2]);
              certificationChallengesService.pickCertificationChallengesForPixPlus
                .withArgs(certifiableBadge1, userId)
                .resolves([challengePlus1, challengePlus2])
                .withArgs(certifiableBadge2, userId)
                .resolves([challengePlus3]);
              const expectedChallenges = [challenge1, challenge2, challengePlus1, challengePlus2, challengePlus3];
              // when
              await retrieveLastOrCreateCertificationCourse({
                sessionId,
                accessCode,
                userId,
                ...parameters,
              });

              // then
              expect(CertificationCourse.from).to.have.been.calledWith({
                certificationCandidate: foundCertificationCandidate,
                challenges: expectedChallenges,
                maxReachableLevelOnCertificationDate: 5,
              });
            });

            context('pix+ droit', () => {

              it('should generate challenges for expert badge only if both maitre and expert badges are acquired', async function() {
                // given
                sinon.spy(CertificationCourse, 'from');
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
                const certifiableBadgeAcquisition1 = domainBuilder.buildBadgeAcquisition({ badge: maitreBadge });
                const certifiableBadgeAcquisition2 = domainBuilder.buildBadgeAcquisition({ badge: expertBadge });
                badgeAcquisitionRepository.findCertifiable
                  .withArgs({ userId, domainTransaction })
                  .resolves([certifiableBadgeAcquisition1, certifiableBadgeAcquisition2]);
                certificationChallengesService.pickCertificationChallengesForPixPlus
                  .withArgs(maitreBadge, userId)
                  .resolves(challengesForMaitre)
                  .withArgs(expertBadge, userId)
                  .resolves(challengesForExpert);
                const expectedChallenges = [challenge1, challenge2, ...challengesForExpert];

                // when
                await retrieveLastOrCreateCertificationCourse({
                  sessionId,
                  accessCode,
                  userId,
                  ...parameters,
                });

                // then
                expect(CertificationCourse.from).to.have.been.calledWith({
                  certificationCandidate: foundCertificationCandidate,
                  challenges: expectedChallenges,
                  maxReachableLevelOnCertificationDate: 5,
                });
              });
            });
          });

          context('when user has no certifiable badges with pix plus', async function() {

            beforeEach(() => {
              sinon.spy(CertificationCourse, 'from');
              badgeAcquisitionRepository.findCertifiable.withArgs({ userId, domainTransaction }).resolves([]);
              certificationChallengesService.pickCertificationChallengesForPixPlus.throws();
            });

            it('should save only the challenges from pix', async function() {
              // given
              const expectedChallenges = [challenge1, challenge2];
              // when
              await retrieveLastOrCreateCertificationCourse({
                sessionId,
                accessCode,
                userId,
                ...parameters,
              });

              // then
              expect(CertificationCourse.from).to.have.been.calledWith({
                certificationCandidate: foundCertificationCandidate,
                challenges: expectedChallenges,
                maxReachableLevelOnCertificationDate: 5,
              });
            });
          });
        });
      });
    });
  });
});
