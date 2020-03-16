import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/session/certifications', function(hooks) {
  
  setupTest(hooks);
  let controller;
  let model;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/sessions/session/certifications');
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

  module('#displayCertificationStatusUpdateConfirmationModal', function(hooks) {

    hooks.beforeEach(function() {
      controller.set('model', model);
    });

    module('when session is not yet published', function() {

      test('should update modal message to publish', async function(assert) {
        // given
        model.canPublish = true;
        model.isPublished = false;
  
        // when
        await controller.actions.displayCertificationStatusUpdateConfirmationModal.call(controller);
  
        // then
        assert.equal(controller.confirmMessage, 'Souhaitez-vous publier la session ?');
        assert.equal(controller.displayConfirm, true);
      });
    });
    
    module('when session is published', function() {

      test('should update modal message to unpublish', async function(assert) {
        // given
        model.isPublished = true;

        // when
        await controller.actions.displayCertificationStatusUpdateConfirmationModal.call(controller);

        // then
        assert.equal(controller.confirmMessage, 'Souhaitez-vous dépublier la session ?');
        assert.equal(controller.displayConfirm, true);
      });
    });
  });

  module('#toggleSessionPublication', function(hooks) {

    let notificationsStub;

    hooks.beforeEach(function() {
      notificationsStub = { success: sinon.stub() };
      controller.set('model', model);
      controller.set('notifications', notificationsStub);
      controller.set('displayConfirm', true);
      controller.model.save = sinon.stub();
      controller.model.certifications = { reload: sinon.stub() };
    });

    test('should notify an error if request failed', async function(assert) {
      // given
      const anError = 'anError';
      Object.assign(notificationsStub, { error: sinon.stub() });
      controller.model.save = sinon.stub().throws(anError);

      // when
      await controller.actions.toggleSessionPublication.call(controller);

      // then
      assert.throws(model.save, anError);
      sinon.assert.called(notificationsStub.error);
      assert.equal(controller.displayConfirm, false);
    });
    
    module('when session is not yet published', function() {

      test('shoud publish all certifications', async function(assert) {
        // given
        controller.model.isPublished = false;
  
        // when
        await controller.actions.toggleSessionPublication.call(controller);
  
        // then
        sinon.assert.calledWith(controller.model.save, { adapterOptions: { updatePublishedCertifications: true, toPublish: true } });
        sinon.assert.calledWith(notificationsStub.success, 'Les certifications ont été correctement publiées.');
        assert.equal(controller.displayConfirm, false);
      });
    });

    module('when session is published', function() {

      test('should unpublish all certifications', async function(assert) {
        // given
        model.isPublished = true;
  
        // when
        await controller.actions.toggleSessionPublication.call(controller);
  
        // then
        sinon.assert.calledWith(model.save, { adapterOptions: { updatePublishedCertifications: true, toPublish: false } });
        sinon.assert.calledWith(notificationsStub.success, 'Les certifications ont été correctement dépubliées.');
        assert.equal(controller.displayConfirm, false);
      });
    });
  });
});
