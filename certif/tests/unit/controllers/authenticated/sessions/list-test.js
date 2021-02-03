import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';

import config from 'pix-certif/config/environment';

module('Unit | Controller | authenticated/sessions/list', function(hooks) {
  setupTest(hooks);

  module('#computed hasSession', function() {

    test('it should know when there is no sessions', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/sessions/list');
      const sessions = ArrayProxy.create({
        content: [],
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
        content: [session1],
      });
      controller.model = sessions;

      // when
      const hasSession = controller.hasSession;

      // then
      assert.equal(hasSession, true);
    });
  });

  module('#shouldDisplayResultRecipientInfoMessage', function() {
    module('when the toggle FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS is disabled', function() {
      test('should return false', function(assert) {
        // given
        config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = false;
        const controller = this.owner.lookup('controller:authenticated/sessions/list');

        // when
        const shouldDisplayResultRecipientInfoMessage = controller.shouldDisplayResultRecipientInfoMessage;

        // then
        assert.notOk(shouldDisplayResultRecipientInfoMessage);
      });
    });

    module('when the toggle FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS is enabled', function() {
      test('should return true', function(assert) {
        // given
        config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS = true;
        const controller = this.owner.lookup('controller:authenticated/sessions/list');

        // when
        const shouldDisplayResultRecipientInfoMessage = controller.shouldDisplayResultRecipientInfoMessage;

        // then
        assert.ok(shouldDisplayResultRecipientInfoMessage);
      });
    });
  });
});
