import { setupTest } from 'ember-qunit';
import ENV from 'pix-orga/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | sup-organization-participant', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:sup-organization-participant');
    ajaxStub = sinon.stub();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForQuery', () => {
    test('should build query url from organization id', async function (assert) {
      const query = { filter: { organizationId: 'organizationId1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/organizations/organizationId1/sup-participants'));
      assert.strictEqual(query.organizationId, undefined);
    });
  });

  module('#updateRecord', function () {
    test('it performs the request to update the student number', async function (assert) {
      // given
      const studentId = 10;
      const studentNumber = 54321;
      const organizationId = 1;
      const snapshot = {
        id: studentId,
        adapterOptions: { updateStudentNumber: true, studentNumber, organizationId },
        attr: function () {
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
      const url = `${ENV.APP.API_HOST}/api/organizations/${organizationId}/sup-organization-learners/${studentId}`;

      // when
      await adapter.updateRecord(null, { modelName: 'students' }, snapshot);

      // then
      assert.ok(ajaxStub.calledWith(url, 'PATCH', { data }));
    });
  });

  module('#deleteParticipants', () => {
    test('should call participant deletion endpoint', async function (assert) {
      // given
      const organizationId = 1;
      const learner1Id = 2;
      const learner2Id = 3;

      // when
      adapter.deleteParticipants(organizationId, [learner1Id, learner2Id]);

      // then
      const url = `${ENV.APP.API_HOST}/api/organizations/${organizationId}/organization-learners`;
      const expectedData = {
        listLearners: [learner1Id, learner2Id],
      };
      assert.ok(ajaxStub.calledWithExactly(url, 'DELETE', { data: expectedData }));
    });
  });
});
