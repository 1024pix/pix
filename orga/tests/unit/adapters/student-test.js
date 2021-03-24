import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import ENV from 'pix-orga/config/environment';

module('Unit | Adapters | student', (hooks) => {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:student');
    ajaxStub = sinon.stub();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForQuery', () => {
    test('should build query url from organization id', async function(assert) {
      const query = { filter: { organizationId: 'organizationId1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/organizations/organizationId1/students'));
      assert.equal(query.organizationId, undefined);
    });
  });

  module('#dissociateUser', () => {

    test('it performs the request to dissociate user from student', async function(assert) {
      // given
      const model = { id: 12345 };
      const data = {
        data: {
          attributes: {
            'schooling-registration-id': model.id,
          },
        },
      };
      const url = `${ENV.APP.API_HOST}/api/schooling-registration-user-associations`;

      // when
      await adapter.dissociateUser(model);

      // then
      assert.ok(ajaxStub.calledWith(url, 'DELETE', { data }));
    });
  });

  module('#updateRecord', () => {
    test('it performs the request to update the student number', async function(assert) {
      // given
      const studentId = 10;
      const studentNumber = 54321;
      const organizationId = 1;
      const snapshot = {
        id: studentId,
        adapterOptions: { updateStudentNumber: true, studentNumber, organizationId },
        attr: function() {
          return studentNumber;
        },
      };

      const data = {
        data: {
          attributes: {
            'student-number': studentNumber,
          },
        },
      };
      const url = `${ENV.APP.API_HOST}/api/organizations/${organizationId}/schooling-registration-user-associations/${studentId}`;

      // when
      await adapter.updateRecord(null, { modelName: 'students' }, snapshot);

      // then
      assert.ok(ajaxStub.calledWith(url, 'PATCH', { data }));
    });
  });
});
