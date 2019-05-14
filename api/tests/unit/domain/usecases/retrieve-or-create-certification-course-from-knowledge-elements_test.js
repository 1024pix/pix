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

    const userKnowledgeElementsWithChallengeId = [{
      answerId: 43744,
      assessmentId: 68997,
      challengeId: 'rec123456',
      competenceId: 'rec0956165c-4417-4d27-82ad-650df872ee15',
      createdAt: '2018-01-01T00:00:00.000Z',
      earnedPix: 2,
      id: 32704,
      skillId: 'recf04956d8-8794-4361-8341-51b00d78a40a',
      source: 'direct',
      status: 'validated',
      userId: 1,
    }];

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

      sinon.stub(certificationChallengesService, 'getUserKnowledgeElementsWithChallengeId')
        .withArgs(userId, sinon.match.any)
        .resolves(userKnowledgeElementsWithChallengeId);

      sinon.stub(certificationChallengesService, 'groupUserKnowledgeElementsByCompetence')
        .withArgs(userKnowledgeElementsWithChallengeId)
        .resolves(['B']);

      // TODO: [PF-577] Ajouter l'étape de tri des 3 KE de plus haut niveau par compétence.

      /*      sinon.stub(certificationChallengesService, 'sortUserKnowledgeElementsHighterSkillsFirstByCompetence')
              .withArgs(['B'])
              .resolves(['C']);*/

      sinon.stub(certificationChallengesService, 'findChallengesBySkills')
        .withArgs(['C'])
        .resoves(['challenges links to C']);

      // TODO: [PF-577] Ajouter une étape pour récupérer les varaiantes des questions.

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
