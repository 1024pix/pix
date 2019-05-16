const { sinon, expect, domainBuilder } = require('../../../test-helper');
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
    let status = 'FOO';
    sinon.stub(Scorecard, '_computeStatus').returns(status);

    it('should return the user scorecard with level limited to 5', async () => {
      // given
      status = 'STARTED';
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
      const userScorecard = Scorecard.buildFrom({
        userId: authenticatedUserId,
        userKEList: knowledgeElementList,
        competence,
        competenceEvaluations: null
      });

      //then
      expect(userScorecard).to.deep.equal(expectedUserScorecard);
    });

    context('when there is no knowledge elements', async () => {

      it('should return the user scorecard with score null', async () => {
        // given
        status = 'NOT_STARTED';

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
        const userScorecard = Scorecard.buildFrom({
          userId: authenticatedUserId,
          userKEList: null,
          competence,
          competenceEvaluations: null
        });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });

    context('when there is some knowledge elements', async () => {
      const earnedPix = 10;

      it('should return the user scorecard with computed level and pix', async () => {
        // given
        status = 'COMPLETED';
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
        const userScorecard = Scorecard.buildFrom({
          userId: authenticatedUserId,
          userKEList: knowledgeElementList,
          competence,
          competenceEvaluations
        });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });
  });

  describe('_computeStatus', () => {
    const competenceId = 1;

    context('when there is no knowledge elements', async () => {

      it('should return the user scorecard with status NOT_STARTED', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluations = [domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessmentId: assessment.id,
          assessment
        })];

        // when
        const status = Scorecard._computeStatus({ knowledgeElements: null, competenceId, competenceEvaluations });

        //then
        expect(status).to.deep.equal('NOT_STARTED');
      });
    });

    context('when assessment is completed', async () => {

      it('should return the user scorecard with status COMPLETED', async () => {
        // given
        const knowledgeElementList = [domainBuilder.buildKnowledgeElement({ competenceId })];
        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluations = [domainBuilder.buildCompetenceEvaluation({
          competenceId,
          assessmentId: assessment.id,
          assessment
        })];

        // when
        const status = Scorecard._computeStatus({
          knowledgeElements: knowledgeElementList,
          competenceId,
          competenceEvaluations
        });

        //then
        expect(status).to.deep.equal('COMPLETED');
      });
    });

    context('when there is some knowledge-elements and assessment is not completed', async () => {

      it('should return the user scorecard with status STARTED', async () => {
        // given
        const knowledgeElementList = [domainBuilder.buildKnowledgeElement({ competenceId })];
        const assessment = domainBuilder.buildAssessment({ state: 'started', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluations = [domainBuilder.buildCompetenceEvaluation({
          competenceId,
          assessmentId: assessment.id,
          assessment
        })];

        // when
        const status = Scorecard._computeStatus({
          knowledgeElements: knowledgeElementList,
          competenceId,
          competenceEvaluations
        });

        //then
        expect(status).to.deep.equal('STARTED');
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
