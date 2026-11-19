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

  module('#query', () => {
    test('should request the sup participants endpoint and strip organizationId from the query filter', async function (assert) {
      // given
      const query = { filter: { organizationId: 'organizationId1', divisions: ['3A'] }, page: { number: 2 } };

      // when
      await adapter.query(null, { modelName: 'sup-organization-participant' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.ok(url.endsWith('/api/organizations/organizationId1/sup-participants'));
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: { filter: { divisions: ['3A'] }, page: { number: 2 } } });
      assert.deepEqual(query, {
        filter: { organizationId: 'organizationId1', divisions: ['3A'] },
        page: { number: 2 },
      });
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
