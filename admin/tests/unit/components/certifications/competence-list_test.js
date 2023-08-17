import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | certifications/competence-list', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:certifications/competence-list');
  });

  test('it computes indexed values correctly', function (assert) {
    component.args = {
      competences: [
        { index: '1.1', value: 'a competence', score: 16, level: 2 },
        { index: '3.3', value: 'another competence', score: 42, level: 5 },
        { index: '5.2', value: 'and another competence', score: 37, level: 4 },
      ],
    };
    const expected = {
      scores: [16, null, null, null, null, null, null, null, null, 42, null, null, null, null, null, 37],
      levels: [2, null, null, null, null, null, null, null, null, 5, null, null, null, null, null, 4],
    };

    // when
    const actual = component.indexedValues;

    // then
    assert.deepEqual(actual, expected);
  });
});
