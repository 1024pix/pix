import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/session/informations', function(hooks) {
  setupTest(hooks);

  let controller;
  let model;
  let err;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/sessions/session/informations');

    // context for sessionInfoService stub
    model = { id: Symbol('an id'), certifications: [] };
    err = { error : 'some error' };

    // sessionInfoService stub
    const downloadSessionExportFile = sinon.stub();
    const downloadJuryFile = sinon.stub();
    downloadSessionExportFile.withArgs(model).returns();
    downloadSessionExportFile.withArgs().throws(err);
    downloadJuryFile.withArgs(model.id, model.certifications).returns();
    downloadJuryFile.throws(err);
    const sessionInfoServiceStub = { downloadSessionExportFile, downloadJuryFile };

    // notifications stub
    const success = sinon.stub();
    const error = sinon.stub();
    success.returns();
    error.returns();

    controller.notifications = { success, error };
    controller.sessionInfoService = sessionInfoServiceStub;
  });

  module('#downloadSessionResultFile', function() {

    test('should launch the download of result file', function(assert) {
      // given
      controller.model = model;

      // when
      controller.actions.downloadSessionResultFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadSessionExportFile.calledWithExactly(model));
    });

    test('should throw an error', function(assert) {
      // when
      controller.actions.downloadSessionResultFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadSessionExportFile.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly(err));
    });
  });

  module('#downloadBeforeJuryFile', function() {

    test('should launch the download of before jury file', function(assert) {
      // given
      const modelId = model.id;
      const modelCertifications = model.certifications;
      controller.model = model;

      // when
      controller.actions.downloadBeforeJuryFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadJuryFile.calledWithExactly(modelId, modelCertifications));
    });

    test('should throw an error if service is called with wrongs parameters', function(assert) {
      // given
      controller.model = 'wrong model';

      // when
      controller.actions.downloadBeforeJuryFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadJuryFile.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly(err));
    });
  });

  module('#assignSessionToCurrentUser', function() {

    test('should assign the current session to user', async function(assert) {
      // given
      const save = sinon.stub();
      save.withArgs({ adapterOptions: { userAssignment: true } }).resolves();
      controller.session = { save };

      // when
      await controller.actions.assignSessionToCurrentUser.call(controller);

      // then
      assert.ok(controller.session.save.calledWithExactly({ adapterOptions: { userAssignment: true } }));
      assert.ok(controller.notifications.success.calledWithExactly('La session vous a correctement été assignée'));
    });

    test('should throw an error if save is called with wrongs parameters', async function(assert) {
      // given
      const save = sinon.stub();
      save.withArgs({ adapterOptions: { userAssignment: true } }).rejects();
      controller.session = { save };

      // when
      await controller.actions.assignSessionToCurrentUser.call(controller);

      // then
      assert.ok(controller.session.save.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly('Erreur lors de l\'assignation à la session'));
    });
  });
});
