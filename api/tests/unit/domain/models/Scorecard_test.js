const { expect, sinon } = require('../../../test-helper');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const moment = require('moment');

describe('Unit | Domain | Models | Scorecard', () => {

  let computeDaysSinceLastKnowledgeElementStub;

  beforeEach(() => {
    computeDaysSinceLastKnowledgeElementStub = sinon.stub(KnowledgeElement, 'computeDaysSinceLastKnowledgeElement');
  });

  describe('#buildFrom', () => {

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

    context('with existing competence evaluation and assessment', () => {
      beforeEach(() => {
        // given
        competenceEvaluation = {
          status: 'started',
          assessment: { state: 'started' },
        };
        const knowledgeElements = [{ earnedPix: 5.5, createdAt: new Date() }, { earnedPix: 3.6, createdAt: new Date() }];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        // when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should build an object of Scorecard type', () => {
        expect(actualScorecard).to.be.instanceOf(Scorecard);
      });
      it('should build a scorecard id from a combination of userId and competenceId', () => {
        expect(actualScorecard.id).to.equal(userId + '_' + competence.id);
      });
      it('should competence datas to the scorecard object', () => {
        expect(actualScorecard.name).to.equal(competence.name);
        expect(actualScorecard.competenceId).to.equal(competence.id);
        expect(actualScorecard.area).to.equal(competence.area);
        expect(actualScorecard.index).to.equal(competence.index);
        expect(actualScorecard.description).to.equal(competence.description);
      });
      it('should have earned pix as a rounded sum of all knowledge elements earned pixes', () => {
        expect(actualScorecard.earnedPix).to.equal(9);
      });
      it('should have a level computed from the number of pixes', () => {
        expect(actualScorecard.earnedPix).to.equal(9);
      });
      it('should have set the number of pix ahead of the next level', () => {
        expect(actualScorecard.pixScoreAheadOfNextLevel).to.equal(1);
      });
      it('should have set the scorecard status based on the competence evaluation status', () => {
        expect(actualScorecard.status).to.equal(Scorecard.statuses.STARTED);
      });
      it('should have set the scorecard remainingDaysBeforeReset based on last knowledge element date', () => {
        expect(actualScorecard.remainingDaysBeforeReset).to.equal(7);
      });
    });

    context('when the competence evaluation has never been started', () => {
      beforeEach(() => {
        // given
        competenceEvaluation = undefined;
        const knowledgeElements = [];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have set the scorecard status NOT_STARTED', () => {
        expect(actualScorecard.status).to.equal(Scorecard.statuses.NOT_STARTED);
      });
    });

    context('when the competence evaluation has never been started and some knowledgeElements exist', () => {
      beforeEach(() => {
        // given
        competenceEvaluation = undefined;
        const knowledgeElements = [{ earnedPix: 5.5, createdAt: new Date() }, { earnedPix: 3.6, createdAt: new Date() }];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have set the scorecard status STARTED', () => {
        expect(actualScorecard.status).to.equal(Scorecard.statuses.STARTED);
      });
    });

    context('when the competence evaluation has been reset', () => {
      beforeEach(() => {
        // given
        const knowledgeElements = [];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        competenceEvaluation = { status: 'reset' };
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have set the scorecard status based on the competence evaluation status', () => {
        expect(actualScorecard.status).to.equal('NOT_STARTED');
      });
    });

    context('when the user has no knowledge elements for the competence', () => {
      beforeEach(() => {
        // given
        const knowledgeElements = [];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        competenceEvaluation = { status: 'reset' };
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements: [], competenceEvaluation, competence });
      });
      // then
      it('should have a dayBeforeReset at null', () => {
        expect(actualScorecard.remainingDaysBeforeReset).to.be.null;
      });
    });

    context('when the user level is beyond the upper limit allowed', () => {
      beforeEach(() => {
        // given
        const knowledgeElements = [{ earnedPix: 50 }, { earnedPix: 70 }];
        computeDaysSinceLastKnowledgeElementStub.withArgs(knowledgeElements).returns(0);
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have the competence level capped at the maximum value', () => {
        expect(actualScorecard.level).to.equal(5);
      });
    });

    context('when there is no knowledge elements', () => {
      it('should return null', () => {
        const knowledgeElements = [];

        // when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });

        // then
        expect(actualScorecard.remainingDaysBeforeReset).to.equal(null);
      });
    });
  });

  describe('#computeDaysSinceLastKnowledgeElement', () => {

    let testCurrentDate;

    beforeEach(() => {
      testCurrentDate = new Date('2018-01-10T05:00:00Z');
      sinon.useFakeTimers(testCurrentDate.getTime());
    });

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
      it(`should return ${expectedDaysBeforeReset} days when ${daysSinceLastKnowledgeElement} days passed since last knowledge element`, () => {
        const date = moment(testCurrentDate).toDate();
        const knowledgeElements = [{ createdAt: date }];

        computeDaysSinceLastKnowledgeElementStub.returns(daysSinceLastKnowledgeElement);

        // when
        const remainingDaysBeforeReset = Scorecard.computeRemainingDaysBeforeReset(knowledgeElements);

        // then
        expect(remainingDaysBeforeReset).to.equal(expectedDaysBeforeReset);
      });
    });
  });
});
