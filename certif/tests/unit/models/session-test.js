import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import config from '../../../config/environment';
import { FINALIZED, STARTED } from 'pix-certif/models/session';

module('Unit | Model | session', function(hooks) {
  setupTest(hooks);

  test('it should return the correct displayName', function(assert) {
    const store = this.owner.lookup('service:store');
    const model1 = run(() => store.createRecord('session', {
      id: 123,
      status: STARTED,
    }));
    const model2 = run(() => store.createRecord('session', {
      id: 1234,
      status: FINALIZED,
    }));

    assert.equal(model1.displayStatus, 'Prête');
    assert.equal(model2.displayStatus, 'Finalisée');
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
