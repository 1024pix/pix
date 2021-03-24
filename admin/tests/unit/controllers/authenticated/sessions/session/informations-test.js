import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/session/informations', (hooks) => {
  setupTest(hooks);

  let store;
  let controller;
  let model;
  const err = { error: 'some error' };

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/sessions/session/informations');
    store = this.owner.lookup('service:store');

    model = { id: 'an id', juryCertificationSummaries: [{ id: 'juryCertifSummary1' }, { id: 'juryCertifSummary2' }] };

    const success = sinon.stub().returns();
    const error = sinon.stub().returns();
    controller.notifications = { success, error };
  });

  module('#downloadSessionResultFile', () => {

    let url, fileName, validToken;

    hooks.beforeEach(() => {
      url = `/api/admin/sessions/${model.id}/results`;
      fileName = 'resultats-session.csv';
      validToken = Symbol('my super token');

      const save = sinon.stub();
      save.withArgs({ url, fileName, token: 'validToken' }).returns();
      save.throws(err);

      controller.fileSaver = { save };
    });

    test('should launch the download of result file', async function(assert) {
      // given
      controller.model = model;
      const isAuthenticated = sinon.stub().returns();
      controller.session = { isAuthenticated, data: { authenticated: { access_token: validToken } } };

      // when
      await controller.actions.downloadSessionResultFile.call(controller);

      // then
      assert.ok(controller.fileSaver.save.calledWithExactly({ url, fileName, token: validToken }));
    });

    test('should notify error when session result service throws', async function(assert) {
      // given
      controller.model = { id: 'another model' };
      const isAuthenticated = sinon.stub().rejects();
      controller.session = { isAuthenticated, data: { authenticated: { token: '' } } };

      // when
      await controller.actions.downloadSessionResultFile.call(controller);

      // then
      assert.ok(controller.notifications.error.calledWithExactly(err));
    });
  });

  module('#downloadBeforeJuryFile', () => {

    hooks.beforeEach(() => {
      sinon.stub(store, 'peekRecord');
      store.peekRecord.withArgs('certification', 'juryCertifSummary1').returns('certification1');
      store.peekRecord.withArgs('certification', 'juryCertifSummary2').returns('certification2');

      const downloadJuryFile = sinon.stub();
      downloadJuryFile.withArgs({ sessionId: model.id, certifications: ['certification1', 'certification2'] }).returns();
      downloadJuryFile.throws(err);

      controller.sessionInfoService = { downloadJuryFile };
    });

    test('should launch the download of before jury file', async function(assert) {
      // given
      controller.model = model;

      // when
      await controller.actions.downloadBeforeJuryFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadJuryFile.calledWithExactly({ sessionId: model.id, certifications: ['certification1', 'certification2'] }));
    });

    test('should notify error when jury file service throws', async function(assert) {
      // given
      controller.model = { id: 'another model', juryCertificationSummaries: [] };

      // when
      await controller.actions.downloadBeforeJuryFile.call(controller);

      // then
      assert.ok(controller.sessionInfoService.downloadJuryFile.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly(err));
    });
  });

  module('#checkForAssignment', (hooks) => {

    hooks.beforeEach(() => {
      const save = sinon.stub();
      controller.model = { save };
    });

    module('when a user is already assigned to session', () => {

      test('it should show the modal', async function(assert) {
        //given
        const getId = sinon.stub().returns(true);
        controller.model.assignedCertificationOfficer = { get: getId };

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.equal(controller.isShowingAssignmentModal, true);
        assert.equal(controller.model.save.notCalled, true);
      });
    });

    module('when a user is not assigned to session', () => {

      test('it should assign user to session', async function(assert) {
        // given
        const getId = sinon.stub().returns(false);
        controller.model.assignedCertificationOfficer = { get: getId };
        controller.model.save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).resolves();

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.ok(controller.model.save.calledWithExactly({ adapterOptions: { certificationOfficerAssignment: true } }));
        assert.ok(controller.notifications.success.calledWithExactly('La session vous a correctement été assignée'));
        assert.equal(controller.isShowingAssignmentModal, false);
      });

      test('it should show a notification error when save failed', async function(assert) {
        // given
        const getId = sinon.stub().returns(false);
        controller.model.assignedCertificationOfficer = { get: getId };
        controller.model.save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).rejects();

        // when
        await controller.actions.checkForAssignment.call(controller);

        // then
        assert.ok(controller.model.save.calledOnce);
        assert.ok(controller.notifications.error.calledWithExactly('Erreur lors de l\'assignation à la session'));
        assert.equal(controller.isShowingAssignmentModal, false);
      });
    });
  });

  module('#cancelAssignment', () => {

    test('it should close the modal', async function(assert) {
      // when
      await controller.actions.cancelAssignment.call(controller);

      // then
      assert.equal(controller.isShowingAssignmentModal, false);
    });
  });

  module('#confirmAssignment', (hooks) => {

    hooks.beforeEach(() => {
      const save = sinon.stub();
      save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).resolves();
      controller.model = { save };
    });

    test('it should assign user to session too', async function(assert) {
      // given
      controller.model.save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).resolves();

      // when
      await controller.actions.confirmAssignment.call(controller);

      // then
      assert.ok(controller.model.save.calledWithExactly({ adapterOptions: { certificationOfficerAssignment: true } }));
      assert.ok(controller.notifications.success.calledWithExactly('La session vous a correctement été assignée'));
      assert.equal(controller.isShowingAssignmentModal, false);
    });

    test('it should show a notification error when save failed too', async function(assert) {
      // given
      const save = sinon.stub();
      save.withArgs({ adapterOptions: { certificationOfficerAssignment: true } }).rejects();
      controller.model = { save };

      // when
      await controller.actions.confirmAssignment.call(controller);

      // then
      assert.ok(controller.model.save.calledOnce);
      assert.ok(controller.notifications.error.calledWithExactly('Erreur lors de l\'assignation à la session'));
      assert.equal(controller.isShowingAssignmentModal, false);
    });
  });

  module('#copyResultsDownloadLink', (hooks) => {

    hooks.afterEach(() => {
      sinon.restore();
    });

    test('it should retrieve link from api and copy it', async (assert) => {
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

    test('it should notify error when retrieving link fails', async (assert) => {
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
