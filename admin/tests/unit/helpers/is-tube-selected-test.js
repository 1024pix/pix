import { A as EmberArray } from '@ember/array';
import { isTubeSelected } from 'pix-admin/helpers/is-tube-selected';
import { module, test } from 'qunit';

module('Unit | Helper | isTubeSelected', function () {
  module('when tube is in selected tubes', function () {
    test('it should return true', function (assert) {
      // given
      const tubesSelected = EmberArray(['tubeId']);

      // when
      const result = isTubeSelected(tubesSelected, { id: 'tubeId' });

      // then
      assert.true(result);
    });
  });

  module('when tube is not in selected tubes', function () {
    test('it should return false', function (assert) {
      // given
      const tubesSelected = EmberArray(['tubeId']);

      // when
      const result = isTubeSelected(tubesSelected, { id: 'otherTubeId' });

      // then
      assert.false(result);
    });
  });
});
