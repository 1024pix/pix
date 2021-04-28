import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  getJoinErrorsMessageByShortCode,
  getRegisterErrorsMessageByShortCode,
} from 'mon-pix/utils/errors-messages';

describe('Unit | Utility | errors-messages', function() {

  const JOIN_SHORT_CODES_ERRORS = [ 'R11', 'R12', 'R13', 'R31', 'R32', 'R33', 'R70' ];
  const REGISTER_SHORT_CODES_ERRORS = [ 'S51', 'S52', 'S53', 'S61', 'S62', 'S63' ];

  describe('#getJoinErrorsMessageByShortCode', () => {

    it('should retrieve all messages by shortCode with value', () => {
      // given
      const expectedMessages = JOIN_SHORT_CODES_ERRORS
        .map((shortCode) => 'api-error-messages.join-error.' + shortCode.toLowerCase());

      // when
      const messages = JOIN_SHORT_CODES_ERRORS
        .map((shortCode) => getJoinErrorsMessageByShortCode({ shortCode }));

      // then
      expect(messages).to.deep.equal(expectedMessages);
    });
  });

  describe('#getRegisteErrorsMessageByShortCode', () => {

    it('should retrieve all messages by shortCode with values', () => {
      // given
      const expectedMessages = REGISTER_SHORT_CODES_ERRORS
        .map((shortCode) => 'api-error-messages.register-error.' + shortCode.toLowerCase());

      // when
      const messages = REGISTER_SHORT_CODES_ERRORS
        .map((shortCode) => getRegisterErrorsMessageByShortCode({ shortCode }));

      // then
      expect(messages).to.deep.equal(expectedMessages);
    });
  });

});
