import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import config from '../../../config/environment';
import { CREATED, FINALIZED } from 'pix-certif/models/session';

module('Unit | Model | session', function(hooks) {
  setupTest(hooks);

  test('it should return the correct displayName', function(assert) {
    const store = this.owner.lookup('service:store');
    const model1 = run(() => store.createRecord('session', {
      id: 123,
      status: CREATED,
    }));
    const model2 = run(() => store.createRecord('session', {
      id: 1234,
      status: FINALIZED,
    }));
    const model3 = run(() => store.createRecord('session', {
      id: 12345,
      status: 'processed',
    }));

    assert.equal(model1.displayStatus, 'Créée');
    assert.equal(model2.displayStatus, 'Finalisée');
    assert.equal(model3.displayStatus, 'Traitée');
  });

  test('it should set hasBeenFinalized properly', function(assert) {
    const store = this.owner.lookup('service:store');
    const model1 = run(() => store.createRecord('session', {
      id: 1123,
      status: 'started',
    }));
    const model2 = run(() => store.createRecord('session', {
      id: 11234,
      status: 'finalized',
    }));
    const model3 = run(() => store.createRecord('session', {
      id: 112345,
      status: 'processed',
    }));

    assert.equal(model1.hasBeenFinalized, false);
    assert.equal(model2.hasBeenFinalized, true);
    assert.equal(model3.hasBeenFinalized, true);
  });

  test('it should return the correct urlToUpload', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('session', { id: 1 }));

    assert.equal(model.urlToUpload, `${config.APP.API_HOST}/api/sessions/1/certification-candidates/import`);
  });

  test('it should return the correct urlToDownload', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('session', { id: 1 }));
    model.session = { data: { authenticated: { access_token: '123' } } };

    assert.equal(model.urlToDownload, `${config.APP.API_HOST}/api/sessions/1/attendance-sheet?accessToken=123`);
  });
});
