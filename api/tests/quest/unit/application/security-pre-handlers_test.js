import sinon from 'sinon';

import { checkUserCanManageCombinedCourse } from '../../../../src/quest/application/security-pre-handlers.js';
import { usecases } from '../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { expect } from '../../../test-helper.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Quest | Unit | Application | SecurityPreHandlers', function () {
  describe('#checkUserCanManageCombinedCourse', function () {
    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: 1234 } },
        params: { combinedCourseId: 'questId123' },
      };
    });

    context('Successful case', function () {
      it('should authorize access when user is authorized to access combined course', async function () {
        // given
        sinon.stub(usecases, 'canManageCombinedCourse').resolves(true);

        // when
        const response = await checkUserCanManageCombinedCourse(request, hFake);

        // then
        expect(response.source).to.be.true;
        expect(usecases.canManageCombinedCourse).to.have.been.calledOnceWithExactly({
          userId: 1234,
          combinedCourseId: 'questId123',
        });
      });
    });

    context('Error cases', function () {
      it('should forbid access when user is not authorized', async function () {
        // given
        sinon.stub(usecases, 'canManageCombinedCourse').resolves(false);

        // when
        const response = await checkUserCanManageCombinedCourse(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid access when user is not authorized resource does not exist', async function () {
        // given
        sinon.stub(usecases, 'canManageCombinedCourse').rejects(new NotFoundError());

        // when
        const response = await checkUserCanManageCombinedCourse(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should throw if usecase return an unknown error', async function () {
        // given
        const WhatIsThisError = class extends Error {};
        sinon.stub(usecases, 'canManageCombinedCourse').rejects(new WhatIsThisError());

        // when
        const error = await catchErr(checkUserCanManageCombinedCourse)(request, hFake);

        // then
        expect(error).to.be.instanceOf(WhatIsThisError);
      });
    });
  });
});
