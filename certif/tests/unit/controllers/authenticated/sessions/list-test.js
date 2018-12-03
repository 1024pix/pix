import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';

module('Unit | Controller | authenticated/sessions/list', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:authenticated/sessions/list');
    assert.ok(controller);
  });

  test('it should sort the sessions from more recent to older', function(assert) {
    // given
    let controller = this.owner.lookup('controller:authenticated/sessions/list');
    const session1 = { id: 1, date: new Date('2018-08-06'), time: '08:00' };
    const session2 = { id: 2, date: new Date('2018-08-07'), time: '08:00' };
    const session3 = { id: 3, date: new Date('2018-08-07'), time: '18:00' };
    const sessions = ArrayProxy.create({
      content: [session1, session2, session3]
    });
    controller.set('model', sessions);

    // when
    const sortedSessions = controller.get('sortedSessions');

    // then
    assert.equal(sortedSessions[0].id, 3);
    assert.equal(sortedSessions[1].id, 2);
    assert.equal(sortedSessions[2].id, 1);
  });

  test('it should know when there is no sessions', function(assert) {

    // given
    let controller = this.owner.lookup('controller:authenticated/sessions/list');
    const sessions = ArrayProxy.create({
      content: []
    });
    controller.set('model', sessions);

    // when
    const hasSession = controller.get('hasSession');

    // then
    assert.equal(hasSession, false);
  });

  test('it should know when there are sessions', function(assert) {

    // given
    let controller = this.owner.lookup('controller:authenticated/sessions/list');
    const session1 = { id: 1, date: new Date('2018-08-07 14:00:44') };
    const sessions = ArrayProxy.create({
      content: [session1]
    });
    controller.set('model', sessions);

    // when
    const hasSession = controller.get('hasSession');

    // then
    assert.equal(hasSession, true);
  });
});
