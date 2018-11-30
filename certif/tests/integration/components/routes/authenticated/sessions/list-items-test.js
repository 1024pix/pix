import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/session | list-items', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of sessions', async function(assert) {
    // given
    const sessions = [
      {id: 1},
      {id: 2},
    ];

    this.set('sessions', sessions);

    // when
    await render(hbs`{{routes/authenticated/sessions/list-items sessions=sessions}}`);

    // then
    assert.dom('.session-list').exists();
    assert.dom('.session-list__item').exists({ count: 2 });
  });

  test('it should display the id of the sessions', async function(assert) {
    // given
    let store = this.owner.lookup('service:store');
    let session1 = run(() => store.createRecord('session', {
      id: 1,
    }));
    let session2 = run(() => store.createRecord('session', {
      id: 2,
    }));
    const sessions = [session1, session2];

    this.set('sessions', sessions);

    // when
    await render(hbs`{{routes/authenticated/sessions/list-items sessions=sessions}}`);

    // then
    assert.dom('.session-list__item:first-child .session-field').hasText('1');
  });
});
