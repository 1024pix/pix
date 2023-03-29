import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

import { decodeToken } from 'mon-pix/helpers/jwt';

module('Unit | Helpers | decodeToken', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('decodeToken', function () {
    test('should decode valid token', async function (assert) {
      const accessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdF9uYW1lIjoiRmlyc3QiLCJsYXN0X25hbWUiOiJMYXN0Iiwic2FtbF9pZCI6InNhbWxJRDEyMzQ1NjciLCJpYXQiOjE1OTc5Mjk0NDgsImV4cCI6MTU5NzkzMzA0OH0.bk7HPPwoa0bx6uxE92HXj1ak8DintQx5Id_1wyudZkg';
      const decodedToken = decodeToken(accessToken);
      const expectedResult = {
        first_name: 'First',
        last_name: 'Last',
        saml_id: 'samlID1234567',
        iat: 1597929448,
        exp: 1597933048,
      };
      assert.deepEqual(decodedToken, expectedResult);
    });

    test('should decode valid token with accented characters in firstName, lastName', async function (assert) {
      const accessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdF9uYW1lIjoiTm_DqW1pZSIsImxhc3RfbmFtZSI6IkHDrmnDr21hbsOoIiwic2FtbF9pZCI6InNhbWxJRDEyMzQ1NjciLCJpYXQiOjE1OTc5Mjk0NDgsImV4cCI6MTU5NzkzMzA0OH0.XZJCiDE73sTqHrSmVc99ynypQHzxw3wwZahLUvxgdZY';
      const decodedToken = decodeToken(accessToken);
      const expectedResult = {
        first_name: 'Noémie',
        last_name: 'Aîiïmanè',
        saml_id: 'samlID1234567',
        iat: 1597929448,
        exp: 1597933048,
      };
      assert.deepEqual(decodedToken, expectedResult);
    });

    test('should extract userId and source from token', function (assert) {
      // given
      const user_id = 1;
      const source = 'mon-pix';
      const token =
        'aaa.' +
        btoa(`{
        "user_id": ${user_id},
        "source": "${source}",
        "iat": 1545321469,
        "exp": 4702193958
      }`) +
        '.bbb';

      // when
      const dataFromToken = decodeToken(token);

      // then
      assert.strictEqual(dataFromToken.user_id, user_id);
      assert.strictEqual(dataFromToken.source, source);
    });
  });
});
