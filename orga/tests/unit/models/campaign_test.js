import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | campaign', function (hooks) {
  setupTest(hooks);

  test('it should return the right data in the campaign model', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('campaign', {
      name: 'Fake name',
      code: 'ABC123',
    });
    assert.strictEqual(model.name, 'Fake name');
    assert.strictEqual(model.code, 'ABC123');
  });

  module('#urlToResult', function () {
    test('it should construct the url to result of the campaign with type assessment', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        id: 1,
        name: 'Fake name',
        code: 'ABC123',
        tokenForCampaignResults: 'token',
        type: 'ASSESSMENT',
      });
      assert.strictEqual(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-assessment-results');
    });

    test('it should construct the url to result of the campaign with type profiles collection', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        id: 1,
        name: 'Fake name',
        code: 'ABC123',
        tokenForCampaignResults: 'token',
        type: 'PROFILES_COLLECTION',
      });
      assert.strictEqual(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-profiles-collection-results');
    });
  });

  module('#hasStages', function () {
    test('returns true while campaign contains stages', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        targetProfileHasStage: true,
      });

      assert.true(model.hasStages);
    });

    test('returns false while campaign does not contain stages', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        targetProfileHasStage: false,
      });

      assert.false(model.hasStages);
    });
  });

  module('#hasExternalId', function () {
    test('returns false while campaign does not contain IdPixLabel', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        idPixLabel: null,
      });

      assert.false(model.hasExternalId);
    });

    test('returns false while idPixLabel is empty', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        idPixLabel: '',
      });

      assert.false(model.hasExternalId);
    });

    test('returns true while campaign contain idPixLabel', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        idPixLabel: 'krakow',
      });

      assert.true(model.hasExternalId);
    });
  });

  module('#hasBadges', function () {
    test('returns true while campaign contains badges', function (assert) {
      const store = this.owner.lookup('service:store');

      const model = store.createRecord('campaign', {
        targetProfileThematicResultCount: 2,
      });

      assert.true(model.hasBadges);
    });

    test('returns false while campaign does not contain badges', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        targetProfileThematicResultCount: 0,
      });

      assert.false(model.hasBadges);
    });
  });

  module('#ownerFullName', function () {
    test('it should return the fullname, combination of last and first name', function (assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', { ownerFirstName: 'Jean-Baptiste', ownerLastName: 'Poquelin' });

      assert.strictEqual(model.ownerFullName, 'Jean-Baptiste Poquelin');
    });
  });
});
