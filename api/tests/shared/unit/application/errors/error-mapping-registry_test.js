import { expect } from 'chai';
import Joi from 'joi';

import { ErrorMappingRegistry } from '../../../../../src/shared/application/errors/error-mapping-registry.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Shared | Unit | Application | ErrorMappingRegistry', function () {
  it('registers and maps the error', async function () {
    // given
    const registry = new ErrorMappingRegistry();
    class MyError extends Error {}

    // when
    registry.register([{ name: MyError.name, httpErrorFn: (error) => `Mapped error: ${error.name}` }]);
    const mapped = registry.mapToError(MyError);

    // then
    expect(mapped).to.be.equal('Mapped error: MyError');
  });

  describe('When the mapping is invalid', function () {
    it('throws a validation error on registering', async function () {
      // given
      const registry = new ErrorMappingRegistry();

      // when
      const error = await catchErr(registry.register, registry)([{ code: 'CODE' }]);

      // then
      expect(error).to.be.instanceOf(Joi.ValidationError);
    });
  });
});
