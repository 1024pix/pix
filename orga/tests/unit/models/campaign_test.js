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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(model.name, 'Fake name');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(model.code, 'ABC123');
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-assessment-results?accessToken=token');
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(
        model.urlToResult,
        'http://localhost:3000/api/campaigns/1/csv-profiles-collection-results?accessToken=token'
      );
    });
  });

  module('#readableType', function (hooks) {
    let store;

    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    test('it should compute the readableType property when type is ASSESSMENT', function (assert) {
      // when
      const model = store.createRecord('campaign', { type: 'ASSESSMENT' });

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.readableType, 'Évaluation');
    });

    test('it should compute the readableType property when type is PROFILES_COLLECTION', function (assert) {
      // when
      const model = store.createRecord('campaign', { type: 'PROFILES_COLLECTION' });

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.readableType, 'Collecte de profils');
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

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model.ownerFullName, 'Jean-Baptiste Poquelin');
    });
  });
});
