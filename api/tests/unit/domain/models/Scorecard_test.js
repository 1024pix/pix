const { expect, sinon } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const moment = require('moment');

describe('Unit | Domain | Models | Scorecard', () => {

  describe('#buildFrom', () => {

    let competenceEvaluation;
    let knowledgeElements;
    let actualScorecard;
    let testCurrentDate;

    const userId = '123';
    const competence = {
      id: 1,
      name: 'Évaluer',
      description: 'Les compétences numériques',
      area: 'area',
      index: 'index',
    };

    beforeEach(() => {
      testCurrentDate = new Date('2018-01-10T05:00:00Z');
      sinon.useFakeTimers(testCurrentDate.getTime());
    });

    context('with existing competence evaluation and assessment', () => {
      beforeEach(() => {
        // given
        competenceEvaluation = {
          status: 'started',
          assessment: { state: 'started' },
        };
        knowledgeElements = [{ earnedPix: 5.5, createdAt: new Date() }, { earnedPix: 3.6, createdAt: new Date() }];
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
        expect(actualScorecard.status).to.equal('STARTED');
      });
      it('should have set the scorecard remainingDaysBeforeReset based on last knowledge element date', () => {
        expect(actualScorecard.remainingDaysBeforeReset).to.equal(7);
      });
    });

    context('when the competence evaluation has never been started', () => {
      beforeEach(() => {
        // given
        competenceEvaluation = undefined;
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have set the scorecard status based on the competence evaluation status', () => {
        expect(actualScorecard.status).to.equal('NOT_STARTED');
      });
    });

    context('when the competence evaluation has been reset', () => {
      beforeEach(() => {
        // given
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
        knowledgeElements = [{ earnedPix: 50 }, { earnedPix: 70 }];
        //when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });
      });
      // then
      it('should have the competence level capped at the maximum value', () => {
        expect(actualScorecard.level).to.equal(5);
      });
    });

    [
      { daysBefore: 0, hoursBefore: 2, expectedDaysBeforeReset: 7 },
      { daysBefore: 1, hoursBefore: 0, expectedDaysBeforeReset: 6 },
      { daysBefore: 5, hoursBefore: 0, expectedDaysBeforeReset: 2 },
      { daysBefore: 5, hoursBefore: 12, expectedDaysBeforeReset: 2 },
      { daysBefore: 6, hoursBefore: 0, expectedDaysBeforeReset: 1 },
      { daysBefore: 6, hoursBefore: 11, expectedDaysBeforeReset: 1 },
      { daysBefore: 6, hoursBefore: 12, expectedDaysBeforeReset: 1 },
      { daysBefore: 6, hoursBefore: 13, expectedDaysBeforeReset: 1 },
      { daysBefore: 7, hoursBefore: 0, expectedDaysBeforeReset: 0 },
      { daysBefore: 10, hoursBefore: 0, expectedDaysBeforeReset: 0 },
    ].forEach(({ daysBefore, hoursBefore, expectedDaysBeforeReset }) => {
      it(`should return ${expectedDaysBeforeReset} days when the last knowledge element is ${daysBefore} days and ${hoursBefore} hours old`, () => {
        const knowledgeElementCreationDate = moment(testCurrentDate).subtract(daysBefore, 'day').subtract(hoursBefore, 'hour').toDate();
        const oldDate = moment(testCurrentDate).subtract(100, 'day').toDate();

        knowledgeElements = [{ createdAt: oldDate }, { createdAt: knowledgeElementCreationDate }];

        // when
        actualScorecard = Scorecard.buildFrom({ userId, knowledgeElements, competenceEvaluation, competence });

        // then
        expect(actualScorecard.remainingDaysBeforeReset).to.equal(expectedDaysBeforeReset);
      });
    });

  });

});
