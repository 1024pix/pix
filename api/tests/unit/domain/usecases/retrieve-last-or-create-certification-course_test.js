const { expect, sinon, domainBuilder } = require('../../../test-helper');

const { UserNotAuthorizedToCertifyError, NotFoundError } = require('../../../../lib/domain/errors');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const sessionService = require('../../../../lib/domain/services/session-service');
const userService = require('../../../../lib/domain/services/user-service');
const retrieveLastOrCreateCertificationCourse = require('../../../../lib/domain/usecases/retrieve-last-or-create-certification-course');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');

describe('Unit | UseCase | retrieve-last-or-create-certification-course', () => {

  describe('#retrieveLastOrCreateCertificationCourse', () => {

    context('when a certification course already exists for given sessionId and userId', function() {

      let userId;
      let sessionId;
      let accessCode;
      let certificationCourse;
      let oldCertificationCourse;

      beforeEach(() => {
        userId = 12345;
        sessionId = 23;
        accessCode = 'ABCD12';
        certificationCourse = domainBuilder.buildCertificationCourse({ id: 'newlyCreatedCertificationCourse', sessionId, userId, createdAt: new Date('2018-12-12T01:02:03Z') });
        oldCertificationCourse = domainBuilder.buildCertificationCourse({ id: 'oldCertificationCourse', sessionId, userId, createdAt: new Date('2018-11-11T01:02:03Z') });

        sinon.stub(sessionService, 'sessionExists').resolves(sessionId);
        sinon.stub(certificationCourseRepository, 'findLastCertificationCourseByUserIdAndSessionId').resolves([certificationCourse, oldCertificationCourse]);
        sinon.stub(certificationCourseRepository, 'save').resolves();
      });

      it('should get last started certification course for given sessionId and userId', async function() {
        // when
        const result = await retrieveLastOrCreateCertificationCourse({
          accessCode,
          userId,
          sessionService,
          userService,
          certificationChallengesService,
          certificationCourseRepository
        });

        // then
        expect(result).to.deep.equal({
          created: false,
          certificationCourse
        });
      });
    });

    context('when the session does not exist', function() {
      let userId;
      let sessionId;
      let accessCode;
      let certificationCourse;

      beforeEach(() => {
        userId = 12345;
        sessionId = 23;
        accessCode = 'ABCD12';
        certificationCourse = domainBuilder.buildCertificationCourse({ id: 'newlyCreatedCertificationCourse', sessionId, userId, createdAt: new Date('2018-12-12T01:02:03Z') });

        sinon.stub(sessionService, 'sessionExists').rejects(new NotFoundError());
        sinon.stub(certificationCourseRepository, 'findLastCertificationCourseByUserIdAndSessionId').resolves(certificationCourse);
        sinon.stub(certificationCourseRepository, 'save').resolves();
      });

      it('should rejects an error when the session does not exist',  function() {
        // when
        const promise = retrieveLastOrCreateCertificationCourse({ accessCode, userId, sessionService, userService, certificationChallengesService, certificationCourseRepository });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });

    context('when no certification course already exists for given sessionId and userId', function() {

      let userId;
      let sessionId;
      let accessCode;
      let certificationCourse;
      let certificationCourseWithNbOfChallenges;

      const noCompetences = [];
      const oneCompetenceWithLevel0 = [{ id: 'competence1', pixScore: 0, estimatedLevel: 0 }];
      const oneCompetenceWithLevel5 = [{ id: 'competence1', pixScore: 40, estimatedLevel: 5 }];
      const fiveCompetencesAndOneWithLevel0 = [
        { id: 'competence1', pixScore: 8, estimatedLevel: 1 },
        { id: 'competence2', pixScore: 16, estimatedLevel: 2 },
        { id: 'competence3', pixScore: 0, estimatedLevel: 0 },
        { id: 'competence4', pixScore: 32, estimatedLevel: 4 },
        { id: 'competence5', pixScore: 40, estimatedLevel: 5 },
      ];
      const fiveCompetencesWithLevelHigherThan0 = [
        { id: 'competence1', pixScore: 8, estimatedLevel: 1 },
        { id: 'competence2', pixScore: 0, estimatedLevel: 0 },
        { id: 'competence3', pixScore: 24, estimatedLevel: 3 },
        { id: 'competence4', pixScore: 32, estimatedLevel: 4 },
        { id: 'competence5', pixScore: 40, estimatedLevel: 5 },
        { id: 'competence6', pixScore: 48, estimatedLevel: 6 },
      ];
      const fiveCompetencesWithLevelHigherThan0WithHigherScore = [
        { id: 'competence1', pixScore: 40, estimatedLevel: 5 },
        { id: 'competence2', pixScore: 40, estimatedLevel: 5 },
        { id: 'competence3', pixScore: 40, estimatedLevel: 5 },
        { id: 'competence4', pixScore: 40, estimatedLevel: 5 },
        { id: 'competence5', pixScore: 40, estimatedLevel: 5 },
        { id: 'competence6', pixScore: 48, estimatedLevel: 6 },
      ];
      const nonCertifiableUserCompetencesWithHigherScore = [
        { id: 'competence1', pixScore: 48, estimatedLevel: 6 },
        { id: 'competence2', pixScore: 48, estimatedLevel: 6 },
        { id: 'competence3', pixScore: 48, estimatedLevel: 6 },
        { id: 'competence4', pixScore: 48, estimatedLevel: 6 },
      ];

      beforeEach(() => {
        userId = 12345;
        sessionId = 23;
        accessCode = 'ABCD12';

        certificationCourse = domainBuilder.buildCertificationCourse({
          id: 'newlyCreatedCertificationCourse',
          sessionId,
          userId,
          createdAt: new Date('2018-12-12T01:02:03Z')
        });

        certificationCourseWithNbOfChallenges = domainBuilder.buildCertificationCourse({
          id: 'certificationCourseWithChallenges',
          sessionId,
          userId,
          createdAt: new Date('2018-12-12T01:02:03Z'),
          nbChallenges: 3
        });

        sinon.stub(sessionService, 'sessionExists').resolves(sessionId);
        sinon.stub(certificationCourseRepository, 'findLastCertificationCourseByUserIdAndSessionId').resolves([]);
      });

      [{ label: 'User Has No AirtableCompetence', competences: noCompetences },
        { label: 'User Has Only 1 AirtableCompetence at Level 0', competences: oneCompetenceWithLevel0 },
        { label: 'User Has Only 1 AirtableCompetence at Level 5', competences: oneCompetenceWithLevel5 },
        { label: 'User Has 5 Competences with 1 at Level 0', competences: fiveCompetencesAndOneWithLevel0 },
      ].forEach(function(testCase) {
        it(`should not create a new certification if ${testCase.label}`, function() {
          // given
          sinon.stub(userService, 'getProfileToCertifyV1').resolves(testCase.competences);
          sinon.stub(userService, 'getProfileToCertifyV2').resolves([]);
          sinon.stub(certificationCourseRepository, 'save');

          // when
          const createNewCertificationPromise = retrieveLastOrCreateCertificationCourse({
            accessCode,
            userId,
            sessionService,
            userService,
            certificationChallengesService,
            certificationCourseRepository
          });

          // then
          return createNewCertificationPromise.catch((error) => {
            expect(error).to.be.an.instanceOf(UserNotAuthorizedToCertifyError);
            sinon.assert.notCalled(certificationCourseRepository.save);
          });
        });
      });

      it('should create the certification course with status "started", if at least 5 competences with level higher than 0', async function() {
        // given
        sinon.stub(userService, 'getProfileToCertifyV1').resolves(fiveCompetencesWithLevelHigherThan0);
        sinon.stub(userService, 'getProfileToCertifyV2').resolves([]);
        sinon.stub(certificationChallengesService, 'saveChallenges').resolves(certificationCourseWithNbOfChallenges);
        sinon.stub(certificationCourseRepository, 'save').resolves(certificationCourse);

        // when
        const newCertification = await retrieveLastOrCreateCertificationCourse({
          accessCode,
          userId,
          sessionService,
          userService,
          certificationChallengesService,
          certificationCourseRepository
        });

        // then
        expect(newCertification).to.deep.equal({
          created: true,
          certificationCourse: certificationCourseWithNbOfChallenges
        });
      });

      describe('choice of certification profile v1 or v2', () => {

        beforeEach(() => {
          sinon.stub(certificationCourseRepository, 'save').resolves();
        });

        it('should use certifiable profil V1 even when V2 has higher score but is not certifiable', async () => {
          // given
          sinon.stub(userService, 'getProfileToCertifyV1').resolves(fiveCompetencesWithLevelHigherThan0);
          sinon.stub(userService, 'getProfileToCertifyV2').resolves(nonCertifiableUserCompetencesWithHigherScore);
          sinon.stub(certificationChallengesService, 'saveChallenges').resolves();

          // when
          await retrieveLastOrCreateCertificationCourse({
            accessCode,
            userId,
            sessionService,
            userService,
            certificationChallengesService,
            certificationCourseRepository
          });

          // then
          expect(certificationChallengesService.saveChallenges)
            .to.have.been.calledWith(fiveCompetencesWithLevelHigherThan0, sinon.match.any);
          expect(certificationCourseRepository.save)
            .to.have.been.calledWithMatch({ isV2Certification: false });
        });

        it('should use certifiable profil V2 even when V1 has higher score but is not certifiable', async () => {
          // given
          sinon.stub(userService, 'getProfileToCertifyV1').resolves(nonCertifiableUserCompetencesWithHigherScore);
          sinon.stub(userService, 'getProfileToCertifyV2').resolves(fiveCompetencesWithLevelHigherThan0);
          sinon.stub(certificationChallengesService, 'saveChallenges').resolves();

          // when
          await retrieveLastOrCreateCertificationCourse({
            accessCode,
            userId,
            sessionService,
            userService,
            certificationChallengesService,
            certificationCourseRepository
          });

          // then
          expect(certificationChallengesService.saveChallenges)
            .to.have.been.calledWith(fiveCompetencesWithLevelHigherThan0, sinon.match.any);
          expect(certificationCourseRepository.save)
            .to.have.been.calledWithMatch({ isV2Certification: true });
        });

        it('should use certification profile v1 when v1 pix score is greater than v2', async () => {
          // given
          sinon.stub(userService, 'getProfileToCertifyV1').resolves(fiveCompetencesWithLevelHigherThan0WithHigherScore);
          sinon.stub(userService, 'getProfileToCertifyV2').resolves(fiveCompetencesWithLevelHigherThan0);
          sinon.stub(certificationChallengesService, 'saveChallenges').resolves();

          // when
          await retrieveLastOrCreateCertificationCourse({
            accessCode,
            userId,
            sessionService,
            userService,
            certificationChallengesService,
            certificationCourseRepository
          });

          // then
          expect(certificationChallengesService.saveChallenges)
            .to.have.been.calledWith(fiveCompetencesWithLevelHigherThan0WithHigherScore, sinon.match.any);
          expect(certificationCourseRepository.save)
            .to.have.been.calledWithMatch({ isV2Certification: false });
        });

        it('should use certification profile v2 when v2 pix score is greater than v1', async () => {
          // given
          sinon.stub(userService, 'getProfileToCertifyV1').resolves(fiveCompetencesWithLevelHigherThan0);
          sinon.stub(userService, 'getProfileToCertifyV2').resolves(fiveCompetencesWithLevelHigherThan0WithHigherScore);
          sinon.stub(certificationChallengesService, 'saveChallenges').resolves();

          // when
          await retrieveLastOrCreateCertificationCourse({
            accessCode,
            userId,
            sessionService,
            userService,
            certificationChallengesService,
            certificationCourseRepository
          });

          // then
          expect(certificationChallengesService.saveChallenges)
            .to.have.been.calledWith(fiveCompetencesWithLevelHigherThan0WithHigherScore, sinon.match.any);
          expect(certificationCourseRepository.save)
            .to.have.been.calledWithMatch({ isV2Certification: true });
        });
      });
    });
  });
});
