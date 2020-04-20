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

  module('#checkForAssignment', function(hooks) {

    hooks.beforeEach(function() {
      const save = sinon.stub();
      controller.session = { save };
    });

    module('when a user is already assigned to session', function() {

      test('it should show the modal', async function(assert) {
        //given
        controller.session.assignedCertificationOfficer = 'toto';

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.equal(controller.isShowingAssignmentModal, true);
        assert.equal(controller.session.save.notCalled, true);
      });
    });

    module('when a user is not assigned to session', function() {

      test('it should assign user to session', async function(assert) {
        // given
        controller.session.save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).resolves();

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.ok(controller.session.save.calledWithExactly({ adapterOptions: { certificationOfficerAssignment: true } }));
        assert.ok(controller.notifications.success.calledWithExactly('La session vous a correctement été assignée'));
        assert.equal(controller.isShowingAssignmentModal, false);
      });

      test('it should show a notification error when save failed', async function(assert) {
        // given
        controller.session.save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).rejects();

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.ok(controller.session.save.calledOnce);
        assert.ok(controller.notifications.error.calledWithExactly('Erreur lors de l\'assignation à la session'));
        assert.equal(controller.isShowingAssignmentModal, false);
      });
    });
  });

  module('#cancelAssignment', function() {

    test('it should close the modal', async function(assert) {
      // when
      await controller.actions.cancelAssignment.call(controller);

      // then
      assert.equal(controller.isShowingAssignmentModal, false);
    });
  });

  module('#confirmAssignment', function(hooks) {

    hooks.beforeEach(function() {
      const save = sinon.stub();
      save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).resolves();
      controller.session = { save };
    });

    test('it should assign user to session too', async function(assert) {
      // given
      controller.session.save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).resolves();

      // when
      await controller.actions.checkForAssignment.call(controller);

      // then
      assert.ok(controller.session.save.calledWithExactly({ adapterOptions: { certificationOfficerAssignment: true } }));
      assert.ok(controller.notifications.success.calledWithExactly('La session vous a correctement été assignée'));
      assert.equal(controller.isShowingAssignmentModal, false);
    });

    test('it should show a notification error when save failed too', async function(assert) {
      // given
      const save = sinon.stub();
      save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).rejects();
      controller.session = { save };

      // when
      await controller.actions.checkForAssignment.call(controller);

      // then
      assert.ok(controller.session.save.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly('Erreur lors de l\'assignation à la session'));
      assert.equal(controller.isShowingAssignmentModal, false);
    });
  });
});
