import { expect, hFake, sinon } from '../../../test-helper.js';

import { NotFoundError } from '../../../../src/shared/domain/errors.js';

import { HttpErrors } from '../../../../src/shared/application/http-errors.js';
import { handle } from '../../../../src/shared/application/error-manager.js';

describe('Shared | Unit | Application | ErrorManager', function () {
  describe('#_mapToHttpError', function () {
    it('should instantiate NotFoundError when NotFoundError', async function () {
      // given
      const error = new NotFoundError();
      sinon.stub(HttpErrors, 'NotFoundError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.NotFoundError).to.have.been.calledWithExactly(error.message);
    });
  });
});
