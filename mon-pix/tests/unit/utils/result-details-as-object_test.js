import resultDetailsAsObject from 'mon-pix/utils/result-details-as-object';
import { module, test } from 'qunit';

module('#resultDetailsAsObject', function () {
  test('it should return an object from the yaml String', function (assert) {
    // given
    const resultDetailYaml = 'S1: false\nS2: true\n';
    const expectedObject = { S1: false, S2: true };
    // when
    const result = resultDetailsAsObject(resultDetailYaml);
    // then
    assert.deepEqual(result, expectedObject);
  });

  test('it should return an empty object from the yaml String null\\n', function (assert) {
    // given
    const resultDetailYaml = 'null\n';
    const expectedObject = {};

    // when
    const result = resultDetailsAsObject(resultDetailYaml);
    // then
    assert.deepEqual(result, expectedObject);
  });
});
