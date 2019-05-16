const { expect, domainBuilder } = require('../../../test-helper');
const service = require('../../../../lib/domain/services/scorecard-service');

describe('Unit | Domain | Services | scorecard', () => {

  describe('#createScorecard', () => {
    const authenticatedUserId = 2;
    const maxLevel = 5;
    const competenceId = 1;
    const scorecardId = `${authenticatedUserId}_${competenceId}`;

    it('should return the user scorecard with level limited to 5', async () => {
      // given
      const earnedPixNeededForLevelSixLimitedToFive = 50;
      const pixScoreAheadOfNextLevel = 2;

      const competence = domainBuilder.buildCompetence({ id: competenceId });

      const knowledgeElementList = [
        domainBuilder.buildSmartPlacementKnowledgeElement({
          competenceId,
          earnedPix: earnedPixNeededForLevelSixLimitedToFive
        })
      ];

      const expectedUserScorecard = domainBuilder.buildUserScorecard({
        id: scorecardId,
        name: competence.name,
        description: competence.description,
        competenceId,
        index: competence.index,
        area: competence.area,
        earnedPix: earnedPixNeededForLevelSixLimitedToFive,
        level: maxLevel,
        pixScoreAheadOfNextLevel,
        status: 'STARTED',
      });

      // when
      const userScorecard = service.createScorecard(authenticatedUserId, knowledgeElementList, competence, null);

      //then
      expect(userScorecard).to.deep.equal(expectedUserScorecard);
    });

    context('when there is no knowledge elements', async () => {

      it('should return the user scorecard with status NOT_STARTED', async () => {
        // given
        const competence = domainBuilder.buildCompetence({ id: competenceId });

        const expectedUserScorecard = domainBuilder.buildUserScorecard({
          id: scorecardId,
          name: competence.name,
          description: competence.description,
          competenceId,
          index: competence.index,
          area: competence.area,
          earnedPix: 0,
          level: 0,
          pixScoreAheadOfNextLevel: 0,
          status: 'NOT_STARTED',
        });

        // when
        const userScorecard = service.createScorecard(authenticatedUserId, null, competence, null);

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });

    context('when assessment is completed', async () => {
      const earnedPix = 10;

      it('should return the user scorecard with status COMPLETED', async () => {
        // given
        const knowledgeElementList = [domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId, earnedPix })];
        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluations = [domainBuilder.buildCompetenceEvaluation({ competenceId, assessmentId: assessment.id, assessment })];
        const competence = domainBuilder.buildCompetence({ id: competenceId });

        const expectedUserScorecard = domainBuilder.buildUserScorecard({
          id: scorecardId,
          name: competence.name,
          description: competence.description,
          competenceId,
          index: competence.index,
          area: competence.area,
          earnedPix,
          level: 1,
          pixScoreAheadOfNextLevel: 2,
          status: 'COMPLETED',
        });

        // when
        const userScorecard = service.createScorecard(authenticatedUserId, knowledgeElementList, competence, competenceEvaluations);

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });

    context('when there is some knowledge-elements and assessment is not completed', async () => {
      const earnedPix = 10;

      it('should return the user scorecard with status STARTED', async () => {
        // given
        const knowledgeElementList = [domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId, earnedPix })];
        const assessment = domainBuilder.buildAssessment({ state: 'started', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluations = [domainBuilder.buildCompetenceEvaluation({ competenceId, assessmentId: assessment.id, assessment })];
        const competence = domainBuilder.buildCompetence({ id: competenceId });

        const expectedUserScorecard = domainBuilder.buildUserScorecard({
          id: scorecardId,
          name: competence.name,
          description: competence.description,
          competenceId,
          index: competence.index,
          area: competence.area,
          earnedPix,
          level: 1,
          pixScoreAheadOfNextLevel: 2,
          status: 'STARTED',
        });

        // when
        const userScorecard = service.createScorecard(authenticatedUserId, knowledgeElementList, competence, competenceEvaluations);

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });
  });
});
