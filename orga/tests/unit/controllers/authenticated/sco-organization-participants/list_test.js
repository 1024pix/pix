import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sco-organization-participants/list', function (hooks) {
  setupTest(hooks);
  const files = Symbol('files');
  const currentUser = { organization: { id: 1 } };
  let controller;
  let importStudentStub;

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('fr');
    controller = this.owner.lookup('controller:authenticated/sco-organization-participants/list');
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
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun élève n’a été importé.<br/>Veuillez réessayer ou nous contacter via <a target="_blank" rel="noopener noreferrer" href="https://support.pix.fr/support/tickets/new">le formulaire du centre d’aide</a>.</div>',
        );
      });

      test('notify a detailed error message if 412 error', async function (assert) {
        importStudentStub.rejects({ errors: [{ status: '412', detail: 'Error message' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez vérifier ou modifier votre base élèves et importer à nouveau.</div>',
        );
      });

      test('notify a detailed error message if 413 error', async function (assert) {
        importStudentStub.rejects({ errors: [{ status: '413', detail: 'Error message' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez vérifier ou modifier votre base élèves et importer à nouveau.</div>',
        );
      });

      test('notify a detailed error message if 422 error', async function (assert) {
        importStudentStub.rejects({ errors: [{ status: '422', detail: 'Error message' }] });

        // when
        await controller.importStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          '<div>Aucun élève n’a été importé.<br/><strong>Error message</strong><br/> Veuillez vérifier ou modifier votre base élèves et importer à nouveau.</div>',
        );
      });
    });
  });

  module('#resetFiltering', function () {
    test('resets every filters', async function (assert) {
      // given
      controller.search = 'th';
      controller.divisions = ['ing'];
      controller.connectionTypes = 'co';
      controller.certificability = ['ool'];
      controller.pageNumber = 1;
      controller.pageSize = 10;

      // when
      controller.resetFiltering();

      // then
      assert.strictEqual(controller.search, null);
      assert.deepEqual(controller.divisions, []);
      assert.deepEqual(controller.connectionTypes, []);
      assert.deepEqual(controller.certificability, []);
      assert.strictEqual(controller.pageNumber, null);
      assert.strictEqual(controller.pageSize, 10);
    });
  });

  module('#triggerFiltering', function () {
    module('when the filters contain a valued field', function () {
      test('updates the value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', 'new-value');

        // then
        assert.strictEqual(controller.someField, 'new-value');
      });
    });

    module('when the filters contain an empty string', function () {
      test('clear the searched value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', '');

        // then
        assert.strictEqual(controller.someField, undefined);
      });
    });
  });

  module('#sortByDivision', function () {
    test('update sorting value and reset other', function (assert) {
      // given
      controller.divisionSort = null;
      controller.participationCountOrder = 'Godzilla';
      controller.lastnameSort = 'Kong';
      controller.pageNumber = 9999;
      // when
      controller.sortByDivision('desc');

      // then
      assert.strictEqual(controller.divisionSort, 'desc');
      assert.strictEqual(controller.participationCountOrder, null);
      assert.strictEqual(controller.lastnameSort, null);
      assert.strictEqual(controller.pageNumber, null);
    });
  });

  module('#sortByLastname', function () {
    test('update sorting value and reset other', function (assert) {
      // given
      controller.lastnameSort = null;
      controller.divisionSort = 'king';
      controller.participationCountOrder = 'Godzilla';
      controller.pageNumber = 9999;
      // when
      controller.sortByLastname('desc');

      // then
      assert.strictEqual(controller.lastnameSort, 'desc');
      assert.strictEqual(controller.divisionSort, null);
      assert.strictEqual(controller.participationCountOrder, null);
      assert.strictEqual(controller.pageNumber, null);
    });
  });

  module('#sortByParticipationCount', function () {
    test('update sorting value and reset other', function (assert) {
      // given
      controller.participationCountOrder = null;
      controller.divisionSort = 'king';
      controller.lastnameSort = 'T-Rex';
      controller.pageNumber = 9999;
      // when
      controller.sortByParticipationCount('desc');

      // then
      assert.strictEqual(controller.participationCountOrder, 'desc');
      assert.strictEqual(controller.lastnameSort, null);
      assert.strictEqual(controller.divisionSort, null);
      assert.strictEqual(controller.pageNumber, null);
    });
  });
});
