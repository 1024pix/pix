import { expect } from 'chai';
import { describe, it } from 'mocha';
import solutionAsObject from 'mon-pix/utils/solution-as-object';

describe('Unit | Utility | solution as object', function() {

  describe('#solutionsAsObject', function() {

    it('should return an object which contains arrays of the solution for each input', function() {
      // given
      const solution = {
        value: 'num1:\n- 4\nnum2:\n- 2\nnum3:\n- 1\nnum4:\n- 3'
      };
      const expectedResult = {
        'num1': ['4'],
        'num2': ['2'],
        'num3': ['1'],
        'num4': ['3'],
      };
      // when
      const result = solutionAsObject(solution.value);

      // then
      expect(result).to.be.deep.equal(expectedResult);
    });

    it('should return an object which contains arrays of the multiple potentials solution for each input', function() {
      // given
      const solution = {
        value: 'num1:\n- 2\nnum2:\n- 3\n- 4\nnum3:\n- 1\n- 5\n- 6'
      };
      const expectedResult = {
        'num1': ['2'],
        'num2': ['3', '4'],
        'num3': ['1', '5', '6']
      };
      // when
      const result = solutionAsObject(solution.value);

      // then
      expect(result).to.be.deep.equal(expectedResult);
    });
  });
});
