const { expect, sinon, domainBuilder } = require('../../../test-helper');

const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const userService = require('../../../../lib/domain/services/user-service');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const { retrieveOrCreateCertificationCourseFromKnowledgeElements } = require('../../../../lib/domain/usecases');

describe.skip('Unit | UseCase | retrieve-or-create-certification-course-from-knowledge-elements', () => {

  // TODO: [PF-577] Creuser le sessionExist() -> Controller porte la logique de renvoyer un 404
  //  lorsque la session n'existe pas ?

  describe('#retrieveOrCreateCertificationCourseFromKnowledgeElements', () => {

    let userId;
    let sessionId;
    let certificationCourse;
    let certificationCourseWithNbOfChallenges;

    const userCompetencesAndChallenges = [
      {
        id: 'competenceRecordIdTwo',
        index: '1.2',
        name: '1.2 Adopter un dauphin',
        skills: ['skillRemplir4', 'skillUrl3', 'skillRemplir2'],
        pixScore: 23,
        estimatedLevel: 2,
        challenges: ['challengeForSkillRemplir4', 'challengeForSkillUrl3', 'challengeForSkillRemplir2']
      }
    ];

    beforeEach(() => {
      userId = 12345;
      sessionId = 23;
      certificationCourse = domainBuilder.buildCertificationCourse({ sessionId, userId });
      certificationCourseWithNbOfChallenges = domainBuilder.buildCertificationCourse({
        id: 'certificationCourseWithChallenges',
        sessionId,
        userId,
        createdAt: new Date('2018-12-12T01:02:03Z'),
        nbChallenges: 3
      });
    });

    it('should create the certification course and add challenges', async function() {
      // given
      sinon.stub(certificationCourseRepository, 'save')
        .resolves(certificationCourse);

      sinon.stub(challengeRepository, 'list')
        .resolves(['list de challenges']);

      sinon.stub(competenceRepository, 'list')
        .resolves(['list de competences']);

      sinon.stub(certificationChallengesService, 'getUserKnowledgeElementsWithAnswersAndSkills')
        .withArgs(userId, sinon.match.any)
        .resolves(['A']);

      sinon.stub(certificationChallengesService, 'groupUserKnowledgeElementsByCompetence')
        .withArgs(['A'])
        .resolves(['B']);

      sinon.stub(certificationChallengesService, 'sortUserKnowledgeElementsHighterSkillsFirstByCompetence')
        .withArgs(['B'])
        .resolves(['C']);

      sinon.stub(certificationChallengesService, 'sortUserKnowledgeElementsHighterSkillsFirstByCompetence')
        .withArgs(['B'])
        .resolves(['C']);

      sinon.stub(certificationChallengesService, 'findChallengesBySkills')
        .withArgs(['C'])
        .resoves(['challenges links to C']);

      sinon.stub(certificationChallengesService, 'saveChallenges')
        .withArgs(certificationCourse, userCompetencesAndChallenges)
        .resolves(certificationCourseWithNbOfChallenges);

      // when
      const newCertification = await retrieveOrCreateCertificationCourseFromKnowledgeElements({
        userId,
        sessionId,
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
  });
});
