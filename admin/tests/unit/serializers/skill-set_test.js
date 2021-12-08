import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Serializer | SkillSet', function (hooks) {
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
        ],
      });

      return store.createRecord('skill-set', {
        name: 'SkillSet name',
        skillIds: ['skillId1', 'skillId2'],
        badge: store.peekRecord('badge', 'badgeId'),
      });
    });

    // when
    const serializedRecord = record.serialize();

    // then
    assert.deepEqual(serializedRecord, {
      data: {
        type: 'skill-sets',
        attributes: {
          name: 'SkillSet name',
          'skill-ids': ['skillId1', 'skillId2'],
        },
      },
    });
  });
});
