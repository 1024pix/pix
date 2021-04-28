import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | campaign', function(hooks) {
  setupTest(hooks);

  test('it should return the right data in the campaign model', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('campaign', {
      name: 'Fake name',
      code: 'ABC123',
    });
    assert.equal(model.name, 'Fake name');
    assert.equal(model.code, 'ABC123');
  });

  module('#urlToResult', function() {
    test('it should construct the url to result of the campaign with type assessment', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        id: 1,
        name: 'Fake name',
        code: 'ABC123',
        tokenForCampaignResults: 'token',
        type: 'ASSESSMENT',
      });
      assert.equal(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-assessment-results?accessToken=token');
    });

    test('it should construct the url to result of the campaign with type profiles collection', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        id: 1,
        name: 'Fake name',
        code: 'ABC123',
        tokenForCampaignResults: 'token',
        type: 'PROFILES_COLLECTION',
      });
      assert.equal(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csv-profiles-collection-results?accessToken=token');
    });
  });

  module('#readableType', function(hooks) {
    let store;

    hooks.beforeEach(function() {
      store = this.owner.lookup('service:store');
    });

    test('it should compute the readableType property when type is ASSESSMENT', function(assert) {
      // when
      const model = store.createRecord('campaign', { type: 'ASSESSMENT' });

      // then
      assert.equal(model.readableType, 'Évaluation');
    });

    test('it should compute the readableType property when type is PROFILES_COLLECTION', function(assert) {
      // when
      const model = store.createRecord('campaign', { type: 'PROFILES_COLLECTION' });

      // then
      assert.equal(model.readableType, 'Collecte de profils');
    });
  });

  module('#hasStages', function() {
    test('returns true while campaign contains stages', function(assert) {
      const store = this.owner.lookup('service:store');
      const stage = store.createRecord('stage', { threshold: 45 });
      const model = store.createRecord('campaign', {
        stages: [stage],
      });

      assert.equal(model.hasStages, true);
    });

    test('returns false while campaign does not contain stages', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        stages: [],
      });

      assert.equal(model.hasStages, false);
    });
  });

  module('#hasBadges', function() {
    test('returns true while campaign contains badges', function(assert) {
      const store = this.owner.lookup('service:store');
      const badge = store.createRecord('badge', { threshold: 45 });
      const model = store.createRecord('campaign', {
        badges: [badge],
      });

      assert.equal(model.hasBadges, true);
    });

    test('returns false while campaign does not contain badges', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', {
        badges: [],
      });

      assert.equal(model.hasBadges, false);
    });
  });

  module('#creatorFullName', function() {
    test('it should return the fullname, combination of last and first name', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign', { creatorFirstName: 'Jean-Baptiste', creatorLastName: 'Poquelin' });

      assert.equal(model.creatorFullName, 'Jean-Baptiste Poquelin');
    });
  });
});
