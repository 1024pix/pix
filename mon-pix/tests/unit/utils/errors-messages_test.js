import { getJoinErrorsMessageByShortCode, getRegisterErrorsMessageByShortCode } from 'mon-pix/utils/errors-messages';
import { module, test } from 'qunit';

module('Unit | Utility | errors-messages', function () {
  const JOIN_SHORT_CODES_ERRORS = ['R11', 'R12', 'R13', 'R31', 'R32', 'R33', 'R70'];
  const REGISTER_SHORT_CODES_ERRORS = ['S51', 'S52', 'S53', 'S61', 'S62', 'S63'];

  module('#getJoinErrorsMessageByShortCode', function () {
    test('should retrieve all messages by shortCode with value', function (assert) {
      // given
      const expectedMessages = JOIN_SHORT_CODES_ERRORS.map(
        (shortCode) => 'api-error-messages.join-error.' + shortCode.toLowerCase(),
      );

      // when
      const messages = JOIN_SHORT_CODES_ERRORS.map((shortCode) => getJoinErrorsMessageByShortCode({ shortCode }));

      // then
      assert.deepEqual(messages, expectedMessages);
    });
  });

  module('#getRegisteErrorsMessageByShortCode', function () {
    test('should retrieve all messages by shortCode with values', function (assert) {
      // given
      const expectedMessages = REGISTER_SHORT_CODES_ERRORS.map(
        (shortCode) => 'api-error-messages.register-error.' + shortCode.toLowerCase(),
      );

      // when
      const messages = REGISTER_SHORT_CODES_ERRORS.map((shortCode) =>
        getRegisterErrorsMessageByShortCode({ shortCode }),
      );

      // then
      assert.deepEqual(messages, expectedMessages);
    });
  });
});
