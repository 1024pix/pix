const { expect, sinon, domainBuilder } = require('../../../test-helper');

const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
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

    const userCompetences = [
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

    let knowledgeElementOnUrl2;
    let knowledgeElementOnUrl3;
    let knowledgeElementOnUrl4;
    let knowledgeElementOnUrl5;
    let knowledgeElementOnText1;

    let skillUrl5;
    let skillUrl4;
    let skillUrl3;
    let skillText1;

    let challengeUrl5;
    let challengeUrl4;
    let challengeUrl3;
    let challengeText1;

    let userKnowledgeElementsWithChallengeId;

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

      knowledgeElementOnUrl2 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
      knowledgeElementOnUrl3 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
      knowledgeElementOnUrl4 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
      knowledgeElementOnUrl5 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
      knowledgeElementOnText1 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence2' });

      knowledgeElementOnUrl2.challengeId = 'recChallengeOnUrl2';
      knowledgeElementOnUrl3.challengeId = 'recChallengeOnUrl3';
      knowledgeElementOnUrl4.challengeId = 'recChallengeOnUrl4';
      knowledgeElementOnUrl5.challengeId = 'recChallengeOnUrl5';
      knowledgeElementOnText1.challengeId = 'recChallengeOnText1';

      skillUrl5 = domainBuilder.buildSkill({ id: knowledgeElementOnUrl5.skillId, name: '@url5' });
      skillUrl4 = domainBuilder.buildSkill({ id: knowledgeElementOnUrl4.skillId, name: '@url4' });
      skillUrl3 = domainBuilder.buildSkill({ id: knowledgeElementOnUrl3.skillId, name: '@url3' });
      skillText1 = domainBuilder.buildSkill({ id: knowledgeElementOnText1.skillId, name: '@text1' });

      challengeUrl5 = domainBuilder.buildChallenge({ skills: [skillUrl5] });
      challengeUrl4 = domainBuilder.buildChallenge({ skills: [skillUrl4] });
      challengeUrl3 = domainBuilder.buildChallenge({ skills: [skillUrl3] });
      challengeText1 = domainBuilder.buildChallenge({ skills: [skillText1] });

      userKnowledgeElementsWithChallengeId = [knowledgeElementOnUrl2];
    });

    it('should create the certification course and add challenges', async function() {
      // given
      sinon.stub(certificationCourseRepository, 'save')
        .resolves(certificationCourse);

      const allChallenges = Symbol('Liste de Challenge');

      sinon.stub(challengeRepository, 'list')
        .resolves(allChallenges);

      sinon.stub(competenceRepository, 'list')
        .resolves(['list de competences']);

      sinon.stub(certificationChallengesService, 'getUserKnowledgeElementsWithChallengeId')
        .withArgs(userId, sinon.match.any)
        .resolves(userKnowledgeElementsWithChallengeId);

      const knowledgeElementsWithChallengeIdsByCompetences = {
        'recCompetence1': [userKnowledgeElementsWithChallengeId]
      };
      sinon.stub(certificationChallengesService, 'groupUserKnowledgeElementsByCompetence')
        .withArgs(userKnowledgeElementsWithChallengeId)
        .resolves(knowledgeElementsWithChallengeIdsByCompetences);

      // TODO: [PF-577] Ajouter l'étape de tri des KE par niveau par compétence (les plus hauts en premier).

      /*      sinon.stub(certificationChallengesService, 'sortUserKnowledgeElementsHighterSkillsFirstByCompetence')
              .withArgs(['B'])
              .resolves(['C']);*/

      // TODO: [PF-577] Supprimer les challenges auxquels le user a déjà répondu (du boulot)
      // Est-ce que c'est plus haut ?

      const selectedKnowledgeElementsWithChallengeId = {
        'recCompetence1': [userKnowledgeElementsWithChallengeId]
      };

      sinon.stub(certificationChallengesService, 'selectThreeKnowledgeElementsHigherSkillsByCompetence')
        .withArgs(knowledgeElementsWithChallengeIdsByCompetences)
        .resolves(selectedKnowledgeElementsWithChallengeId);

      sinon.stub(certificationChallengesService, 'findChallengesByCompetenceId')
        .withArgs(allChallenges, selectedKnowledgeElementsWithChallengeId)
        .resolves({
          'recCompetence1': [challengeUrl5, challengeUrl4, challengeUrl3],
          'recCompetence2': [challengeText1]
        });

      // TODO: [PF-577] Ajouter une étape pour récupérer les varaiantes des questions.

      // TODO: [PF-577] Ajouter les testedSkills (source de donnée: skill.name) aux challenges.

      // TODO: [PF-577] Créer un objet certification profile (contenant une liste de userCompetence)

      sinon.stub(certificationChallengesService, 'saveChallenges')
        .withArgs(certificationCourse, userCompetences)
        .resolves(certificationCourseWithNbOfChallenges);

      // when
      const newCertification = await retrieveOrCreateCertificationCourseFromKnowledgeElements({
        userId,
        sessionId,
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
