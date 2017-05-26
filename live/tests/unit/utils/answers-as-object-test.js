import answersAsObject from 'pix-live/utils/answers-as-object';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Unit | Utility | answers as object', function() {

  describe('#answersAsObject', function() {

    it('should return an object of given answers with key of the input', function() {
      // given
      const answer = {
        value : 'num1: \'4\' num2: \'1\' num3: \'2\' num4: \'3\''
      };
      const expectedResult = {
        'num1': '4',
        'num2': '1',
        'num3': '2',
        'num4': '3',
      };

      // when
      const result = answersAsObject(answer.value);

      // then
      expect(result).to.deep.equal(expectedResult);
    });

    it('should return an empty object when the answer is aband', function() {
      // given
      const answer = { value : '#ABAND#' };
      const inputKeys = ['key1', 'key2', 'key3'];
      const expectedResult = { key1 : '', key2 : '', key3 : ''};
      // when
      const result = answersAsObject(answer.value, inputKeys);

      // then
      expect(result).to.deep.equal(expectedResult);
    });

  });

});
