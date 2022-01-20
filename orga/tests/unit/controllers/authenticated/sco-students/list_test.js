import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sco-students/list', function (hooks) {
  setupTest(hooks);
  const files = Symbol('files');
  const currentUser = { organization: { id: 1 } };
  let controller;
  let importStudentStub;

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('fr');
    controller = this.owner.lookup('controller:authenticated/sco-students/list');
    controller.send = sinon.stub();
    controller.currentUser = currentUser;

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('students-import');
    importStudentStub = sinon.stub(adapter, 'importStudentsSiecle');
  });

  module('#importStudents', function () {
    module('when file is csv', function () {
      test('it sends the chosen csv file to the API', async function (assert) {
        currentUser.isAgriculture = true;

        await controller.importStudents(files);

        assert.ok(importStudentStub.calledWith(1, files, 'csv'));
      });
    });

    module('when file is xml', function () {
      test('it sends the chosen xml file to the API', async function (assert) {
        currentUser.isAgriculture = false;

        await controller.importStudents(files);

        assert.ok(importStudentStub.calledWith(1, files, 'xml'));
      });
    });

    module('manage import errors', function (hooks) {
      hooks.beforeEach(function () {
        controller.notifications.sendError = sinon.spy();
      });

      test('notify a global error message if error not handled', async function (assert) {
        importStudentStub.rejects({ errors: [{ status: '401' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.string;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(
          notificationMessage,
          '<div>Aucun élève n’a été importé.<br/>Veuillez réessayer ou nous contacter via <a target="_blank" rel="noopener noreferrer" href="https://support.pix.fr/support/tickets/new">le formulaire du centre d’aide</a>.</div>'
        );
      });

      test('notify a detailed error message if 412 error', async function (assert) {
        importStudentStub.rejects({ errors: [{ status: '412', detail: 'Error message' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.string;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(
          notificationMessage,
          '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez vérifier ou modifier votre base élèves et importer à nouveau.</div>'
        );
      });

      test('notify a detailed error message if 413 error', async function (assert) {
        importStudentStub.rejects({ errors: [{ status: '413', detail: 'Error message' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.string;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(
          notificationMessage,
          '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez vérifier ou modifier votre base élèves et importer à nouveau.</div>'
        );
      });

      test('notify a detailed error message if 422 error', async function (assert) {
        importStudentStub.rejects({ errors: [{ status: '422', detail: 'Error message' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.string;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(
          notificationMessage,
          '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez vérifier ou modifier votre base élèves et importer à nouveau.</div>'
        );
      });
    });
  });
});
