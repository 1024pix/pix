import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';

module('Unit | Controller | authenticated/sessions/list', function(hooks) {
  setupTest(hooks);

  module('#computed hasSession', function() {

    test('it should know when there is no sessions', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/list');
      const sessions = ArrayProxy.create({
        content: []
      });
      controller.model = sessions;

      // when
      const hasSession = controller.hasSession;

      // then
      assert.equal(hasSession, false);
    });

    test('it should know when there are sessions', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/list');
      const session1 = { id: 1, date: new Date('2018-08-07T14:00:44Z') };
      const sessions = ArrayProxy.create({
        content: [session1]
      });
      controller.model = sessions;

      // when
      const hasSession = controller.hasSession;

      // then
      assert.equal(hasSession, true);
    });
  });
});
