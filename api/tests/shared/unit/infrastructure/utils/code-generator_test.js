import { generateCode } from '../../../../../src/shared/infrastructure/utils/code-generator.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Utils | code-generator', function () {
  describe('#generateCode', function () {
    it('should return random numerical string with six digits', function () {
      // given & when
      const result = generateCode(6, 'numeric');

      // then
      expect(result).to.match(/^\d{6}$/);
    });

    it('should return random numerical string with six digits without confusing char', function () {
      // given & when
      const result = generateCode(6, 'numericSafe');

      // then
      expect(result).to.match(/^[2-9]{6}$/);
    });

    it('should return random string with six alpha', function () {
      // given & when
      const result = generateCode(6, 'alpha');

      // then
      expect(result).to.match(/^[a-z]{6}$/i);
    });

    it('should return random string with six alpha without confusing char', function () {
      // given & when
      const result = generateCode(6, 'alphaSafe');

      // then
      expect(result).to.match(/^[abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ]{6}$/i);
    });

    it('should return random string with six alphanumeric', function () {
      // given & when
      const result = generateCode(6, 'alphanumeric');

      // then
      expect(result).to.match(/^[a-z0-9]{6}$/i);
    });

    it('should return random string with six alphanumeric without confusing char', function () {
      // given & when
      const result = generateCode(6, 'alphanumericSafe');

      // then
      expect(result).to.match(/^[abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$/i);
    });
  });
});
