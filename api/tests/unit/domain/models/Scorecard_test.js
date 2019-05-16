const { expect, domainBuilder } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const constants = require('../../../../lib/domain/constants');

describe('Unit | Domain | Models | Scorecard', () => {

  describe('constructor', () => {

    it('should build a Scorecard from raw JSON', () => {
      // given
      const rawData = {
        id: 1,
        name: 'Competence name',
        description: 'Competence description',
        index: 'Competence index',
        area: {},
        earnedPix: 10,
      };

      // when
      const scorecard = new Scorecard(rawData);

      // then
      expect(scorecard.id).to.equal(1);
      expect(scorecard.name).to.equal(rawData.name);
      expect(scorecard.description).to.equal(rawData.description);
      expect(scorecard.index).to.equal(rawData.index);
      expect(scorecard.area).to.equal(rawData.area);
      expect(scorecard.earnedPix).to.equal(rawData.earnedPix);
      expect(scorecard.level).to.equal(1);
      expect(scorecard.pixScoreAheadOfNextLevel).to.equal(2);
    });
  });

  describe('_buildFrom', () => {
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
        domainBuilder.buildKnowledgeElement({
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
      const userScorecard = Scorecard.buildFrom({ userId: authenticatedUserId, userKEList: knowledgeElementList, competence, competenceEvaluations: null });

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
        const userScorecard = Scorecard.buildFrom({ userId: authenticatedUserId, userKEList: null, competence, competenceEvaluations: null });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });

    context('when assessment is completed', async () => {
      const earnedPix = 10;

      it('should return the user scorecard with status COMPLETED', async () => {
        // given
        const knowledgeElementList = [domainBuilder.buildKnowledgeElement({ competenceId, earnedPix })];
        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluations = [domainBuilder.buildCompetenceEvaluation({
          competenceId,
          assessmentId: assessment.id,
          assessment
        })];
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
        const userScorecard = Scorecard.buildFrom({ userId: authenticatedUserId, userKEList: knowledgeElementList, competence, competenceEvaluations });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });

    context('when there is some knowledge-elements and assessment is not completed', async () => {
      const earnedPix = 10;

      it('should return the user scorecard with status STARTED', async () => {
        // given
        const knowledgeElementList = [domainBuilder.buildKnowledgeElement({ competenceId, earnedPix })];
        const assessment = domainBuilder.buildAssessment({ state: 'started', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluations = [domainBuilder.buildCompetenceEvaluation({
          competenceId,
          assessmentId: assessment.id,
          assessment
        })];
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
        const userScorecard = Scorecard.buildFrom({ userId: authenticatedUserId, userKEList: knowledgeElementList, competence, competenceEvaluations });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });
  });

  describe('_getCompetenceLevel', () => {

    it('should be capped at a maximum reachable level', () => {
      // given
      const rawData = {
        id: 1,
        name: 'Competence name',
        description: 'Competence description',
        index: 'Competence index',
        area: {},
        earnedPix: 99999999,
      };

      // when
      const scorecard = new Scorecard(rawData);

      // then
      expect(scorecard.level).to.equal(constants.MAX_REACHABLE_LEVEL);
    });
  });
});
