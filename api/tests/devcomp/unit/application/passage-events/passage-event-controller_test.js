import sinon from 'sinon';

import { passageEventsController } from '../../../../../src/devcomp/application/passage-events/passage-event-controller.js';
import { BadRequestError } from '../../../../../src/shared/application/errors/http-errors.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Devcomp | Application | Passage-Events | Controller', function () {
  const payload = { data: { attributes: { events: [] } } };

  describe('#create', function () {
    it('should call recordPassageEvents use-case', async function () {
      // given
      const usecases = { recordPassageEvents: sinon.stub() };
      usecases.recordPassageEvents.resolves();
      const userId = 123;

      const request = {
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      await passageEventsController.create(request, hFake, { usecases });

      // then
      expect(usecases.recordPassageEvents).to.have.been.calledWithExactly({ events: [], userId });
    });

    context('when recordPassageEvents usecase throws domain error', function () {
      it('should throw a "BadRequestError"', async function () {
        // given
        const usecases = {
          recordPassageEvents: sinon.stub(),
        };
        usecases.recordPassageEvents.rejects(new DomainError('domainError'));

        // when
        const promise = passageEventsController.create({ payload }, hFake, { usecases });

        // then
        await expect(promise).to.be.rejectedWith(BadRequestError, 'domainError');
      });
    });
  });
});
