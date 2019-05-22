const { expect } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');

describe('Unit | Domain | Models | Scorecard', () => {

  describe('#buildFrom', () => {

    let competenceEvaluation;
    let knowledgeElements;
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
        knowledgeElements = [{ earnedPix: 5.5 }, { earnedPix: 3.6 }];
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

  });

});
