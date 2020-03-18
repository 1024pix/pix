import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/sessions | list-items', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display sessions list', async function(assert) {
    // given
    const now = new Date();
    const displayDate = now.toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const sessions = [
      { id: 1, certificationCenter: 'Centre A', date: now, time: '14:00:00', displayDate },
      { id: 2, certificationCenter: 'Centre B', date: now, time: '14:00:00', displayDate },
      { id: 3, certificationCenter: 'Centre C', date: now, time: '14:00:00', displayDate },
    ];

    sessions.meta = { rowCount: 3 };
    const triggerFiltering = function() {};

    this.set('sessions', sessions);
    this.set('triggerFiltering', triggerFiltering);

    // when
    await render(hbs`{{routes/authenticated/sessions/list-items sessions=sessions triggerFiltering=triggerFiltering}}`);

    // then
    assert.dom('table tbody tr:first-child td:first-child').hasText(sessions[0].id.toString());
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText(sessions[0].certificationCenter);
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText(displayDate + ' à ' + sessions[0].time);
    assert.dom('table tbody tr').exists({ count: 3 });
  });
});
