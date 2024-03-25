import { setupIntl } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
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
    test('should refresh the model', async (assert) => {
      await controller.importSupStudents(files);
      assert.ok(controller.send.calledWithExactly('refreshModel'));
    });
    module('refresh groups', () => {
      test('should refresh current groups', async (assert) => {
        await controller.importSupStudents(files);
        assert.ok(controller.send.calledWithExactly('refreshGroups'));
      });
    });
  });

  module('#importScoStudents', function () {
    test('should refresh the model', async (assert) => {
      await controller.importScoStudents(files);
      assert.ok(controller.send.calledWithExactly('refreshModel'));
    });
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
      });
    });
  });

  module('#replaceStudents', function () {
    test('it sends the chosen file to the API for replacing registrations', async function (assert) {
      await controller.replaceStudents(files);

      assert.ok(replaceStudentsCsvStub.calledWith(1, files));
    });
    test('should refresh the model', async (assert) => {
      await controller.replaceStudents(files);
      assert.ok(controller.send.calledWithExactly('refreshModel'));
    });
    module('refresh groups', () => {
      test('should refresh current groups', async (assert) => {
        await controller.replaceStudents(files);
        assert.ok(controller.send.calledWithExactly('refreshGroups'));
      });
    });
  });
});
