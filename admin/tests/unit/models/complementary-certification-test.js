import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | complementaryCertification', function (hooks) {
  setupTest(hooks);

  module('#currentTargetProfiles', function () {
    test('it should return current target profiles from complementary certification', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const complementaryCertification = store.createRecord('complementary-certification', {
        targetProfilesHistory: [
          {
            id: 66,
            name: 'STEPHEN TARGET',
            attachedAt: '2020-01-01T00:00:00.000Z',
            detachedAt: null,
            badges: [
              {
                id: 68,
                label: 'badge Glacier',
                level: 1,
              },
            ],
          },
          {
            id: 67,
            name: 'BAD TARGET',
            attachedAt: '2020-01-02T00:00:00.000Z',
            detachedAt: '2020-01-02T00:00:00.000Z',
            badges: [],
          },
        ],
      });

      // when
      const currentTargetProfiles = complementaryCertification.currentTargetProfiles;

      // then
      assert.deepEqual(currentTargetProfiles, [
        {
          id: 66,
          name: 'STEPHEN TARGET',
          attachedAt: '2020-01-01T00:00:00.000Z',
          detachedAt: null,
          badges: [
            {
              id: 68,
              label: 'badge Glacier',
              level: 1,
            },
          ],
        },
      ]);
    });
  });
});
