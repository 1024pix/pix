import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | complementary-certifications/list', function (hooks) {
  setupTest(hooks);

  module('#sortedComplementaryCertifications', function () {
    test('it should return an array of complementary certifications ordered by label', async function (assert) {
      // given
      const component = createGlimmerComponent('component:complementary-certifications/list');

      component.args = {
        complementaryCertifications: [
          { id: 1, label: 'Certif+ B' },
          { id: 2, label: 'Certif+ C' },
          {
            id: 3,
            label: 'Certif+ A',
          },
        ],
      };

      // when
      const sortedComplementaryCertifications = component.sortedComplementaryCertifications;

      // then
      assert.deepEqual(sortedComplementaryCertifications, [
        { id: 3, label: 'Certif+ A' },
        {
          id: 1,
          label: 'Certif+ B',
        },
        { id: 2, label: 'Certif+ C' },
      ]);
    });
  });
});
