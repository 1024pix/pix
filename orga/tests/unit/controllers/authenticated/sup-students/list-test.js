import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-orga/config/environment';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sup-students/list', function(hooks) {
  setupTest(hooks);
  const currentUser = { organization: { id: 1 }, prescriber: { lang: 'fr' } };
  const session = { data: { authenticated: { access_token: 12345 } } };
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('service:intl').setLocale('fr');
    controller = this.owner.lookup('controller:authenticated/sup-students/list');
    controller.send = sinon.stub();
    controller.currentUser = currentUser;
  });

  module('#importStudents', function() {
    test('it sends the chosen file to the API', async function(assert) {
      const importStudentsURL = `${ENV.APP.API_HOST}/api/organizations/${currentUser.organization.id}/schooling-registrations/import-csv`;
      const headers = { Authorization: `Bearer ${12345}`, 'Accept-Language': controller.currentUser.prescriber.lang };
      const file = { uploadBinary: sinon.spy() };

      controller.session = session;
      controller.currentUser = currentUser;
      await controller.importStudents(file);

      assert.ok(file.uploadBinary.calledWith(importStudentsURL, { headers }));
    });

    module('manage CSV import errors', function(hooks) {
      let file;

      hooks.beforeEach(function() {
        controller.session = session;
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
        assert.equal(notificationMessage, '<div>Aucun étudiant n’a été importé.<br/>Veuillez réessayer ou nous contacter via <a target="_blank" rel="noopener noreferrer" href="https://support.pix.fr/support/tickets/new">le formulaire du centre d’aide</a></div>');
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
        assert.equal(notificationMessage, '<div>Aucun étudiant n’a été importé.<br/><strong>Error message</strong><br/> Veuillez modifier votre fichier et l’importer à nouveau.</div>');
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
        assert.equal(notificationMessage, '<div>Aucun étudiant n’a été importé.<br/><strong>Error message</strong><br/> Veuillez modifier votre fichier et l’importer à nouveau.</div>');
      });
    });
  });
});
