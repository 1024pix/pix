const { expect, sinon, domainBuilder } = require('../../../test-helper');

const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const { retrieveOrCreateCertificationCourseFromKnowledgeElements } = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | retrieve-or-create-certification-course-from-knowledge-elements', () => {

  // TODO: [PF-577] Creuser le sessionExist() -> Controller porte la logique de renvoyer un 404
  //  lorsque la session n'existe pas ?

  describe('#retrieveOrCreateCertificationCourseFromKnowledgeElements', () => {

    let userId;
    let sessionId;
    let certificationCourse;
    let certificationCourseWithNbOfChallenges;

    let allChallenges;

    let knowledgeElementOnUrl2;

    let skillUrl2;

    let challengeUrl2;

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
        nbChallenges: 1
      });

      knowledgeElementOnUrl2 = domainBuilder.buildSmartPlacementKnowledgeElement({
        skillId: 'recUrl2',
        competenceId: 'recCompetence1'
      });

      knowledgeElementOnUrl2.challengeId = 'recChallengeOnUrl2';

      skillUrl2 = domainBuilder.buildSkill({ id: knowledgeElementOnUrl2.skillId, name: '@url2' });

      challengeUrl2 = domainBuilder.buildChallenge({ skills: [skillUrl2] });
      const challengeNotUsed = domainBuilder.buildChallenge();

      allChallenges = [challengeUrl2, challengeNotUsed];
      sinon.stub(challengeRepository, 'list').resolves(allChallenges);

      userKnowledgeElementsWithChallengeId = [knowledgeElementOnUrl2];
    });

    it('should create the certification course and add challenges', async () => {
      // given
      sinon.stub(certificationChallengesService, 'getUserKnowledgeElementsWithChallengeId')
        .withArgs(userId, sinon.match.any)
        .resolves(userKnowledgeElementsWithChallengeId);

      sinon.spy(certificationChallengesService, 'groupUserKnowledgeElementsByCompetence');
      sinon.spy(certificationChallengesService, 'selectThreeKnowledgeElementsHigherSkillsByCompetence');
      sinon.spy(certificationChallengesService, 'findChallengesByCompetenceId');
      sinon.spy(certificationChallengesService, 'convertChallengesToUserCompetences');

      sinon.stub(certificationCourseRepository, 'save')
        .withArgs(sinon.match({ userId, sessionId }))
        .resolves(certificationCourse);

      const userCompetences = [
        {
          competenceId: 'recCompetence1',
          challenges: [challengeUrl2]
        }
      ];
      sinon.stub(certificationChallengesService, 'saveChallenges')
        .withArgs(userCompetences, certificationCourse)
        .resolves(certificationCourseWithNbOfChallenges);

      // when
      const newCertification = await retrieveOrCreateCertificationCourseFromKnowledgeElements({
        userId,
        sessionId,
        certificationChallengesService,
        certificationCourseRepository,
        challengeRepository
      });

      // then
      sinon.assert.calledWith(
        certificationChallengesService.groupUserKnowledgeElementsByCompetence,
        [knowledgeElementOnUrl2]
      );
      sinon.assert.calledWith(
        certificationChallengesService.selectThreeKnowledgeElementsHigherSkillsByCompetence,
        { recCompetence1: [knowledgeElementOnUrl2] }
      );
      sinon.assert.calledWith(
        certificationChallengesService.findChallengesByCompetenceId,
        allChallenges,
        { recCompetence1: [knowledgeElementOnUrl2] }
      );
      sinon.assert.calledWith(
        certificationChallengesService.convertChallengesToUserCompetences,
        { recCompetence1: [challengeUrl2] }
      );

      expect(newCertification).to.deep.equal({
        created: true,
        certificationCourse: certificationCourseWithNbOfChallenges
      });
    });
  });
});
