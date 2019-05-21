const { sinon, expect, domainBuilder } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const constants = require('../../../../lib/domain/constants');

describe('Unit | Domain | Models | Scorecard', () => {

  describe('#constructor', () => {

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

  describe('#buildFrom', () => {
    const authenticatedUserId = 2;
    const maxLevel = 5;
    const competenceId = 1;
    const scorecardId = `${authenticatedUserId}_${competenceId}`;
    const computeStatusStub = sinon.stub(Scorecard, 'computeStatus');

    afterEach(() => {
      computeStatusStub.restore();
    });

    it('should return the user scorecard with level limited to 5', async () => {
      // given
      computeStatusStub.returns(Scorecard.StatusType.STARTED);
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
        status: Scorecard.StatusType.STARTED,
      });

      // when
      const userScorecard = Scorecard.buildFrom({
        userId: authenticatedUserId,
        knowledgeElements: knowledgeElementList,
        competence,
        competenceEvaluation: null
      });

      //then
      expect(userScorecard).to.deep.equal(expectedUserScorecard);
    });

    context('when there is no knowledge elements', async () => {

      it('should return the user scorecard with score null', async () => {
        // given
        computeStatusStub.returns(Scorecard.StatusType.NOT_STARTED);

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
          status: Scorecard.StatusType.NOT_STARTED,
        });

        // when
        const userScorecard = Scorecard.buildFrom({
          userId: authenticatedUserId,
          knowledgeElements: null,
          competence,
          competenceEvaluation: null
        });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });

    context('when there are some knowledge elements', async () => {
      const earnedPix = 10;

      it('should return the user scorecard with computed level and pix', async () => {
        // given
        computeStatusStub.returns(Scorecard.StatusType.COMPLETED);

        const knowledgeElementList = [domainBuilder.buildKnowledgeElement({ competenceId, earnedPix })];
        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId,
          assessmentId: assessment.id,
          assessment
        })
        ;
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
          status: Scorecard.StatusType.COMPLETED,
        });

        // when
        const userScorecard = Scorecard.buildFrom({
          userId: authenticatedUserId,
          knowledgeElements: knowledgeElementList,
          competence,
          competenceEvaluation
        });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });
  });

  describe('#computeStatus', () => {
    const competenceId = 1;

    context('when there is no knowledge elements', async () => {

      it('should return the user scorecard with status NOT_STARTED', async () => {
        // given
        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessmentId: assessment.id,
          assessment
        });

        // when
        const status = Scorecard.computeStatus({ knowledgeElements: null, competenceId, competenceEvaluation });

        //then
        expect(status).to.equal(Scorecard.StatusType.NOT_STARTED);
      });
    });

    context('when assessment is completed', async () => {

      it('should return the user scorecard with status COMPLETED', async () => {
        // given
        const knowledgeElementList = [domainBuilder.buildKnowledgeElement({ competenceId })];
        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId,
          assessmentId: assessment.id,
          assessment
        });

        // when
        const status = Scorecard.computeStatus({
          knowledgeElements: knowledgeElementList,
          competenceId,
          competenceEvaluation
        });

        //then
        expect(status).to.equal(Scorecard.StatusType.COMPLETED);
      });
    });

    context('when there are some knowledge-elements and assessment is not completed', async () => {

      it('should return the user scorecard with status STARTED', async () => {
        // given
        const knowledgeElementList = [domainBuilder.buildKnowledgeElement({ competenceId })];
        const assessment = domainBuilder.buildAssessment({ state: 'started', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId,
          assessmentId: assessment.id,
          assessment
        });

        // when
        const status = Scorecard.computeStatus({
          knowledgeElements: knowledgeElementList,
          competenceId,
          competenceEvaluation
        });

        //then
        expect(status).to.equal(Scorecard.StatusType.STARTED);
      });
    });
  });

  describe('#_getCompetenceLevel', () => {

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
