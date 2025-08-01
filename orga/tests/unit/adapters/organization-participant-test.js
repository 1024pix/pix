import { setupTest } from 'ember-qunit';
import ENV from 'pix-orga/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | organization-participant', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-participant');
    ajaxStub = sinon.stub();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForQuery', () => {
    test('should build query url from organization id', async function (assert) {
      const query = { filter: { organizationId: 'organizationId1' } };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/organizations/organizationId1/participants'));
      assert.strictEqual(query.organizationId, undefined);
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
  module('#addOralizationFeatureForParticipant', () => {
    test('should POST organization-learners/feature', async function (assert) {
      // given
      const organizationId = 1;
      const learnerId = 1;
      // when
      adapter.addOralizationFeatureForParticipant(learnerId, organizationId);

      // then
      const url = `${ENV.APP.API_HOST}/api/organizations/${organizationId}/organization-learners/${learnerId}/features/ORALIZATION`;

      assert.ok(ajaxStub.calledWithExactly(url, 'POST'));
    });
  });
  module('#removeOralizationFeatureForParticipant', () => {
    test('should DELETE organization-learners/feature', async function (assert) {
      // given
      const organizationId = 1;
      const learnerId = 1;
      // when
      adapter.removeOralizationFeatureForParticipant(learnerId, organizationId);

      // then
      const url = `${ENV.APP.API_HOST}/api/organizations/${organizationId}/organization-learners/${learnerId}/features/ORALIZATION`;

      assert.ok(ajaxStub.calledWithExactly(url, 'DELETE'));
    });
  });

  module('#updateParticipantName', () => {
    test('should PATCH organization-learner name', async function (assert) {
      // given
      const organizationId = 1;
      const learnerId = 2;
      const firstName = 'John';
      const lastName = 'Doe';

      // when
      adapter.updateParticipantName(organizationId, learnerId, firstName, lastName);

      // then
      const url = `${ENV.APP.API_HOST}/api/organizations/${organizationId}/organization-learners/${learnerId}`;
      const expectedData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      assert.ok(ajaxStub.calledWithExactly(url, 'PATCH', { data: expectedData }));
    });
  });
});
