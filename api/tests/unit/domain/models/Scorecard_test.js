const { expect } = require('../../../test-helper');
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
