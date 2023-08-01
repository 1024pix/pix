import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sup-organization-participants/import', function (hooks) {
  setupTest(hooks);
  const files = Symbol('files');
  const currentUser = { organization: { id: 1 } };
  let controller;
  let addStudentsCsvStub;
  let replaceStudentsCsvStub;

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('fr');
    controller = this.owner.lookup('controller:authenticated/sup-organization-participants/import');
    controller.send = sinon.stub();
    controller.router.transitionTo = sinon.stub();
    controller.currentUser = currentUser;

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('students-import');
    addStudentsCsvStub = sinon.stub(adapter, 'addStudentsCsv');
    replaceStudentsCsvStub = sinon.stub(adapter, 'replaceStudentsCsv');
  });

  module('#importStudents', function () {
    test('it sends the chosen file to the API', async function (assert) {
      await controller.importStudents(files);

      assert.ok(addStudentsCsvStub.calledWith(1, files));
    });

    module('manage CSV import errors', function (hooks) {
      hooks.beforeEach(function () {
        controller.notifications.sendError = sinon.spy();
      });

      test('notify a global error message if error not handled', async function (assert) {
        addStudentsCsvStub.rejects({ errors: [{ status: '401' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun étudiant n’a été importé.<br/>Veuillez réessayer ou nous contacter via <a target="_blank" rel="noopener noreferrer" href="https://support.pix.fr/support/tickets/new">le formulaire du centre d’aide</a></div>',
        );
      });

      test('notify a detailed error message if 412 error', async function (assert) {
        addStudentsCsvStub.rejects({ errors: [{ status: '412', detail: 'Error message' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun étudiant n’a été importé.<br/><strong>Error message</strong><br/> Veuillez modifier votre fichier et l’importer à nouveau.</div>',
        );
      });

      test('notify a detailed error message if 413 error', async function (assert) {
        addStudentsCsvStub.rejects({ errors: [{ status: '413', detail: 'Error message' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun étudiant n’a été importé.<br/><strong>Error message</strong><br/> Veuillez modifier votre fichier et l’importer à nouveau.</div>',
        );
      });
    });
  });

  module('#replaceStudents', function () {
    test('it sends the chosen file to the API for replacing registrations', async function (assert) {
      await controller.replaceStudents(files);

      assert.ok(replaceStudentsCsvStub.calledWith(1, files));
    });

    module('manage CSV import errors', function (hooks) {
      hooks.beforeEach(function () {
        controller.notifications.sendError = sinon.spy();
      });

      test('notify a global error message if error not handled when replacing registrations', async function (assert) {
        replaceStudentsCsvStub.rejects({ errors: [{ status: '401' }] });

        // when
        await controller.replaceStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun étudiant n’a été importé.<br/>Veuillez réessayer ou nous contacter via <a target="_blank" rel="noopener noreferrer" href="https://support.pix.fr/support/tickets/new">le formulaire du centre d’aide</a></div>',
        );
      });

      test('notify a detailed error message if 412 error when replacing registrations', async function (assert) {
        replaceStudentsCsvStub.rejects({ errors: [{ status: '412', detail: 'Error message' }] });

        // when
        await controller.replaceStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun étudiant n’a été importé.<br/><strong>Error message</strong><br/> Veuillez modifier votre fichier et l’importer à nouveau.</div>',
        );
      });

      test('notify a detailed error message if 413 error when replacing registrations when replacing registrations', async function (assert) {
        replaceStudentsCsvStub.rejects({ errors: [{ status: '413', detail: 'Error message' }] });

        // when
        await controller.replaceStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun étudiant n’a été importé.<br/><strong>Error message</strong><br/> Veuillez modifier votre fichier et l’importer à nouveau.</div>',
        );
      });
    });
  });
});
