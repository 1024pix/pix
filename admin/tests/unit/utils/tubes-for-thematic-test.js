import { setupTest } from 'ember-qunit';
import tubesForThematic from 'pix-admin/utils/tubes-for-thematic';
import { module, test } from 'qunit';

module('Unit | Utils | tubes for thematic', function (hooks) {
  setupTest(hooks);

  module('when the thematic is an Ember Data record', function () {
    test('should return the tubes of the loaded relationship', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const tube1 = store.createRecord('tube', { id: 'tubeId1', name: '@tubeName1' });
      const tube2 = store.createRecord('tube', { id: 'tubeId2', name: '@tubeName2' });
      const thematic = store.createRecord('thematic', { id: 'thematicId', name: 'Thématique', tubes: [tube1, tube2] });

      // when
      const result = tubesForThematic(thematic);

      // then
      assert.deepEqual(
        result.map(({ id }) => id),
        ['tubeId1', 'tubeId2'],
      );
    });

    test('should return an empty array when the relationship is not loaded', function (assert) {
      // given
      const thematic = { hasMany: () => ({ value: () => null }) };

      // when
      const result = tubesForThematic(thematic);

      // then
      assert.deepEqual(result, []);
    });
  });

  module('when the thematic is a plain object', function () {
    test('should return its tubes', function (assert) {
      // given
      const tubes = [{ id: 'tubeId1', name: '@tubeName1' }];
      const thematic = { id: 'thematicId', name: 'Thématique', tubes };

      // when
      const result = tubesForThematic(thematic);

      // then
      assert.deepEqual(result, tubes);
    });

    test('should return an empty array when it has no tubes', function (assert) {
      // given
      const thematic = { id: 'thematicId', name: 'Thématique' };

      // when
      const result = tubesForThematic(thematic);

      // then
      assert.deepEqual(result, []);
    });
  });
});
