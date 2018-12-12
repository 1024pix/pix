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

    this.set('model', sessions);

    // when
    await render(hbs`{{routes/authenticated/sessions/list-items sessions=model}}`);

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

    this.set('model', sessions);

    // when
    await render(hbs`{{routes/authenticated/sessions/list-items sessions=model}}`);

    // then
    assert.dom('.session-list__item:first-child .session-field').hasText('1');
  });

  test('it should sort the sessions from recent to older', async function(assert) {
    // given
    const session1 = { id: 1, date: new Date('2018-08-06'), time: '08:00' };
    const session2 = { id: 2, date: new Date('2018-08-07'), time: '08:00' };
    const session3 = { id: 3, date: new Date('2018-08-07'), time: '18:00' };
    const sessions = [session1, session2, session3];

    this.set('model', sessions);

    // when
    await render(hbs`{{routes/authenticated/sessions/list-items sessions=model}}`);

    // then
    assert.dom('.session-list__item').exists({ count: 3 });
    assert.dom('.session-list div:nth-child(1) .session-list__item .session-field').hasText('3');
    assert.dom('.session-list div:nth-child(2) .session-list__item .session-field').hasText('2');
    assert.dom('.session-list div:nth-child(3) .session-list__item .session-field').hasText('1');
  });
});
