const random = require('../../../infrastructure/random');
const { expect } = require('../../../../../tests/test-helper.js');

describe('Unit | Infrastructure | random', () => {

  describe('#sample', () => {

    it('should return one item of the passed array pick at random', () => {
      // given
      const items = ['A', 'B', 'C', 'D'];

      // when
      const item = random.pickOneFrom(items);

      // then
      expect(item).to.be.oneOf(items);
    });

    it('should return undefined when passed array is empty', () => {
      // when
      const item = random.pickOneFrom([]);

      // then
      expect(item).to.be.undefined;
    });
  });
});
