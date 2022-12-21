const { expect, sinon } = require('../../../test-helper');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const constants = require('../../../../lib/domain/constants');

describe('Unit | Domain | Models | Scorecard', function () {
  let computeDaysSinceLastKnowledgeElementStub;

  beforeEach(function () {
    computeDaysSinceLastKnowledgeElementStub = sinon.stub(KnowledgeElement, 'computeDaysSinceLastKnowledgeElement');
  });

  describe('#buildFrom', function () {
    let competenceEvaluation;
    let actualScorecard;

    const userId = '123';
    const competence = {
      id: 1,
      name: 'Évaluer',
      description: 'Les compétences numériques',
      area: 'area',
      index: 'index',
    };

    context('with existing competence evaluation and assessment', function () {
      beforeEach(function () {
        // given
        competenceEvaluation = {
          status: 'started',
          assessment: { state: 'started' },
        };
        const knowledgeElements = [
          { earnedPix: 5.5, createdAt: new Date() },
          {
            earnedPix: 3.6,
            createdAt: new Date(),
          },
        ];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        // when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should build an object of Scorecard type', function () {
        expect(actualScorecard).to.be.instanceOf(Scorecard);
      });
      it('should build a scorecard id from a combination of userId and competenceId', function () {
        expect(actualScorecard.id).to.equal(userId + '_' + competence.id);
      });
      it('should competence datas to the scorecard object', function () {
        expect(actualScorecard.name).to.equal(competence.name);
        expect(actualScorecard.competenceId).to.equal(competence.id);
        expect(actualScorecard.area).to.equal(competence.area);
        expect(actualScorecard.index).to.equal(competence.index);
        expect(actualScorecard.description).to.equal(competence.description);
      });
      it('should have earned pix as a rounded sum of all knowledge elements earned pixes', function () {
        expect(actualScorecard.earnedPix).to.equal(9);
      });

      it('should have exactly earned pix as a sum of all knowledge elements earned pixes', function () {
        expect(actualScorecard.exactlyEarnedPix).to.equal(9.1);
      });

      it('should have a level computed from the number of pixes', function () {
        expect(actualScorecard.earnedPix).to.equal(9);
      });
      it('should have set the number of pix ahead of the next level', function () {
        expect(actualScorecard.pixScoreAheadOfNextLevel).to.equal(1);
      });
      it('should have set the scorecard status based on the competence evaluation status', function () {
        expect(actualScorecard.status).to.equal(Scorecard.statuses.STARTED);
      });
      it('should have set the scorecard remainingDaysBeforeReset based on last knowledge element date', function () {
        expect(actualScorecard.remainingDaysBeforeReset).to.equal(7);
      });
      it('should have set the scorecard remainingDaysBeforeImproving based on last knowledge element date', function () {
        expect(actualScorecard.remainingDaysBeforeImproving).to.equal(4);
      });
    });

    context('when the competence evaluation has never been started', function () {
      beforeEach(function () {
        // given
        competenceEvaluation = undefined;
        const knowledgeElements = [];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have set the scorecard status NOT_STARTED', function () {
        expect(actualScorecard.status).to.equal(Scorecard.statuses.NOT_STARTED);
      });
    });

    context('when the competence evaluation has never been started and some knowledgeElements exist', function () {
      beforeEach(function () {
        // given
        competenceEvaluation = undefined;
        const knowledgeElements = [
          { earnedPix: 5.5, createdAt: new Date() },
          {
            earnedPix: 3.6,
            createdAt: new Date(),
          },
        ];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have set the scorecard status STARTED', function () {
        expect(actualScorecard.status).to.equal(Scorecard.statuses.STARTED);
      });
    });

    context('when the competence evaluation has been reset but no knowledgeElements exist', function () {
      beforeEach(function () {
        // given
        const knowledgeElements = [];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        competenceEvaluation = { status: 'reset' };
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have set the scorecard status based on the competence evaluation status', function () {
        expect(actualScorecard.status).to.equal('NOT_STARTED');
      });
    });

    context('when the competence evaluation has been reset and some knowledgeElements exist', function () {
      beforeEach(function () {
        // given
        const knowledgeElements = [
          { earnedPix: 5.5, createdAt: new Date() },
          {
            earnedPix: 3.6,
            createdAt: new Date(),
          },
        ];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        competenceEvaluation = { status: 'reset' };

        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have set the scorecard status STARTED', function () {
        expect(actualScorecard.status).to.equal(Scorecard.statuses.STARTED);
      });
    });

    context('when the user has no knowledge elements for the competence', function () {
      beforeEach(function () {
        // given
        const knowledgeElements = [];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        competenceEvaluation = { status: 'reset' };
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements: [], competenceEvaluation, competence });
      });
      // then
      it('should have a dayBeforeReset at null', function () {
        expect(actualScorecard.remainingDaysBeforeReset).to.be.null;
      });

      it('should have a dayBeforeImproving at null', function () {
        expect(actualScorecard.remainingDaysBeforeImproving).to.be.null;
      });
    });

    context('when the user level is beyond the upper limit allowed', function () {
      let knowledgeElements;
      beforeEach(function () {
        // given
        knowledgeElements = [{ earnedPix: 50 }, { earnedPix: 70 }];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
      });
      // then
      it('should have the competence level capped at the maximum value', function () {
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });

        expect(actualScorecard.level).to.equal(5);
        expect(actualScorecard.earnedPix).to.equal(40);
      });

      it('should have the competence level not capped at the maximum value if we allow it', function () {
        //when
        actualScorecard = Scorecard.buildFrom({
          userId,
          knowledgeElements,
          competenceEvaluation,
          competence,
          allowExcessLevel: true,
        });

        expect(actualScorecard.level).to.equal(15);
        expect(actualScorecard.earnedPix).to.equal(40);
      });
    });

    context('when the user pix score is higher than the max', function () {
      let knowledgeElements;
      beforeEach(function () {
        // given
        knowledgeElements = [{ earnedPix: 50 }, { earnedPix: 70 }];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
      });

      it('should have the number of pix blocked', function () {
        //when
        actualScorecard = Scorecard.buildFrom({
          userId,
          knowledgeElements,
          competenceEvaluation,
          competence,
        });
        // then
        expect(actualScorecard.earnedPix).to.equal(constants.MAX_REACHABLE_PIX_BY_COMPETENCE);
      });

      it('should have the same number of pix if we allow it', function () {
        //when
        actualScorecard = Scorecard.buildFrom({
          userId,
          knowledgeElements,
          competenceEvaluation,
          competence,
          allowExcessPix: true,
        });
        // then
        expect(actualScorecard.earnedPix).to.equal(120);
      });
    });

    context('when there is no knowledge elements', function () {
      it('should return null when looking for remainingDaysBeforeReset', function () {
        const knowledgeElements = [];

        // when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });

        // then
        expect(actualScorecard.remainingDaysBeforeReset).to.equal(null);
      });

      it('should return null when looking for remainingDaysBeforeImproving', function () {
        const knowledgeElements = [];

        // when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });

        // then
        expect(actualScorecard.remainingDaysBeforeImproving).to.equal(null);
      });
    });
  });

  describe('#computeRemainingDaysBeforeReset', function () {
    let testCurrentDate;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const originalConstantValue = constants.MINIMUM_DELAY_IN_DAYS_FOR_RESET;

    beforeEach(function () {
      testCurrentDate = new Date('2018-01-10T05:00:00Z');
      sinon.useFakeTimers(testCurrentDate.getTime());
    });

    before(function () {
      constants.MINIMUM_DELAY_IN_DAYS_FOR_RESET = 7;
    });

    after(function () {
      constants.MINIMUM_DELAY_IN_DAYS_FOR_RESET = originalConstantValue;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { daysSinceLastKnowledgeElement: 0.0833, expectedDaysBeforeReset: 7 },
      { daysSinceLastKnowledgeElement: 1, expectedDaysBeforeReset: 6 },
      { daysSinceLastKnowledgeElement: 5, expectedDaysBeforeReset: 2 },
      { daysSinceLastKnowledgeElement: 5.5, expectedDaysBeforeReset: 2 },
      { daysSinceLastKnowledgeElement: 6, expectedDaysBeforeReset: 1 },
      { daysSinceLastKnowledgeElement: 6.4583, expectedDaysBeforeReset: 1 },
      { daysSinceLastKnowledgeElement: 6.5, expectedDaysBeforeReset: 1 },
      { daysSinceLastKnowledgeElement: 6.5416, expectedDaysBeforeReset: 1 },
      { daysSinceLastKnowledgeElement: 7, expectedDaysBeforeReset: 0 },
      { daysSinceLastKnowledgeElement: 10, expectedDaysBeforeReset: 0 },
    ].forEach(({ daysSinceLastKnowledgeElement, expectedDaysBeforeReset }) => {
      it(`should return ${expectedDaysBeforeReset} days when ${daysSinceLastKnowledgeElement} days passed since last knowledge element`, function () {
        const knowledgeElements = [{ createdAt: new Date(testCurrentDate) }];

        computeDaysSinceLastKnowledgeElementStub.returns(daysSinceLastKnowledgeElement);

        // when
        const remainingDaysBeforeReset = Scorecard.computeRemainingDaysBeforeReset(knowledgeElements);

        // then
        expect(remainingDaysBeforeReset).to.equal(expectedDaysBeforeReset);
      });
    });
  });

  describe('#computeRemainingDaysBeforeImproving', function () {
    let testCurrentDate;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const originalConstantValue = constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;

    beforeEach(function () {
      testCurrentDate = new Date('2018-01-10T05:00:00Z');
      sinon.useFakeTimers(testCurrentDate.getTime());
    });

    before(function () {
      constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING = 4;
    });

    after(function () {
      constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING = originalConstantValue;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { daysSinceLastKnowledgeElement: 0.0833, expectedDaysBeforeImproving: 4 },
      { daysSinceLastKnowledgeElement: 0, expectedDaysBeforeImproving: 4 },
      { daysSinceLastKnowledgeElement: 1, expectedDaysBeforeImproving: 3 },
      { daysSinceLastKnowledgeElement: 1.5, expectedDaysBeforeImproving: 3 },
      { daysSinceLastKnowledgeElement: 2.4583, expectedDaysBeforeImproving: 2 },
      { daysSinceLastKnowledgeElement: 4, expectedDaysBeforeImproving: 0 },
      { daysSinceLastKnowledgeElement: 7, expectedDaysBeforeImproving: 0 },
      { daysSinceLastKnowledgeElement: 10, expectedDaysBeforeImproving: 0 },
    ].forEach(({ daysSinceLastKnowledgeElement, expectedDaysBeforeImproving }) => {
      it(`should return ${expectedDaysBeforeImproving} days when ${daysSinceLastKnowledgeElement} days passed since last knowledge element`, function () {
        const knowledgeElements = [{ createdAt: new Date(testCurrentDate) }];

        computeDaysSinceLastKnowledgeElementStub.returns(daysSinceLastKnowledgeElement);

        // when
        const remainingDaysBeforeImproving = Scorecard.computeRemainingDaysBeforeImproving(knowledgeElements);

        // then
        expect(remainingDaysBeforeImproving).to.equal(expectedDaysBeforeImproving);
      });
    });
  });

  describe('#parseId', function () {
    it('should return a JSON object with parsed user ID and competence ID', function () {
      // given
      const id = '1234_recABC1234';

      // when
      const result = Scorecard.parseId(id);

      // then
      expect(result).to.deep.equal({
        userId: 1234,
        competenceId: 'recABC1234',
      });
    });
  });

  describe('#isFinished', function () {
    it('should return true when status is completed', function () {
      // given
      const scorecard = new Scorecard({ status: Scorecard.statuses.COMPLETED });

      // when
      const result = scorecard.isFinished;

      // then
      expect(result).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [Scorecard.statuses.STARTED, Scorecard.statuses.NOT_STARTED].forEach((status) => {
      it('should return false when status is not completed', function () {
        // given
        const scorecard = new Scorecard({ status });

        // when
        const result = scorecard.isFinished;

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#isMaxLevel', function () {
    it('should return true when level is equal to maxReachableLevel', function () {
      // given
      const level = 18;
      const maxReachableLevel = 18;
      sinon.stub(constants, 'MAX_REACHABLE_LEVEL').value(maxReachableLevel);
      const scorecard = new Scorecard({ level });

      // when
      const result = scorecard.isMaxLevel;

      // then
      expect(result).to.be.true;
    });

    it('should return true when level is above maxReachableLevel', function () {
      // given
      const level = 2;
      const maxReachableLevel = 1;
      sinon.stub(constants, 'MAX_REACHABLE_LEVEL').value(maxReachableLevel);
      const scorecard = new Scorecard({ level });

      // when
      const result = scorecard.isMaxLevel;

      // then
      expect(result).to.be.true;
    });

    it('should return false when level is below maxReachableLevel', function () {
      // given
      const level = 1;
      const maxReachableLevel = 2;
      sinon.stub(constants, 'MAX_REACHABLE_LEVEL').value(maxReachableLevel);
      const scorecard = new Scorecard({ level });

      // when
      const result = scorecard.isMaxLevel;

      // then
      expect(result).to.be.false;
    });
  });

  describe('#isFinishedWithMaxLevel', function () {
    // eslint-disable mocha/no-setup-in-describe
    [
      { level: 2, status: Scorecard.statuses.NOT_STARTED, expectedResult: false },
      { level: 2, status: Scorecard.statuses.STARTED, expectedResult: false },
      { level: 2, status: Scorecard.statuses.COMPLETED, expectedResult: true },
      { level: 1, status: Scorecard.statuses.NOT_STARTED, expectedResult: false },
      { level: 1, status: Scorecard.statuses.STARTED, expectedResult: false },
      { level: 1, status: Scorecard.statuses.COMPLETED, expectedResult: false },
      { level: 3, status: Scorecard.statuses.NOT_STARTED, expectedResult: false },
      { level: 3, status: Scorecard.statuses.STARTED, expectedResult: false },
      { level: 3, status: Scorecard.statuses.COMPLETED, expectedResult: true },
    ].forEach((testCase) => {
      it(`should return ${testCase.expectedResult} when level is ${testCase.level} and status ${testCase.status}`, function () {
        // given
        const maxReachableLevel = 2;
        sinon.stub(constants, 'MAX_REACHABLE_LEVEL').value(maxReachableLevel);
        const scorecard = new Scorecard({ level: testCase.level, status: testCase.status });

        // when
        const result = scorecard.isFinishedWithMaxLevel;

        // then
        expect(result).to.equal(testCase.expectedResult);
      });
    });
    // eslint-enable mocha/no-setup-in-describe
  });
});
