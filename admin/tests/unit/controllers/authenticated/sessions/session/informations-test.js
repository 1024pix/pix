import Service from '@ember/service';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/sessions/session/informations', function (hooks) {
  setupIntlRenderingTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/sessions/session/informations');
    const success = sinon.stub().returns();
    const error = sinon.stub().returns();
    controller.notifications = { success, error };
  });

  module('#unfinalizeSession', function () {
    test('it should call the unfinalize route', async function (assert) {
      // given
      controller.model = { save: sinon.stub(), reload: sinon.stub() };
      controller.model.save.withArgs({ adapterOptions: { unfinalize: true } }).resolves();
      controller.model.reload.resolves();

      // when
      await controller.actions.unfinalizeSession.call(controller);

      // then
      assert.ok(controller.model.save.calledWithExactly({ adapterOptions: { unfinalize: true } }));
      assert.ok(controller.model.reload.calledOnce);
      assert.ok(controller.notifications.success.calledWithExactly('La session a bien été définalisée'));
    });

    module('when save failed', function () {
      test('it should show a notification error', async function (assert) {
        // given
        controller.model = { save: sinon.stub(), reload: sinon.stub() };
        controller.model.save.withArgs({ adapterOptions: { unfinalize: true } }).rejects();

        // when
        await controller.actions.unfinalizeSession.call(controller);

        // then
        assert.ok(controller.model.save.calledOnce);
        assert.ok(controller.model.reload.notCalled);
        assert.ok(controller.notifications.error.calledWithExactly('Erreur lors de la définalisation de la session'));
      });
    });
  });

  module('#checkForAssignment', function (hooks) {
    hooks.beforeEach(function () {
      const save = sinon.stub();
      controller.model = { save };
    });

    module('when a user is already assigned to session', function () {
      test('it should show the modal', async function (assert) {
        //given
        const fullName = 'Helmut Fritz';
        const getFullName = sinon.stub().returns(fullName);
        controller.model.assignedCertificationOfficer = { get: getFullName };

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.true(controller.isShowingModal);
        assert.strictEqual(controller.modalConfirmAction, controller.confirmAssignment);
        assert.deepEqual(
          controller.modalMessage,
          this.intl.t('pages.sessions.informations.assignment-confirmation-modal', { fullName, htmlSafe: true }),
        );
        assert.strictEqual(controller.modalTitle, 'Assignation de la session');
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
          controller.model.save.calledWithExactly({ adapterOptions: { certificationOfficerAssignment: true } }),
        );
        assert.ok(controller.notifications.success.calledWithExactly('La session vous a correctement été assignée'));
        assert.false(controller.isShowingModal);
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
        assert.false(controller.isShowingModal);
      });
    });
  });

  module('#cancelAssignment', function () {
    test('it should close the modal', async function (assert) {
      // when
      await controller.actions.cancelModal.call(controller);

      // then
      assert.false(controller.isShowingModal);
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
      assert.false(controller.isShowingModal);
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
      assert.false(controller.isShowingModal);
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
      assert.strictEqual(controller.copyButtonText, 'Copié');
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
      assert.strictEqual(controller.copyButtonText, 'Erreur !');
      assert.ok(controller.isCopyButtonClicked);
      assert.ok(window.setTimeout);
    });
  });

  module('#isCurrentUserAssignedToSession', function () {
    test('it should return true if current user is assigned to session', async function (assert) {
      // given
      const getUserIdStub = sinon.stub();
      class CurrentUserStub extends Service {
        adminMember = { get: getUserIdStub.withArgs('userId').returns(3) };
      }
      this.owner.register('service:currentUser', CurrentUserStub);

      const getIdStub = sinon.stub();
      controller.model = {
        assignedCertificationOfficer: { get: getIdStub.withArgs('id').returns('3') },
      };

      // when / then
      assert.true(controller.isCurrentUserAssignedToSession);
    });
  });
});
