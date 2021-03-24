import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/list', (hooks) => {
  setupTest(hooks);

  module('#model', () => {

    test('it should return certification center sessions', async function(assert) {
      // given
      const reloadedSessions = Symbol('Sessions');
      const reloadStub = sinon.stub().resolves(reloadedSessions);
      const expectedSessions = { reload: reloadStub };
      const currentCertificationCenter = { hasMany: sinon.stub().withArgs('sessions').returns(expectedSessions) };
      const route = this.owner.lookup('route:authenticated/sessions/list');
      route.currentUser = { currentCertificationCenter };

      // when
      const actualSessions = await route.model();

      // then
      assert.equal(actualSessions, reloadedSessions);
    });
  });
});
