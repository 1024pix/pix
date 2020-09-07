import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  getJoinErrors,
  getJoinErrorsMessageByShortCode,
  getRegisterErrors,
  getRegisterErrorsMessageByShortCode
} from 'mon-pix/utils/errors-messages';

describe('Unit | Utility | errors-messages', function() {

  const JOIN_SHORT_CODES_ERRORS = [ 'R11', 'R12', 'R13', 'R31', 'R32', 'R33' ];
  const REGISTER_SHORT_CODES_ERRORS = [ 'S51', 'S52', 'S53', 'S61', 'S62', 'S63' ];

  describe('#getJoinErrors', () => {

    it('should retrieve array of all join errors', () => {
      // when
      const errors = getJoinErrors();

      // then
      const shortCodes = errors.map((error) => error.shortCode);
      expect(shortCodes).to.deep.equal(JOIN_SHORT_CODES_ERRORS);
    });
  });

  describe('#getJoinErrorsMessageByShortCode', () => {

    it('should retrieve all messages by shortCode with value', () => {
      // given
      const value = 'someData';

      const expectedMessages = getJoinErrors()
        .map(({ message }) => message.replace('#VALUE#', value));

      // when
      const messages = JOIN_SHORT_CODES_ERRORS
        .map((shortCode) => getJoinErrorsMessageByShortCode({ shortCode, value }));

      // then
      expect(messages).to.deep.equal(expectedMessages);
    });
  });

  describe('#getRegisterErrors', () => {

    it('should retrieve array of all register errors', () => {
      // when
      const errors = getRegisterErrors();

      // then
      const shortCodes = errors.map((error) => error.shortCode);
      expect(shortCodes).to.deep.equal(REGISTER_SHORT_CODES_ERRORS);
    });
  });

  describe('#getRegisteErrorsMessageByShortCode', () => {

    it('should retrieve all messages by shortCode with values', () => {
      // given
      const value = 'someData';

      const expectedMessages = getRegisterErrors()
        .map(({ message }) => message.replace('#VALUE#', value));

      // when
      const messages = REGISTER_SHORT_CODES_ERRORS
        .map((shortCode) => getRegisterErrorsMessageByShortCode({ shortCode, value }));

      // then
      expect(messages).to.deep.equal(expectedMessages);
    });
  });

});
