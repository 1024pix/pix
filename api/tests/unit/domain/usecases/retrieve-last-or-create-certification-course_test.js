const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const { UserNotAuthorizedToCertifyError, NotFoundError } = require('../../../../lib/domain/errors');
const retrieveLastOrCreateCertificationCourse = require('../../../../lib/domain/usecases/retrieve-last-or-create-certification-course');
const Assessment = require('../../../../lib/domain/models/Assessment');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const _ = require('lodash');

describe('Unit | UseCase | retrieve-last-or-create-certification-course', function() {

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
    certificationChallengesService,
    placementProfileService,
  };

  beforeEach(function() {
    clock = sinon.useFakeTimers(now);
    sinon.stub(certificationChallengesService, 'pickCertificationChallenges');
  });

  afterEach(function() {
    clock.restore();
    certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.reset();
  });

  context('when session access code is different from provided access code', function() {

    beforeEach(function() {
      foundSession = { accessCode: 'differentAccessCode' };
      sessionRepository.get.withArgs(sessionId).resolves(foundSession);
    });

    it('should throw a not found error', async function() {
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

  context('when session access code is the same as the provided access code', function() {

    beforeEach(function() {
      foundSession = { accessCode };
      sessionRepository.get.withArgs(sessionId).resolves(foundSession);
    });

    context('when a certification course with provided userId and sessionId already exists', function() {

      let existingCertificationCourse;
      beforeEach(function() {
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

    context('when no certification course exists for this userId and sessionId', function() {
      let placementProfile;
      let competences;

      beforeEach(function() {
        competences = [{ id: 'rec123' }, { id: 'rec456' }];
        competenceRepository.listPixCompetencesOnly.resolves(competences);
        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
          .withArgs({ userId, sessionId, domainTransaction }).onCall(0).resolves(null);
      });

      context('when the user is not certifiable', function() {

        beforeEach(function() {
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

      context('when user is certifiable', function() {

        const skill1 = domainBuilder.buildSkill();
        const skill2 = domainBuilder.buildSkill();
        const challenge1 = domainBuilder.buildChallenge();
        const challenge2 = domainBuilder.buildChallenge();

        beforeEach(function() {
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

        context('when a certification course has been created meanwhile', function() {

          let existingCertificationCourse;
          beforeEach(function() {
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

          it('should have filled the certification profile with challenges anyway', async function() {
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

        context('when a certification still has not been created meanwhile', function() {

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

          beforeEach(function() {
            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId, sessionId, domainTransaction }).onCall(1).resolves(null);
            placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now }).resolves(placementProfile);
            certificationCandidateRepository.getBySessionIdAndUserId.withArgs({ sessionId, userId }).resolves(foundCertificationCandidate);
            certificationCourseRepository.save.resolves(savedCertificationCourse);
            assessmentRepository.save.resolves(savedAssessment);
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
        });
      });
    });
  });
});
