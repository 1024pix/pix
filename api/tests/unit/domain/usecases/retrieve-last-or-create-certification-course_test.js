const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const { UserNotAuthorizedToCertifyError, NotFoundError } = require('../../../../lib/domain/errors');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const userService = require('../../../../lib/domain/services/user-service');
const retrieveLastOrCreateCertificationCourse = require('../../../../lib/domain/usecases/retrieve-last-or-create-certification-course');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');

describe('Unit | UseCase | retrieve-last-or-create-certification-course', () => {

  describe('#retrieveLastOrCreateCertificationCourse', () => {

    const fiveCompetencesWithLevelHigherThan0 = [
      { id: 'competence1', pixScore: 8, estimatedLevel: 1 },
      { id: 'competence2', pixScore: 0, estimatedLevel: 0 },
      { id: 'competence3', pixScore: 24, estimatedLevel: 3 },
      { id: 'competence4', pixScore: 32, estimatedLevel: 4 },
      { id: 'competence5', pixScore: 40, estimatedLevel: 5 },
      { id: 'competence6', pixScore: 48, estimatedLevel: 6 },
    ];

    context('when a certification course already exists for given sessionId and userId', () => {

      let userId;
      let sessionId;
      let accessCode;
      let certificationCourse;

      beforeEach(() => {
        userId = 12345;
        sessionId = 23;
        accessCode = 'ABCD12';
        certificationCourse = domainBuilder.buildCertificationCourse({ id: 'newlyCreatedCertificationCourse', sessionId, userId, createdAt: new Date('2018-12-12T01:02:03Z') });

        sinon.stub(sessionRepository, 'getByAccessCode').resolves({ id: sessionId });
        sinon.stub(certificationCourseRepository, 'save').resolves();
      });

      context('when a certification course already exists from the beginning', () => {

        beforeEach(() => {
          sinon.stub(certificationCourseRepository, 'getLastCertificationCourseByUserIdAndSessionId').resolves(certificationCourse);
        });

        it('should get last started certification course for given sessionId and userId', async function() {
          // when
          const result = await retrieveLastOrCreateCertificationCourse({
            accessCode,
            userId,
            sessionRepository,
            userService,
            certificationChallengesService,
            certificationCourseRepository,
            assessmentRepository,
          });

          // then
          expect(result).to.deep.equal({
            created: false,
            certificationCourse
          });
        });

      });

      context('when a certification course has been created meanwhile', () => {

        beforeEach(() => {
          sinon.stub(certificationCourseRepository, 'getLastCertificationCourseByUserIdAndSessionId')
            .onFirstCall().rejects(new NotFoundError())
            .onSecondCall().resolves(certificationCourse);
          const certificationProfile = { userCompetences: fiveCompetencesWithLevelHigherThan0 };
          sinon.stub(userService, 'getCertificationProfile').resolves(certificationProfile);
          sinon.stub(userService, 'fillCertificationProfileWithCertificationChallenges').withArgs(certificationProfile).resolves(certificationProfile);
        });

        it('should get last started certification course for given sessionId and userId', async function() {
          // when
          const result = await retrieveLastOrCreateCertificationCourse({
            accessCode,
            userId,
            sessionRepository,
            userService,
            certificationChallengesService,
            certificationCourseRepository,
            assessmentRepository,
          });

          // then
          expect(result).to.deep.equal({
            created: false,
            certificationCourse
          });
        });

      });

    });

    context('when the session does not exist', function() {
      let userId;
      let accessCode;

      beforeEach(() => {
        userId = 12345;
        accessCode = 'ABCD12';

        sinon.stub(sessionRepository, 'getByAccessCode').rejects(new NotFoundError());
      });

      it('should rejects an error when the session does not exist',  async function() {
        // when
        const result = await catchErr(retrieveLastOrCreateCertificationCourse)({
          accessCode,
          userId,
          sessionRepository,
          userService,
          certificationChallengesService,
          certificationCourseRepository,
          assessmentRepository,
        });

        // then
        expect(result).to.be.instanceOf(NotFoundError);
      });
    });

    context('when no certification course already exists for given sessionId and userId', function() {

      let userId;
      let sessionId;
      let accessCode;
      let certificationCourse;
      let certificationCourseWithNbOfChallenges;

      const now = new Date('2019-01-01T05:06:07Z');
      let clock;

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

        sinon.stub(sessionRepository, 'getByAccessCode').resolves({ id: sessionId });
        sinon.stub(certificationCourseRepository, 'getLastCertificationCourseByUserIdAndSessionId').rejects(new NotFoundError());

        clock = sinon.useFakeTimers(now);
      });

      afterEach(() => {
        clock.restore();
      });

      [
        { label: 'User Has No AirtableCompetence', competences: noCompetences },
        { label: 'User Has Only 1 AirtableCompetence at Level 0', competences: oneCompetenceWithLevel0 },
        { label: 'User Has Only 1 AirtableCompetence at Level 5', competences: oneCompetenceWithLevel5 },
        { label: 'User Has 5 Competences with 1 at Level 0', competences: fiveCompetencesAndOneWithLevel0 },
      ].forEach(function(testCase) {

        it(`should not create a new certification if ${testCase.label}`, async function() {
          // given
          const certificationProfile = { userCompetences: testCase.competences };
          sinon.stub(userService, 'getCertificationProfile').withArgs({ userId, limitDate: now }).resolves(certificationProfile);
          sinon.stub(userService, 'fillCertificationProfileWithCertificationChallenges').withArgs(certificationProfile).resolves(certificationProfile);
          sinon.stub(certificationCourseRepository, 'save');
          sinon.stub(assessmentRepository, 'save');

          // when
          const result = await catchErr(retrieveLastOrCreateCertificationCourse)({
            accessCode,
            userId,
            sessionRepository,
            userService,
            certificationChallengesService,
            certificationCourseRepository,
            assessmentRepository,
          });

          // then
          expect(result).to.be.an.instanceOf(UserNotAuthorizedToCertifyError);
          sinon.assert.notCalled(certificationCourseRepository.save);
          sinon.assert.notCalled(assessmentRepository.save);
        });
      });

      it('should create the certification course with status "started", if at least 5 competences with level higher than 0', async function() {
        // given
        const certificationProfile = { userCompetences: fiveCompetencesWithLevelHigherThan0 };
        sinon.stub(userService, 'getCertificationProfile').withArgs({ userId, limitDate: now })
          .resolves(certificationProfile);
        sinon.stub(userService, 'fillCertificationProfileWithCertificationChallenges').withArgs(certificationProfile)
          .resolves(certificationProfile);
        sinon.stub(certificationChallengesService, 'saveChallenges').resolves(certificationCourseWithNbOfChallenges);
        sinon.stub(certificationCourseRepository, 'save').resolves(certificationCourse);
        sinon.stub(assessmentRepository, 'save').resolves();

        // when
        const newCertification = await retrieveLastOrCreateCertificationCourse({
          accessCode,
          userId,
          sessionRepository,
          userService,
          certificationChallengesService,
          certificationCourseRepository,
          assessmentRepository,
        });

        // then
        expect(newCertification).to.deep.equal({
          created: true,
          certificationCourse: certificationCourseWithNbOfChallenges
        });
        sinon.assert.calledOnce(assessmentRepository.save);
      });

    });

  });

});
