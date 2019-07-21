import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/session | details-item', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display session details page', async function(assert) {
    // given
    const session = run(() => store.createRecord('session', {
      id: 1,
    }));

    this.set('session', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/details-item session=session}}`);

    // then
    assert.dom('.session-details-header__title').hasText('Session 1');
  });

  test('it should display properly formatted date and time related to the session', async function(assert) {
    // given
    const session = run(() => store.createRecord('session', {
      id: 1,
      date: '2019-02-18',
      time: '14:00:00',
    }));

    this.set('session', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/details-item session=session}}`);

    // then
    assert.dom('.session-details-header-datetime__date .content-text').hasText('lundi 18 févr. 2019');
    assert.dom('.session-details-header-datetime__time .content-text').hasText('14:00');
  });

  test('it should display a button to download an attendance sheet', async function(assert) {
    // given
    const session = run(() => store.createRecord('session', {
      id: 1,
    }));

    this.set('session', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/details-item session=session}}`);

    // then
    assert.dom('.session-details-controls__download-button').hasText('Télécharger le PV (.ods)');
    assert.dom('.session-details-controls__import-button').hasText('Importer des candidats');
  });

});
