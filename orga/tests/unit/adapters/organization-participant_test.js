import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import ENV from 'pix-orga/config/environment';

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
});
