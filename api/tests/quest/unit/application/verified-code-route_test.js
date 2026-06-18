import sinon from 'sinon';

import { verifiedCodeRoute as moduleUnderTest } from '../../../../src/quest/application/verified-code-route.js';
import { usecases } from '../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('Quest | Unit | Application | verified-code-route', function () {
  describe('GET /api/verified-codes/{code}', function () {
    it('should call getVerifiedCode use case and serialize verified code', async function () {
      // given
      sinon.stub(usecases, 'getVerifiedCode').rejects(new NotFoundError());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/verified-codes/NOTHINGTT');

      // then
      expect(usecases.getVerifiedCode).to.have.been.calledWithExactly({ code: 'NOTHINGTT' });
      expect(response.statusCode).to.equal(404);
    });
  });
});
