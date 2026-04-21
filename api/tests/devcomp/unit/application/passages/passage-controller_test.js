import sinon from 'sinon';

import { passageController } from '../../../../../src/devcomp/application/passages/passage-controller.js';

import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Devcomp | Application | Passages | Controller', function () {
  describe('#create', function () {
    it('should call createPassage and recordPassageEvents use-cases and return serialized passage', async function () {
      // given
      const serializedPassage = Symbol('serialized modules');
      const moduleId = Symbol('module-id');
      const moduleVersion = Symbol('module-version');
      const occurredAtDate = new Date('2025-04-29');
      const occurredAt = occurredAtDate.getTime();
      const sequenceNumber = Symbol('sequence-number');
      const passage = {
        id: Symbol('passageId'),
      };
      const userId = 123;
      const passageSerializer = {
        serialize: sinon.stub(),
      };
      passageSerializer.serialize.withArgs(passage).returns(serializedPassage);
      const hStub = {
        response: sinon.stub(),
      };
      const created = sinon.stub();
      hStub.response.withArgs(serializedPassage).returns({ created });

      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: {
          data: {
            attributes: {
              'module-id': moduleId,
              'module-version': moduleVersion,
              'occurred-at': occurredAt,
              'sequence-number': sequenceNumber,
            },
          },
        },
      };

      const passageStartedEvent = {
        occurredAt: occurredAtDate,
        passageId: passage.id,
        sequenceNumber,
        contentHash: moduleVersion,
        type: 'PASSAGE_STARTED',
      };

      const usecases = {
        createPassage: sinon.stub(),
        recordPassageEvents: sinon.stub(),
      };
      usecases.createPassage.withArgs({ moduleId, userId }).returns(passage);

      // when
      await passageController.create(request, hStub, {
        passageSerializer,
        usecases,
      });

      // then
      expect(created).to.have.been.called;
      expect(usecases.recordPassageEvents).to.have.been.calledOnceWith({ events: [passageStartedEvent] });
    });
  });

  describe('#verifyAndSaveAnswer', function () {
    it('should call verifyAndSave use-case and return serialized element-answer', async function () {
      // given
      const passageId = Symbol('passage-id');
      const elementId = Symbol('element-id');
      const userResponse = Symbol('user-response');
      const uselessField = Symbol('useless-field');

      const createdElementAnswer = Symbol('created element-answer');
      const usecases = {
        verifyAndSaveAnswer: sinon.stub(),
      };
      usecases.verifyAndSaveAnswer.withArgs({ passageId, elementId, userResponse }).resolves(createdElementAnswer);

      const hStub = {
        response: sinon.stub(),
      };

      const serializedElementAnswer = Symbol('serialized element-answer');

      const elementAnswerSerializer = {
        serialize: sinon.stub(),
      };
      elementAnswerSerializer.serialize.withArgs(createdElementAnswer).returns(serializedElementAnswer);

      const createdStub = sinon.stub();
      hStub.response.withArgs(serializedElementAnswer).returns({ created: createdStub });
      createdStub.returns(serializedElementAnswer);

      // when
      const result = await passageController.verifyAndSaveAnswer(
        {
          params: { passageId },
          payload: { data: { attributes: { 'element-id': elementId, 'user-response': userResponse, uselessField } } },
        },
        hStub,
        {
          usecases,
          elementAnswerSerializer,
        },
      );

      // then
      expect(result).to.equal(serializedElementAnswer);
    });
  });

  describe('#terminate', function () {
    it('should call terminate use-case and return serialized passage', async function () {
      // given
      const serializedPassage = Symbol('serialized modules');
      const passageId = Symbol('passage-id');
      const passage = Symbol('passage');

      const usecases = {
        terminatePassage: sinon.stub(),
      };
      usecases.terminatePassage.withArgs({ passageId }).returns(passage);
      const passageSerializer = {
        serialize: sinon.stub(),
      };
      passageSerializer.serialize.withArgs(passage).returns(serializedPassage);

      // when
      const returned = await passageController.terminate({ params: { passageId } }, null, {
        passageSerializer,
        usecases,
      });

      // then
      expect(returned).to.deep.equal(serializedPassage);
    });
  });
});
