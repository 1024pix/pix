import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Unit | Controller | authenticated/sessions/list/to-be-published', function(hooks) {
  setupTest(hooks);

  module('#publishSession', function() {

    test('should publish session', async function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated.sessions.list.to-be-published');
      const publishMock = sinon.stub();
      publishMock.resolves();
      const toBePublishedSession = {
        publish: publishMock,
      };

      // when
      await controller.send('publishSession', toBePublishedSession);

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
      const toBePublishedSession = {
        publish: publishMock,
      };

      // when
      await controller.send('publishSession', toBePublishedSession);

      // then
      sinon.assert.calledWith(errorMock, publishError);
      assert.ok(true);
    });
  });

  module('#showConfirmModal', function() {
    test('should change shouldShowModal to true', async function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated.sessions.list.to-be-published');

      // when
      await controller.showConfirmModal();

      // then
      assert.ok(controller.shouldShowModal);
    });
  });

  module('#hideConfirmModal', function() {
    test('should change shouldShowModal to false', async function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated.sessions.list.to-be-published');

      // when
      await controller.hideConfirmModal();

      // then
      assert.notOk(controller.shouldShowModal);
    });
  });

  module('#batchPublishSessions', function() {
    test('should publish several sessions', async function(assert) {
      // given
      const successMock = sinon.stub();
      class NotificationsStub extends Service {
        success = successMock;
      }
      this.owner.register('service:notifications', NotificationsStub);
      const controller = this.owner.lookup('controller:authenticated.sessions.list.to-be-published');
      const unloadRecord = sinon.stub().resolves();
      const sessions = [EmberObject.create({ id: 1, unloadRecord }), EmberObject.create({ id: 2, unloadRecord }) ];
      const store = {
        adapterFor: sinon.stub().returns({
          publishSessionInBatch: sinon.stub().resolves(),
        }),
      };
      controller.set('model', sessions);
      controller.set('store', store);

      // when
      await controller.batchPublishSessions();

      // then
      sinon.assert.calledTwice(unloadRecord);
      sinon.assert.calledOnce(successMock);
      assert.ok(true);
    });

    test('should notify error on notifications service when publication fail', async function(assert) {
      // given
      const errorMock = sinon.stub();
      class NotificationsStub extends Service {
        error = errorMock;
      }
      this.owner.register('service:notifications', NotificationsStub);
      const controller = this.owner.lookup('controller:authenticated.sessions.list.to-be-published');

      const unloadRecord = sinon.stub().resolves();
      const sessions = [EmberObject.create({ id: 1, unloadRecord }), EmberObject.create({ id: 2, unloadRecord }) ];
      const publishError = { error: {
        errors: [
          { code: 'SESSION_BATCH_PUBLICATION_FAILED', details: 'Erreur dans la publication' },
        ],
      } };
      const store = {
        adapterFor: sinon.stub().returns({
          publishSessionInBatch: sinon.stub().rejects(publishError),
        }),
      };

      const send = sinon.stub().resolves();

      controller.set('send', send);
      controller.set('model', sessions);
      controller.set('store', store);

      // when
      await controller.batchPublishSessions();

      // then
      sinon.assert.calledWith(send, 'refreshModel');
      sinon.assert.calledWith(errorMock,
        { error: {
          errors: [
            { code: 'SESSION_BATCH_PUBLICATION_FAILED', details: 'Erreur dans la publication' },
          ],
        } },
      );
      assert.ok(true);
    });
  });
});
