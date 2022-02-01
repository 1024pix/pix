import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | SessionSupervising::Header', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('it renders the session information', async function (assert) {
    // given
    const sesionForSupervising = store.createRecord('session-for-supervising', {
      id: 12345,
      date: '2020-01-01',
      time: '12:00:00',
      room: 'Salle 12',
      examiner: 'Star Lord',
      certificationCenterName: 'Knowhere',
      certificationCandidates: [],
    });

    this.set('sessionForSupervising', sesionForSupervising);

    // when
    await render(hbs`<SessionSupervising::Header @session={{this.sessionForSupervising}}  />`);

    // then
    assert.contains('12345');
    assert.contains('Salle 12');
    assert.contains('Star Lord');
    assert.contains('01/01/2020');
    assert.contains('12:00');
  });
});
