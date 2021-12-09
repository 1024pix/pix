import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Serializer | BadgeCriterion', function (hooks) {
  setupTest(hooks);

  test('it serializes records', function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const record = run(() => {
      store.push({
        data: [
          {
            id: 'badgeId',
            type: 'badge',
          },
          {
            id: 'skillSetId',
            type: 'skill-set',
          },
        ],
      });

      return store.createRecord('badge-criterion', {
        scope: 'SkillSet',
        threshold: 86,
        badge: store.peekRecord('badge', 'badgeId'),
        skillSets: [store.peekRecord('skill-set', 'skillSetId')],
      });
    });

    // when
    const serializedRecord = record.serialize();

    // then
    assert.deepEqual(serializedRecord, {
      data: {
        type: 'badge-criteria',
        attributes: {
          scope: 'SkillSet',
          threshold: 86,
        },
        relationships: {
          'skill-sets': {
            data: [
              {
                id: 'skillSetId',
                type: 'skill-sets',
              },
            ],
          },
        },
      },
    });
  });
});
