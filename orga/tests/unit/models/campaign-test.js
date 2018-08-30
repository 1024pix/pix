import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | campaign', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('campaign', {}));
    assert.ok(model);
  });

  test('it should return the right data in the campaign model', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('campaign', {
      name: 'Fake name',
      code: 'ABC123'
    }));
    assert.equal(model.name, 'Fake name');
    assert.equal(model.code, 'ABC123');
  });

  test('it should construct the url to result of the campaign', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'Fake name',
      code: 'ABC123',
      tokenForCampaignResults: 'token'
    }));
    assert.equal(model.urlToResult, 'http://localhost:3000/api/campaigns/1/csvResults?accessToken=token');
  })
});
