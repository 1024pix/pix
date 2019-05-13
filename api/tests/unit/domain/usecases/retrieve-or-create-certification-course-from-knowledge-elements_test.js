const { expect, sinon, domainBuilder} = require('../../../test-helper');

const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const sessionService = require('../../../../lib/domain/services/session-service');
const userService = require('../../../../lib/domain/services/user-service');
const { retrieveOrCreateCertificationCourseFromKnowledgeElements } = require('../../../../lib/domain/usecases');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');

describe.skip('Unit | UseCase | retrieve-or-create-certification-course-from-knowledge-elements', () => {

  // TODO: [PF-577] Creuser le sessionExist() -> Controller porte la logique de renvoyer un 404
  //  lorsque la session n'existe pas ?

  describe('#retrieveOrCreateCertificationCourseFromKnowledgeElements', () => {

    let userId;
    let sessionId;
    let accessCode;
    let certificationCourse;
    let certificationCourseWithNbOfChallenges;

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
      certificationCourse = domainBuilder.buildCertificationCourse({ sessionId, userId });
      certificationCourseWithNbOfChallenges = domainBuilder.buildCertificationCourse({ id: 'certificationCourseWithChallenges', sessionId, userId, createdAt: new Date('2018-12-12T01:02:03Z'), nbChallenges: 3 });

      sinon.stub(sessionService, 'sessionExists').resolves(sessionId);
      sinon.stub(certificationCourseRepository, 'findLastCertificationCourseByUserIdAndSessionId').resolves([]);
    });

    it('should create the certification course with status "started"', async function() {
      // given
      sinon.stub(certificationCourseRepository, 'save')
        .resolves(certificationCourse);
      sinon.stub(userService, 'getProfileToCertify')
        .withArgs(userId, sinon.match.any)
        .resolves(fiveCompetencesWithLevelHigherThan0);
      sinon.stub(certificationChallengesService, 'saveChallenges')
        .withArgs(fiveCompetencesWithLevelHigherThan0, certificationCourse)
        .resolves(certificationCourseWithNbOfChallenges);

      // when
      const newCertification = await retrieveOrCreateCertificationCourseFromKnowledgeElements({ accessCode, userId, sessionService, userService, certificationChallengesService, certificationCourseRepository });

      // then
      expect(newCertification).to.deep.equal({
        created: true,
        certificationCourse: certificationCourseWithNbOfChallenges
      });
    });
  });
});
