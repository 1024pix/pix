import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | assessment', function (hooks) {
  setupTest(hooks);

  test('should serialize assessment', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = this.owner.lookup('serializer:assessment');
    const record = store.createRecord('assessment', {
      certificationNumber: 'cert123',
      codeCampaign: 'campaign123',
      answers: [],
    });
    const snapshot = record._createSnapshot();

    const json = serializer.serialize(snapshot);

    assert.strictEqual(json.data.type, 'assessments');
    assert.strictEqual(json.data.attributes['certification-number'], 'cert123');
    assert.strictEqual(json.data.attributes['code-campaign'], 'campaign123');
  });

  module('when adapter options are given', function () {
    test('should add challenge id attribute from adapter options', function (assert) {
      const store = this.owner.lookup('service:store');
      const serializer = this.owner.lookup('serializer:assessment');
      const record = store.createRecord('assessment', { answers: [] });
      const snapshot = record._createSnapshot();
      snapshot.adapterOptions = {
        challengeId: 'challenge1',
      };

      const json = serializer.serialize(snapshot);

      assert.strictEqual(json.data.attributes['challenge-id'], 'challenge1');
    });
  });
});
