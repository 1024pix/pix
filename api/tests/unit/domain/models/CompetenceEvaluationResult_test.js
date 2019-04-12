const { expect } = require('../../../test-helper');
const CompetenceEvaluationResult = require('../../../../lib/domain/models/CompetenceEvaluationResult');

describe('Unit | Domain | Models | CompetenceEvaluationResult', () => {

  describe('constructor', () => {

    it('should build a CompetenceEvaluationResult from raw JSON', () => {
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
      const competenceEvaluationResult = new CompetenceEvaluationResult(rawData);

      // then
      expect(competenceEvaluationResult.id).to.equal(1);
      expect(competenceEvaluationResult.name).to.equal('Competence name');
      expect(competenceEvaluationResult.index).to.equal('Competence index');
      expect(competenceEvaluationResult.area).to.equal('Competence area');
      expect(competenceEvaluationResult.courseId).to.equal(1);
      expect(competenceEvaluationResult.earnedPix).to.equal(10);
      expect(competenceEvaluationResult.level).to.equal(1);
      expect(competenceEvaluationResult.pixScoreAheadOfNextLevel).to.equal(2);
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
      const competenceEvaluationResult = new CompetenceEvaluationResult(rawData);

      // then
      expect(competenceEvaluationResult.level).to.equal(CompetenceEvaluationResult.MAX_REACHABLE_LEVEL);
    });
  });
});
