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
        certificationCourse = domainBuilder.buildCertificationCourse({ id: 'newlyCreatedCertificationCourse', sessionId, userId, createdAt: '2018-12-12' });
        oldCertificationCourse = domainBuilder.buildCertificationCourse({ id: 'oldCertificationCourse', sessionId, userId, createdAt: '2018-11-11' });

        sinon.stub(sessionService, 'sessionExists').resolves(sessionId);
        sinon.stub(certificationCourseRepository, 'findLastCertificationCourseByUserIdAndSessionId').resolves([certificationCourse, oldCertificationCourse]);
      });

      it('should get last started certification course for given sessionId and userId', async function() {
        // when
        const result = await retrieveLastOrCreateCertificationCourse({ accessCode, userId, sessionService, userService, certificationChallengesService, certificationCourseRepository });

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
        certificationCourse = domainBuilder.buildCertificationCourse({ id: 'newlyCreatedCertificationCourse', sessionId, userId, createdAt: '2018-12-12' });

        sinon.stub(sessionService, 'sessionExists').rejects(new NotFoundError());
        sinon.stub(certificationCourseRepository, 'findLastCertificationCourseByUserIdAndSessionId').resolves(certificationCourse);
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
      const oneCompetenceWithLevel0 = [{ id: 'competence1', estimatedLevel: 0 }];
      const oneCompetenceWithLevel5 = [{ id: 'competence1', estimatedLevel: 5 }];
      const fiveCompetencesAndOneWithLevel0 = [
        { id: 'competence1', estimatedLevel: 1 },
        { id: 'competence2', estimatedLevel: 2 },
        { id: 'competence3', estimatedLevel: 0 },
        { id: 'competence4', estimatedLevel: 4 },
        { id: 'competence5', estimatedLevel: 5 },
      ];
      const fiveCompetencesWithLevelHigherThan0 = [
        { id: 'competence1', estimatedLevel: 1 },
        { id: 'competence2', estimatedLevel: 0 },
        { id: 'competence3', estimatedLevel: 3 },
        { id: 'competence4', estimatedLevel: 4 },
        { id: 'competence5', estimatedLevel: 5 },
        { id: 'competence6', estimatedLevel: 6 },
      ];

      beforeEach(() => {
        userId = 12345;
        sessionId = 23;
        accessCode = 'ABCD12';
        certificationCourse = domainBuilder.buildCertificationCourse({ id: 'newlyCreatedCertificationCourse', sessionId, userId, createdAt: '2018-12-12' });
        certificationCourseWithNbOfChallenges = domainBuilder.buildCertificationCourse({ id: 'certificationCourseWithChallenges', sessionId, userId, createdAt: '2018-12-12', nbChallenges: 3 });

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
          sinon.stub(userService, 'getProfileToCertify').resolves(testCase.competences);
          sinon.stub(certificationCourseRepository, 'save');

          // when
          const createNewCertificationPromise = retrieveLastOrCreateCertificationCourse({ accessCode, userId, sessionService, userService, certificationChallengesService, certificationCourseRepository });

          // then
          return createNewCertificationPromise.catch((error) => {
            expect(error).to.be.an.instanceOf(UserNotAuthorizedToCertifyError);
            sinon.assert.notCalled(certificationCourseRepository.save);
          });
        });
      });

      it('should create the certification course with status "started", if at least 5 competences with level higher than 0', async function() {
        // given
        sinon.stub(certificationCourseRepository, 'save').resolves(certificationCourse);
        sinon.stub(userService, 'getProfileToCertify').resolves(fiveCompetencesWithLevelHigherThan0);
        sinon.stub(certificationChallengesService, 'saveChallenges').resolves(certificationCourseWithNbOfChallenges);

        // when
        const newCertification = await retrieveLastOrCreateCertificationCourse({ accessCode, userId, sessionService, userService, certificationChallengesService, certificationCourseRepository });

        // then
        expect(newCertification).to.deep.equal({
          created: true,
          certificationCourse: certificationCourseWithNbOfChallenges
        });
      });
    });
  });
});
