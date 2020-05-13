const { expect, sinon, catchErr } = require('../../../test-helper');

const { UserNotAuthorizedToCertifyError, NotFoundError } = require('../../../../lib/domain/errors');
const retrieveLastOrCreateCertificationCourse = require('../../../../lib/domain/usecases/retrieve-last-or-create-certification-course');
const Assessment = require('../../../../lib/domain/models/Assessment');

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
  const certificationCourseRepository = {
    findOneCertificationCourseByUserIdAndSessionId: sinon.stub(),
    save: sinon.stub(),
  };
  const sessionRepository = { get: sinon.stub() };
  const certificationChallengesService = { generateCertificationChallenges: sinon.stub() };
  const userService = {
    fillCertificationProfileWithChallenges: sinon.stub(),
    getCertificationProfile: sinon.stub(),
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
    userService,
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
      let certificationProfile;
      let competences;

      beforeEach(() => {
        competences = [{ id: 'rec123' }, { id: 'rec456' }];
        competenceRepository.listPixCompetencesOnly.resolves(competences);
        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
          .withArgs({ userId, sessionId, domainTransaction }).onCall(0).resolves(null);
      });

      context('when the user is not certifiable', () => {

        beforeEach(() => {
          certificationProfile = { isCertifiable: sinon.stub().returns(false) };
          userService.getCertificationProfile.withArgs({ userId, limitDate: now, competences }).resolves(certificationProfile);
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

        beforeEach(() => {
          certificationProfile = { isCertifiable: sinon.stub().returns(true), userCompetences: 'someUserCompetences' };
          userService.getCertificationProfile.withArgs({ userId, limitDate: now, competences }).resolves(certificationProfile);
          userService.fillCertificationProfileWithChallenges.withArgs(certificationProfile).resolves(certificationProfile);
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
            expect(userService.fillCertificationProfileWithChallenges).to.have.been.calledWith(certificationProfile);
          });

        });

        context('when a certification still has not been created meanwhile', () => {

          const foundCertificationCandidate = {
            firstName: Symbol('firstName'),
            lastName: Symbol('lastName'),
            birthdate: Symbol('birthdate'),
            birthCity: Symbol('birthCity'),
            externalId: Symbol('externalId'),
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
          const savedCertificationCourse = {
            id: 'savedCertificationCourse',
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
          const challenge1 = 'challenge1';
          const challenge2 = 'challenge2';
          const generatedCertificationChallenges = [challenge1, challenge2];
          const savedCertificationChallenge1 = {
            id: 'savedCertificationChallenge1',
          };
          const savedCertificationChallenge2 = {
            id: 'savedCertificationChallenge2',
          };

          beforeEach(() => {
            certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId
              .withArgs({ userId, sessionId, domainTransaction }).onCall(1).resolves(null);
            userService.getCertificationProfile.withArgs({ userId, limitDate: now, competences }).resolves(certificationProfile);
            certificationCandidateRepository.getBySessionIdAndUserId.withArgs({ sessionId, userId }).resolves(foundCertificationCandidate);
            certificationCourseRepository.save.resolves(savedCertificationCourse);
            assessmentRepository.save.resolves(savedAssessment);
            certificationChallengesService.generateCertificationChallenges
              .withArgs(certificationProfile.userCompetences, savedCertificationCourse.id).returns(generatedCertificationChallenges);
            certificationChallengeRepository.save.withArgs({ certificationChallenge: challenge1, domainTransaction }).resolves(savedCertificationChallenge1);
            certificationChallengeRepository.save.withArgs({ certificationChallenge: challenge2, domainTransaction }).resolves(savedCertificationChallenge2);
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
