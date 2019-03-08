import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/session | list-items', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('goToDetailsSpy', () => {});
  });

  test('it should display a list of sessions', async function(assert) {
    // given
    const sessions = [
      {id: 1},
      {id: 2},
    ];

    this.set('model', sessions);

    // when
    await render(hbs`{{routes/authenticated/sessions/list-items goToDetails=(action goToDetailsSpy) sessions=model}}`);
    await waitFor('table tbody tr');

    // then
    assert.dom('table').exists();
    assert.dom('table tbody tr').exists({ count: 2 });
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
    await render(hbs`{{routes/authenticated/sessions/list-items goToDetails=(action goToDetailsSpy) sessions=model}}`);
    await waitFor('table tbody tr td');

    // then
    assert.dom('table tbody tr td').hasText('1');
  });

  test('it should display properly formatted dates', async function(assert) {
    // given
    let store = this.owner.lookup('service:store');
    let session1 = run(() => store.createRecord('session', {
      id: 1,
      date: new Date('2018-08-06')
    }));
    let session2 = run(() => store.createRecord('session', {
      id: 2,
      date: new Date('2018-08-07')
    }));
    const sessions = [session1, session2];

    this.set('model', sessions);

    // when
    await render(hbs`{{routes/authenticated/sessions/list-items goToDetails=(action goToDetailsSpy) sessions=model}}`);
    await waitFor('table tbody tr td');

    // then
    assert.dom('table tbody tr').exists({ count: 2 });
    assert.dom('table tbody tr:nth-child(1) td:nth-child(4)').hasText('07/08/2018');
    assert.dom('table tbody tr:nth-child(2) td:nth-child(4)').hasText('06/08/2018');
  });


  test('it should sort the sessions from recent to older', async function(assert) {
    // given
    const session1 = { id: 1, date: new Date('2018-08-06'), time: '08:00' };
    const session2 = { id: 2, date: new Date('2018-08-07'), time: '08:00' };
    const session3 = { id: 3, date: new Date('2018-08-07'), time: '18:00' };
    const sessions = [session1, session2, session3];

    this.set('model', sessions);

    // when
    await render(hbs`{{routes/authenticated/sessions/list-items goToDetails=(action goToDetailsSpy) sessions=model}}`);
    await waitFor('table tbody tr td');

    // then
    assert.dom('table tbody tr').exists({ count: 3 });
    assert.dom('table tbody tr:nth-child(1) td').hasText('3');
    assert.dom('table tbody tr:nth-child(2) td').hasText('2');
    assert.dom('table tbody tr:nth-child(3) td').hasText('1');
  });
});
