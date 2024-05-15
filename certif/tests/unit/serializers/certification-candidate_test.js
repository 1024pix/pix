import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Serializer | certification-candidate', function (hooks) {
  setupTest(hooks);

  test('should serialize a certification candidate', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = this.owner.lookup('serializer:certification-candidate');
    const record = store.createRecord('certification-candidate', {
      firstName: 'Alain',
      lastName: 'Cendy',
      birthCity: 'Eu',
      birthCountry: 'France',
      email: 'alaincendy@example.net',
      resultRecipientEmail: 'test@example.net',
      externalId: '12345',
      birthdate: '2000-12-25',
      extraTimePercentage: 0.1,
      birthInseeCode: 76255,
      birthPostalCode: 76260,
      sex: 'F',
    });
    const snapshot = record._createSnapshot();

    const json = serializer.serialize(snapshot);

    assert.strictEqual(json.data.attributes['first-name'], 'Alain');
    assert.strictEqual(json.data.attributes['last-name'], 'Cendy');
    assert.strictEqual(json.data.attributes['birth-city'], 'Eu');
    assert.strictEqual(json.data.attributes['birth-country'], 'France');
    assert.strictEqual(json.data.attributes.email, 'alaincendy@example.net');
    assert.strictEqual(json.data.attributes['result-recipient-email'], 'test@example.net');
    assert.strictEqual(json.data.attributes['external-id'], '12345');
    assert.strictEqual(json.data.attributes.birthdate, '2000-12-25');
    assert.strictEqual(json.data.attributes['extra-time-percentage'], 0.1);
    assert.strictEqual(json.data.attributes['birth-insee-code'], '76255');
    assert.strictEqual(json.data.attributes['birth-postal-code'], '76260');
    assert.strictEqual(json.data.attributes.sex, 'F');
    assert.strictEqual(json.data.attributes['complementary-certification'], undefined);
  });

  module('when there is a complementary certification', function () {
    test('should serialize a certification candidate', function (assert) {
      const store = this.owner.lookup('service:store');
      const serializer = this.owner.lookup('serializer:certification-candidate');
      const record = store.createRecord('certification-candidate', {
        complementaryCertification: { key: 'COMP', label: 'complémentaire', hasComplementaryReferential: true },
      });
      const snapshot = record._createSnapshot();

      const json = serializer.serialize(snapshot);
      assert.deepEqual(json.data.attributes['complementary-certification'], { key: 'COMP', label: 'complémentaire' });
    });
  });
});
