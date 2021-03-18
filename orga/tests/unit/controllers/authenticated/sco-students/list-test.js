import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-orga/config/environment';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sco-students/list', function(hooks) {
  setupTest(hooks);
  const currentUser = { organization: { id: 1 } };
  const session = { data: { authenticated: { access_token: 12345 } } };
  let controller;

  hooks.beforeEach(function() {
    this.owner.lookup('service:intl').setLocale('fr');
    controller = this.owner.lookup('controller:authenticated/sco-students/list');
    controller.send = sinon.stub();
    controller.session = session;
  });

  module('#importStudents', function() {
    module('when file is csv', function() {

      test('it sends the chosen csv file to the API', async function(assert) {
        const importStudentsURL = `${ENV.APP.API_HOST}/api/organizations/${currentUser.organization.id}/schooling-registrations/import-siecle?format=csv`;
        const headers = { Authorization: `Bearer ${12345}` };
        const file = { uploadBinary: sinon.spy() };

        currentUser.isAgriculture = true;
        controller.currentUser = currentUser;
        await controller.importStudents(file);

        assert.ok(file.uploadBinary.calledWith(importStudentsURL, { headers }));
      });
    });

    module('when file is xml', function() {

      test('it sends the chosen xml file to the API', async function(assert) {
        const importStudentsURL = `${ENV.APP.API_HOST}/api/organizations/${currentUser.organization.id}/schooling-registrations/import-siecle?format=xml`;
        const headers = { Authorization: `Bearer ${12345}` };
        const file = { uploadBinary: sinon.spy() };

        currentUser.isAgriculture = false;
        controller.currentUser = currentUser;
        await controller.importStudents(file);

        assert.ok(file.uploadBinary.calledWith(importStudentsURL, { headers }));
      });
    });

    module('manage import errors', function(hooks) {
      let file;

      hooks.beforeEach(function() {
        controller.currentUser = currentUser;
        file = { uploadBinary: sinon.stub() };
        controller.notifications.sendError = sinon.spy();
      });

      test('notify a global error message if error not handled', async function(assert) {
        file.uploadBinary.rejects({
          body: { errors: [{ status: '401' }] },
        });

        // when
        await controller.importStudents(file);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.string;
        assert.equal(notificationMessage, '<div>Aucun élève n’a été importé.<br/>Veuillez réessayer ou nous contacter via <a target="_blank" rel="noopener noreferrer" href="https://support.pix.fr/support/tickets/new">le formulaire du centre d’aide</a>.</div>');
      });

      test('notify a detailed error message if 409 error', async function(assert) {
        file.uploadBinary.rejects({
          body: { errors: [
            { status: '409', detail: 'Error message' },
          ] },
        });

        // when
        await controller.importStudents(file);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.string;
        assert.equal(notificationMessage, '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez modifier votre fichier et l’importer à nouveau.</div>');
      });

      test('notify a detailed error message if 412 error', async function(assert) {
        file.uploadBinary.rejects({
          body: { errors: [
            { status: '412', detail: 'Error message' },
          ] },
        });

        // when
        await controller.importStudents(file);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.string;
        assert.equal(notificationMessage, '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez vérifier ou modifier votre fichier et l’importer à nouveau.</div>');
      });

      test('notify a detailed error message if 413 error', async function(assert) {
        file.uploadBinary.rejects({
          body: { errors: [
            { status: '413', detail: 'Error message' },
          ] },
        });

        // when
        await controller.importStudents(file);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.string;
        assert.equal(notificationMessage, '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez vérifier ou modifier votre fichier et l’importer à nouveau.</div>');
      });

      test('notify a detailed error message if 422 error', async function(assert) {
        file.uploadBinary.rejects({
          body: { errors: [
            { status: '422', detail: 'Error message' },
          ] },
        });

        // when
        await controller.importStudents(file);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.string;
        assert.equal(notificationMessage, '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez vérifier ou modifier votre fichier et l’importer à nouveau.</div>');
      });
    });
  });
});
