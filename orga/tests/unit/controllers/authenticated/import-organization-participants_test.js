import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import sinon from 'sinon';

module('Unit | Controller | authenticated/import-organization-participant', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);
  const files = Symbol('files');
  const currentUser = { organization: { id: 1 } };
  let controller;
  let addStudentsCsvStub;
  let replaceStudentsCsvStub;
  let importScoStudentStub;

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('fr');
    controller = this.owner.lookup('controller:authenticated/import-organization-participants');
    controller.send = sinon.stub();
    controller.currentUser = currentUser;
    controller.notifications = { sendError: sinon.stub(), sendSuccess: sinon.stub(), clearAll: sinon.stub() };

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('students-import');
    addStudentsCsvStub = sinon.stub(adapter, 'addStudentsCsv');
    replaceStudentsCsvStub = sinon.stub(adapter, 'replaceStudentsCsv');
    importScoStudentStub = sinon.stub(adapter, 'importStudentsSiecle');
  });

  module('#importSupStudents', function () {
    test('it sends the chosen file to the API', async function (assert) {
      await controller.importSupStudents(files);

      assert.ok(addStudentsCsvStub.calledWith(1, files));
    });

    module('manage CSV import errors', function (hooks) {
      hooks.beforeEach(function () {
        controller.notifications.sendError = sinon.spy();
      });

      test('notify a global error message if error not handled', async function (assert) {
        addStudentsCsvStub.rejects({ errors: [{ status: '401' }] });

        // when
        await controller.importSupStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
        );
      });

      test('notify a detailed error message if 412 error', async function (assert) {
        addStudentsCsvStub.rejects({ errors: [{ status: '412', detail: 'Error message' }] });

        // when
        await controller.importSupStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
        );
      });

      test('notify a detailed error message if 413 error', async function (assert) {
        addStudentsCsvStub.rejects({ errors: [{ status: '413', detail: 'Error message' }] });

        // when
        await controller.importSupStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
        );
      });
    });
  });

  module('#importScoStudents', function () {
    module('refresh divisions', () => {
      test('should refresh current divisions', async (assert) => {
        await controller.importScoStudents(files);
        assert.ok(controller.send.calledWithExactly('refreshDivisions'));
      });
    });

    module('when file is csv', function () {
      test('it sends the chosen csv file to the API', async function (assert) {
        currentUser.isAgriculture = true;

        await controller.importScoStudents(files);

        assert.ok(importScoStudentStub.calledWith(1, files, 'csv'));
      });
    });

    module('when file is xml', function () {
      test('it sends the chosen xml file to the API', async function (assert) {
        currentUser.isAgriculture = false;

        await controller.importScoStudents(files);

        assert.ok(importScoStudentStub.calledWith(1, files, 'xml'));
        assert.ok(controller.notifications.sendSuccess.calledOnce);
        assert.ok(controller.notifications.sendError.notCalled);
        assert.strictEqual(controller.warningBanner, null);
      });
    });

    module('manage import errors', function (hooks) {
      hooks.beforeEach(function () {
        controller.notifications.sendError = sinon.spy();
      });

      test('notify a global error message if error not handled', async function (assert) {
        importScoStudentStub.rejects({ errors: [{ status: '401' }] });

        // when
        await controller.importScoStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
        );
      });

      test('notify a detailed error message if 412 error', async function (assert) {
        importScoStudentStub.rejects({ errors: [{ status: '412', detail: 'Error message' }] });

        // when
        await controller.importScoStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
        );
      });

      test('notify a detailed error message if 413 error', async function (assert) {
        importScoStudentStub.rejects({ errors: [{ status: '413', detail: 'Error message' }] });

        // when
        await controller.importScoStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
        );
      });

      test('notify a detailed error message if 422 error', async function (assert) {
        importScoStudentStub.rejects({ errors: [{ status: '422', detail: 'Error message' }] });

        // when
        await controller.importScoStudents(files);

        // then
        const notificationMessage = controller.notifications.sendError.firstCall.firstArg.toString();

        assert.strictEqual(
          notificationMessage,
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
        );
      });

      test('should use error code and meta if provided', async function (assert) {
        importScoStudentStub.rejects({
          errors: [{ status: '422', code: 'SEX_CODE_REQUIRED', meta: { nationalStudentId: '1234' } }],
        });

        // when
        await controller.importScoStudents(files);

        // then
        const errorMessages = controller.errors;

        assert.true(
          errorMessages.includes(
            this.intl.t('api-error-messages.student-xml-import.sex-code-required', { nationalStudentId: '1234' }),
          ),
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
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
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
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
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
          this.intl.t('pages.organization-participants-import.error-panel.error-wrapper'),
        );
      });
    });
  });
});
