import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/list/to-be-published', function(hooks) {
  setupTest(hooks);

  module('#publishSession', function() {

    test('should publish session', async function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated.sessions.list.to-be-published');
      const publishMock = sinon.stub();
      publishMock.resolves();
      const publishableSession = {
        publish: publishMock,
      };

      // when
      await controller.send('publishSession', publishableSession);

      // then
      sinon.assert.called(publishMock);
      assert.ok(true);
    });

    test('it should notify error on notifications service when publication fails', async function(assert) {
      // given
      const errorMock = sinon.stub();
      class NotificationsStub extends Service {
        error = errorMock;
      }
      this.owner.register('service:notifications', NotificationsStub);
      const controller = this.owner.lookup('controller:authenticated.sessions.list.to-be-published');
      const publishMock = sinon.stub();
      const publishError = new Error('someError');
      publishMock.rejects(publishError);
      const publishableSession = {
        publish: publishMock,
      };

      // when
      await controller.send('publishSession', publishableSession);

      // then
      sinon.assert.calledWith(errorMock, publishError);
      assert.ok(true);
    });
  });
});
