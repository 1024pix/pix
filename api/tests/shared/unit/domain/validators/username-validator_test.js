import Joi from 'joi';

import { UsernameSchema } from '../../../../../src/shared/domain/validators/username-validator.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | Validator | username-validator', function () {
  context('valid values', function () {
    ['john.doe2025', 'a.b9999', 'alice.smith0000'].forEach((value) => {
      it(`accepts "${value}"`, function () {
        // when
        const validation = UsernameSchema.validate(value);

        // then
        expect(validation.error).to.be.undefined;
      });
    });
  });

  context('invalid values', function () {
    [
      ['John.doe2025', 'contains an uppercase letter'],
      ['johndoe2025', 'has no dot separator'],
      ['john.doe123', 'has only 3 digits'],
      ['john.doe12345', 'has 5 digits'],
      ['john.2025', 'has no letters after the dot'],
      ['.doe2025', 'has no letters before the dot'],
      ['john.doe', 'has no digits'],
      ['1234.doe2025', 'starts with digits'],
      ['john.doe2025 ', 'has a trailing space'],
      [' john.doe2025', 'has a leading space'],
      ['john_doe2025', 'uses an underscore instead of a dot'],
      ['', 'is empty'],
    ].forEach(([value, reason]) => {
      it(`rejects "${value}" (${reason})`, function () {
        // when
        const validation = UsernameSchema.validate(value);

        // then
        expect(validation.error).to.be.instanceOf(Joi.ValidationError);
      });
    });
  });
});
