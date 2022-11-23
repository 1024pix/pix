import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import * as jwt from 'mon-pix/helpers/jwt';
import sinon from 'sinon';

module('Unit | Authenticator | gar', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#authenticate', function () {
    test('should authenticate the user', async function (assert) {
      // given
      const authenticator = this.owner.lookup('authenticator:gar');
      const token = Symbol('mon super token');

      sinon.stub(jwt, 'decodeToken').returns({ user_id: 1, source: 'gar' });

      // when
      const expectedResult = await authenticator.authenticate(token);

      // then
      sinon.assert.calledWith(jwt.decodeToken, token);
      assert.deepEqual(expectedResult, {
        token_type: 'bearer',
        access_token: token,
        user_id: 1,
        source: 'gar',
      });
      assert.ok(true);
    });
  });
});
