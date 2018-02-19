const { expect } = require('../../../test-helper');
const Mark = require('../../../../lib/domain/models/Mark');

describe('Unit | Domain | Models | Mark', () => {

  describe('constructor', () => {
    it('should build a Mark from raw JSON', () => {
      // given
      const rawData = {
        level: 2,
        score: 13,
        area_code: '1',
        competence_code: '1.1'
      };

      // when
      const mark = new Mark(rawData);

      // then
      expect(mark.level).to.equal(2);
      expect(mark.score).to.equal(13);
      expect(mark.area_code).to.equal('1');
      expect(mark.competence_code).to.equal('1.1');
    });
  });
});
