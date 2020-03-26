import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/session/informations', function(hooks) {
  setupTest(hooks);

  let controller;
  let sessionInfoServiceStub;
  let model;
  let error;
  let downloadSessionExportFile;
  let downloadJuryFile;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/sessions/session/informations');

    // context for sessionInfoService stub
    model = { id: Symbol('an id'), certifications: [] };
    error = { err : 'some error' };

    // sessionInfoService stub
    downloadSessionExportFile = sinon.stub();
    downloadSessionExportFile.withArgs(model).returns();
    downloadSessionExportFile.withArgs().throws(error);
    downloadJuryFile = sinon.stub();
    downloadJuryFile.withArgs(model.id, model.certifications).returns();
    downloadJuryFile.throws(error);
    sessionInfoServiceStub = { downloadSessionExportFile, downloadJuryFile };

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
      // given
      const notificationsStub = { error: sinon.stub() };
      controller.notifications = notificationsStub;

      // when
      controller.actions.downloadSessionResultFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadSessionExportFile.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly(error));
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
      const notificationsStub = { error: sinon.stub() };
      controller.notifications = notificationsStub;
      controller.model = 'wrong model';

      // when
      controller.actions.downloadBeforeJuryFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadJuryFile.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly(error));
    });
  });
});
