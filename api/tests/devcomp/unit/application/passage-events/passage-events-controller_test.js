import { passageEventsController } from '../../../../../src/devcomp/application/passage-events/passage-events-controller.js';
import { BadRequestError } from '../../../../../src/shared/application/http-errors.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Application | Passage-Events | Controller', function () {
  describe('#create', function () {
    it('should call recordPassageEvents use-case', async function () {
      // given
      const serializedPayload = Symbol();
      const deserializedPayload = Symbol();
      const passageEventSerializer = {
        deserialize: sinon.stub().returns(deserializedPayload),
      };
      const usecases = {
        recordPassageEvents: sinon.stub(),
      };
      usecases.recordPassageEvents.resolves();
      const created = sinon.stub();
      const hStub = {
        response: () => ({ created }),
      };

      // when
      await passageEventsController.create({ payload: serializedPayload }, hStub, {
        usecases,
        passageEventSerializer,
      });

      // then
      expect(passageEventSerializer.deserialize).to.have.been.calledOnceWithExactly(serializedPayload);
      expect(usecases.recordPassageEvents).to.have.been.calledWithExactly({ events: deserializedPayload });
      expect(created).to.have.been.calledOnce;
    });

    context('when recordPassageEvents usecase throws domain error', function () {
      it('should throw a "BadRequestError"', async function () {
        // given
        const serializedPayload = Symbol();
        const deserializedPayload = Symbol();
        const passageEventSerializer = {
          deserialize: sinon.stub().returns(deserializedPayload),
        };
        const hStub = {};

        const usecases = {
          recordPassageEvents: sinon.stub(),
        };
        usecases.recordPassageEvents.rejects(new DomainError('domainError'));

        // when
        const promise = passageEventsController.create({ payload: serializedPayload }, hStub, {
          usecases,
          passageEventSerializer,
        });

        // then
        await expect(promise).to.be.rejectedWith(BadRequestError, 'domainError');
      });
    });
  });
});
