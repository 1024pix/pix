import answersAsObject from 'mon-pix/utils/answers-as-object';
import { module, test } from 'qunit';

module('Unit | Utility | answers as object', function () {
  module('#answersAsObject', function () {
    test('should return an object of given answers with key of the input', function (assert) {
      // given
      const answer = {
        value: "num1: '4' num2: '1' num3: '2' num4: '3'",
      };
      const expectedResult = {
        num1: '4',
        num2: '1',
        num3: '2',
        num4: '3',
      };

      // when
      const result = answersAsObject(answer.value);

      // then
      assert.deepEqual(result, expectedResult);
    });

    test('should return an empty object when the answer is aband', function (assert) {
      // given
      const answer = { value: '#ABAND#' };
      const inputKeys = ['key1', 'key2', 'key3'];
      const expectedResult = { key1: '', key2: '', key3: '' };
      // when
      const result = answersAsObject(answer.value, inputKeys);

      // then
      assert.deepEqual(result, expectedResult);
    });
  });
});
