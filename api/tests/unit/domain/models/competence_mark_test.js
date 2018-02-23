const { expect } = require('../../../test-helper');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');

describe('Unit | Domain | Models | Competence Mark', () => {

  describe('constructor', () => {
    it('should build a Competence Mark from raw JSON', () => {
      // given
      const rawData = {
        level: 2,
        score: 13,
        area_code: '1',
        competence_code: '1.1'
      };

      // when
      const competenceMark = new CompetenceMark(rawData);

      // then
      expect(competenceMark.level).to.equal(2);
      expect(competenceMark.score).to.equal(13);
      expect(competenceMark.area_code).to.equal('1');
      expect(competenceMark.competence_code).to.equal('1.1');
    });
  });
});
