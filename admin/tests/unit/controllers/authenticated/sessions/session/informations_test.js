import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/session/informations', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/sessions/session/informations');
    const success = sinon.stub().returns();
    const error = sinon.stub().returns();
    controller.notifications = { success, error };
  });

  module('#checkForAssignment', function (hooks) {
    hooks.beforeEach(function () {
      const save = sinon.stub();
      controller.model = { save };
    });

    module('when a user is already assigned to session', function () {
      test('it should show the modal', async function (assert) {
        //given
        const getId = sinon.stub().returns(true);
        controller.model.assignedCertificationOfficer = { get: getId };

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.true(controller.isShowingAssignmentModal);
        assert.true(controller.model.save.notCalled);
      });
    });

    module('when a user is not assigned to session', function () {
      test('it should assign user to session', async function (assert) {
        // given
        const getId = sinon.stub().returns(false);
        controller.model.assignedCertificationOfficer = { get: getId };
        controller.model.save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).resolves();

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.ok(
          controller.model.save.calledWithExactly({ adapterOptions: { certificationOfficerAssignment: true } })
        );
        assert.ok(controller.notifications.success.calledWithExactly('La session vous a correctement été assignée'));
        assert.false(controller.isShowingAssignmentModal);
      });

      test('it should show a notification error when save failed', async function (assert) {
        // given
        const getId = sinon.stub().returns(false);
        controller.model.assignedCertificationOfficer = { get: getId };
        controller.model.save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).rejects();

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.ok(controller.model.save.calledOnce);
        assert.ok(controller.notifications.error.calledWithExactly("Erreur lors de l'assignation à la session"));
        assert.false(controller.isShowingAssignmentModal);
      });
    });
  });

  module('#cancelAssignment', function () {
    test('it should close the modal', async function (assert) {
      // when
      await controller.actions.cancelAssignment.call(controller);

      // then
      assert.false(controller.isShowingAssignmentModal);
    });
  });

  module('#confirmAssignment', function (hooks) {
    hooks.beforeEach(function () {
      const save = sinon.stub();
      save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).resolves();
      controller.model = { save };
    });

    test('it should assign user to session too', async function (assert) {
      // given
      controller.model.save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).resolves();

      // when
      await controller.actions.confirmAssignment.call(controller);

      // then
      assert.ok(controller.model.save.calledWithExactly({ adapterOptions: { certificationOfficerAssignment: true } }));
      assert.ok(controller.notifications.success.calledWithExactly('La session vous a correctement été assignée'));
      assert.false(controller.isShowingAssignmentModal);
    });

    test('it should show a notification error when save failed too', async function (assert) {
      // given
      const save = sinon.stub();
      save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).rejects();
      controller.model = { save };

      // when
      await controller.actions.confirmAssignment.call(controller);

      // then
      assert.ok(controller.model.save.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly("Erreur lors de l'assignation à la session"));
      assert.false(controller.isShowingAssignmentModal);
    });
  });

  module('#copyResultsDownloadLink', function (hooks) {
    hooks.afterEach(function () {
      sinon.restore();
    });

    test('it should retrieve link from api and copy it', async function (assert) {
      // given
      const getDownloadLink = sinon.stub();
      getDownloadLink.resolves('www.jeremypluquet.com');
      controller.model = { getDownloadLink };

      const writeTextStub = sinon.stub();
      writeTextStub.returns();
      sinon.stub(navigator, 'clipboard').value({
        writeText: writeTextStub,
      });
      sinon.stub(window, 'setTimeout').returns();

      // when
      await controller.actions.copyResultsDownloadLink.call(controller);

      // then
      assert.ok(writeTextStub.calledWithExactly('www.jeremypluquet.com'));
      assert.equal(controller.copyButtonText, 'Copié');
      assert.ok(controller.isCopyButtonClicked);
      assert.ok(window.setTimeout);
    });

    test('it should notify error when retrieving link fails', async function (assert) {
      // given
      const getDownloadLink = sinon.stub();
      getDownloadLink.rejects('An error');
      controller.model = { getDownloadLink };

      sinon.stub(window, 'setTimeout').returns();

      // when
      await controller.actions.copyResultsDownloadLink.call(controller);

      // then
      assert.equal(controller.copyButtonText, 'Erreur !');
      assert.ok(controller.isCopyButtonClicked);
      assert.ok(window.setTimeout);
    });
  });
});
