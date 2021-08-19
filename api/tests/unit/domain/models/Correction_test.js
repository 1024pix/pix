const Correction = require('../../../../lib/domain/models/Correction');
const Hint = require('../../../../lib/domain/models/Hint');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Correction', function() {

  describe('#relevantHint', function() {

    it('should return undefined when there is no hint', function() {
      // given
      const correction = new Correction({ hints: [] });

      // when
      const relevantHint = correction.relevantHint;

      // then
      expect(relevantHint).to.be.undefined;
    });

    it('should select the hint when there is only one hint', function() {
      // given
      const expectedHint = new Hint({ skillName: '@test', value: 'Indice' });
      const correction = new Correction({ hints: [new Hint({ skillName: '@test', value: 'Indice' })] });

      // when
      const relevantHint = correction.relevantHint;

      // then
      expect(relevantHint).to.deep.equal(expectedHint);
    });

    it('should select the hint of the least developed skill when more than one hint is present', function() {
      // given
      const expectedHint = new Hint({ skillName: '@test1', value: 'Indice Facile' });
      const correction = new Correction({
        hints: [
          new Hint({ skillName: '@test2', value: 'Indice moins Facile' }),
          new Hint({ skillName: '@test1', value: 'Indice Facile' }),
        ],
      });

      // when
      const relevantHint = correction.relevantHint;

      // then
      expect(relevantHint).to.deep.equal(expectedHint);
    });
  });
});
