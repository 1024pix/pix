const { expect } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');

describe('Unit | Domain | Models | Scorecard', () => {

  describe('constructor', () => {

    it('should build a Scorecard from raw JSON', () => {
      // given
      const rawData = {
        id: 1,
        name: 'Competence name',
        index: 'Competence index',
        area: 'Competence area',
        courseId: 1,
        earnedPix: 10,
      };

      // when
      const scorecard = new Scorecard(rawData);

      // then
      expect(scorecard.id).to.equal(1);
      expect(scorecard.name).to.equal('Competence name');
      expect(scorecard.index).to.equal('Competence index');
      expect(scorecard.area).to.equal('Competence area');
      expect(scorecard.courseId).to.equal(1);
      expect(scorecard.earnedPix).to.equal(10);
      expect(scorecard.level).to.equal(1);
      expect(scorecard.pixScoreAheadOfNextLevel).to.equal(2);
    });
  });

  describe('_getCompetenceLevel', () => {

    it('should be capped at MAX_REACHABLE_LEVEL', () => {
      // given
      const rawData = {
        id: 1,
        name: 'Competence name',
        index: 'Competence index',
        area: 'Competence area',
        courseId: 1,
        earnedPix: 99999999,
      };

      // when
      const scorecard = new Scorecard(rawData);

      // then
      expect(scorecard.level).to.equal(Scorecard.MAX_REACHABLE_LEVEL);
    });
  });
});
