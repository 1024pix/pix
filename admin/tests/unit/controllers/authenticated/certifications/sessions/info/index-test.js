import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/certifications/sessions/info/index', function(hooks) {
  setupTest(hooks);

  let controller;
  let sessionInfoServiceStub;
  let model;
  let error;
  let downloadSessionExportFile;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/index');

    // context for sessionInfoService stub
    model = 'some model';
    error = { err : 'some error' };

    // sessionInfoService stub
    downloadSessionExportFile = sinon.stub();
    downloadSessionExportFile.withArgs(model).returns();
    downloadSessionExportFile.withArgs().throws(error);
    sessionInfoServiceStub = { downloadSessionExportFile };

    controller.set('sessionInfoService', sessionInfoServiceStub);
  });

  module('#downloadSessionResultFile', function() {

    test('should launch the download of result file', function(assert) {

      // given
      controller.set('model', model);

      // when
      controller.actions.downloadSessionResultFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadSessionExportFile.calledWithExactly(model));
    });

    test('should throw an error', function(assert) {

      // given
      const notificationsStub = { error: sinon.stub() };
      controller.set('notifications', notificationsStub);

      // when
      controller.actions.downloadSessionResultFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadSessionExportFile.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly(error));
    });
  });
});
