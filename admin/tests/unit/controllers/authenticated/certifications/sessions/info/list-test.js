import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Unit | Controller | authenticated/certifications/sessions/info/list', function(hooks) {

  setupTest(hooks);
  let controller;
  let model;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/list');
    model = EmberObject.create({ id: Symbol('an id'), certifications: [{}, {}] });
  });

  test('it exists', function(assert) {
    assert.ok(controller);
  });

  module('#canPublish', function() {

    test('should be false when there is a certification in error', async function(assert) {
      // given
      controller.set('model', model);
      controller.model.certifications = [{ status: 'validated' }, { status: 'error' }];

      // when
      const result = controller.canPublish;

      // then
      assert.equal(result, false);
    });

    test('should be false when there is a certification started', async function(assert) {
      // given
      controller.set('model', model);
      controller.model.certifications = [{ status: 'rejected' }, { status: 'started' }];

      // when
      const result = controller.canPublish;

      // then
      assert.equal(result, false);
    });

    test('should be true when there is no certification in error orstarted', async function(assert) {
      // given
      controller.set('model', model);
      controller.model.certifications = [{ status: 'rejected' }, { status: 'validated' }];

      // when
      const result = controller.canPublish;

      // then
      assert.equal(result, true);
    });
  });

  module('#displayCertificationStatusUpdateConfirmationModal', function() {

    module('when intention is publish', function() {

      test('should update modal message and button action to publish', async function(assert) {
        // given
        controller.set('model', model);
  
        // when
        await controller.actions.displayCertificationStatusUpdateConfirmationModal.call(controller);
  
        // then
        assert.equal(controller.confirmMessage, 'Souhaitez-vous publier la session ?');
        assert.equal(controller.confirmAction, 'publishSession');
        assert.equal(controller.displayConfirm, true);
      });
    });
    
    module('when intention is unpublish', function() {

      test('should update modal message and button action to unpublish', async function(assert) {
        // given
        controller.set('model', model);
  
        // when
        await controller.actions.displayCertificationStatusUpdateConfirmationModal.call(controller, 'unpublish');
  
        // then
        assert.equal(controller.confirmMessage, 'Souhaitez-vous dépublier la session ?');
        assert.equal(controller.confirmAction, 'unpublishSession');
        assert.equal(controller.displayConfirm, true);
      });
    });
  });

  module('#publishSession', function() {

    test('should save the session and reload the certifications', async function(assert) {
      // given
      controller.set('model', model);
      controller.model.save = sinon.stub();
      controller.model.certifications.reload = sinon.stub();
      controller.set('notifications', { success: sinon.stub() });

      // when
      await controller.actions.publishSession.call(controller);

      // then
      assert.ok(controller.model.save.calledWithExactly({ adapterOptions: { updatePublishedCertifications: true, isPublished: true } }));
      assert.ok(controller.model.certifications.reload.calledOnce);
      assert.ok(controller.notifications.success.calledOnce);
      assert.equal(controller.displayConfirm, false);
    });

    test('should throw a publish error if one', async function(assert) {
      // given
      controller.set('model', model);
      controller.model.save = sinon.stub().throws('some error');
      controller.set('notifications', { error: sinon.stub() });

      // when
      await controller.actions.publishSession.call(controller);

      // then
      assert.ok(controller.model.save.calledWithExactly({ adapterOptions: { updatePublishedCertifications: true, isPublished: true } }));
      assert.ok(controller.notifications.error.calledOnce);
    });
  });

  module('#unpublishSession', function() {

    test('should save session and reload the certifications', async function(assert) {
      // given
      controller.set('model', model);
      controller.model.save = sinon.stub();
      controller.model.certifications.reload = sinon.stub();
      controller.set('notifications', { success: sinon.stub() });

      // when
      await controller.actions.unpublishSession.call(controller);

      // then
      assert.ok(controller.model.save.calledWithExactly({ adapterOptions: { updatePublishedCertifications: true, isPublished: false } }));
      assert.ok(controller.model.certifications.reload.calledOnce);
      assert.ok(controller.notifications.success.calledOnce);
      assert.equal(controller.get('displayConfirm'), false);
    });

    test('should throw an unpublish error if one', async function(assert) {
      // given
      controller.set('model', model);
      controller.model.save = sinon.stub().throws('some error');
      controller.set('notifications', { error: sinon.stub() });

      // when
      await controller.actions.unpublishSession.call(controller);

      // then
      assert.ok(controller.model.save.calledWithExactly({ adapterOptions: { updatePublishedCertifications: true, isPublished: false } }));
      assert.ok(controller.notifications.error.calledOnce);
    });
  });
});
