import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/session/details | parameters-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display session details information', async function(assert) {
    // given
    const session = run(() => store.createRecord('session', {
      id: 1,
      address: '1 rue du Poil',
      accessCode: 'ABC123',
      date: '2000-11-11',
      description: 'Je suis une description',
      examiner: 'Mâton de Prison',
      room: 'Portes de l\'enfer',
      time: '13:00',
    }));
    this.set('session', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/details/parameters-tab session=session}}`);

    // then
    assert.dom('.session-details-container .session-details-row:first-child div:first-child span').hasText('1');
    assert.dom('.session-details-container .session-details-row:first-child div:nth-child(2) span').hasText('1 rue du Poil');
    assert.dom('.session-details-container .session-details-row:first-child div:nth-child(3) span').hasText('Portes de l\'enfer');
    assert.dom('.session-details-container .session-details-row:first-child div:nth-child(4) span').hasText('Mâton de Prison');
    assert.dom('.session-details-container .session-details-row:first-child div:nth-child(5) span:first-child').hasText('ABC123');
  });

});
