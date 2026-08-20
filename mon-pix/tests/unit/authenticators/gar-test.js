import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Authenticator | gar', function (hooks) {
  setupTest(hooks);

  module('#authenticate', function () {
    test('should authenticate the user', async function (assert) {
      // given
      const authenticator = this.owner.lookup('authenticator:gar');
      const token =
        'aaa.' +
        btoa(`{
        "user_id": 1,
        "source": "gar",
        "iat": 1545321469,
        "exp": 4702193958
      }`) +
        '.bbb';

      // when
      const result = await authenticator.authenticate(token);

      // then
      assert.deepEqual(result, {
        token_type: 'bearer',
        access_token: token,
        user_id: 1,
        expiresAt: 4702193958000,
        source: 'gar',
      });
    });
  });

  module('restore', function () {
    module('when there is no access_token', function () {
      test('it rejects', async function (assert) {
        // given
        const authenticator = this.owner.lookup('authenticator:gar');
        const data = {};

        // when & then
        await assert.rejects(authenticator.restore(data));
      });
    });

    module('when there is an access_token', function () {
      module('when the access_token is expired', function () {
        test('it rejects', async function (assert) {
          // given
          const authenticator = this.owner.lookup('authenticator:gar');
          const data = { expiresAt: new Date().getTime(), access_token: 'accessTokenData' };

          // when & then
          await assert.rejects(authenticator.restore(data));
        });
      });

      module('when the access_token is not expired', function () {
        test('it returns the still valid data', async function (assert) {
          // given
          const authenticator = this.owner.lookup('authenticator:gar');
          const data = { expiresAt: new Date().getTime() + 60000, access_token: 'accessTokenData' };

          // when
          const result = await authenticator.restore(data);

          // then
          assert.strictEqual(result, data);
        });
      });
    });
  });
});
