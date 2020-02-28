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

  module('#publishSession', function() {

    test('should save the session and reload the certifications', async function(assert) {
      // given

      controller.set('model', model);
      controller.model.save = sinon.stub();
      controller.model.certifications.reload = sinon.stub();

      // when
      await controller.actions.publishSession.call(controller);

      // then
      assert.ok(controller.model.save.calledWithExactly({ adapterOptions: { updatePublishedCertifications: true, isPublished: true } }));
      assert.ok(controller.model.certifications.reload.calledOnce);
    });
  });
});
