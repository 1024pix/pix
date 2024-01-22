import { expect } from '../../../../../test-helper.js';
import { QcuCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QcuCorrectionResponse.js';
import { AnswerStatus } from '../../../../../../lib/domain/models/index.js';
import * as elementAnswerSerializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/element-answer-serializer.js';
import { ElementAnswer } from '../../../../../../src/devcomp/domain/models/ElementAnswer.js';
import { QrocmCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QrocmCorrectionResponse.js';

describe('Unit | DevComp | Infrastructure | Serializers | Jsonapi | ElementAnswerSerializer', function () {
  describe('#serialize', function () {
    describe('When correction response is for QCU', function () {
      it('should return a serialized ElementAnswer', function () {
        // given
        const givenCorrectionResponse = new QcuCorrectionResponse({
          status: AnswerStatus.OK,
          feedback: 'Good job!',
          solution: '1',
        });

        const elementAnswer = new ElementAnswer({
          id: 233,
          elementId: '123',
          userResponseValue: '1',
          correction: givenCorrectionResponse,
        });

        const expectedResult = {
          data: {
            attributes: {
              'element-id': '123',
              'user-response-value': '1',
            },
            relationships: {
              correction: {
                data: {
                  id: '233',
                  type: 'correction-responses',
                },
              },
            },
            id: '233',
            type: 'element-answers',
          },
          included: [
            {
              attributes: {
                feedback: 'Good job!',
                status: 'ok',
                solution: givenCorrectionResponse.solution,
              },
              id: '233',
              type: 'correction-responses',
            },
          ],
        };

        // when
        const result = elementAnswerSerializer.serialize(elementAnswer);

        // then
        expect(result).to.deep.equal(expectedResult);
      });
    });

    describe('When correction response is for QROCM-ind', function () {
      it('should return a serialized ElementAnswer', function () {
        // given
        const solution = {
          emailSeparatorCharacter: ['@'],
          emailFirstPartSelect: ['1'],
          emailSecondPartSelect: ['2'],
        };
        const userAnswerValue = {
          emailSeparatorCharacter: '@',
          emailFirstPartSelect: '1',
          emailSecondPartSelect: '2',
        };
        const givenCorrectionResponse = new QrocmCorrectionResponse({
          status: AnswerStatus.OK,
          feedback: 'Good job!',
          solution,
        });

        const elementAnswer = new ElementAnswer({
          id: 222,
          elementId: '123',
          userResponseValue: userAnswerValue,
          correction: givenCorrectionResponse,
        });
        const expectedResult = {
          data: {
            attributes: {
              'element-id': '123',
              'user-response-value': userAnswerValue,
            },
            relationships: {
              correction: {
                data: {
                  id: '222',
                  type: 'correction-responses',
                },
              },
            },
            id: '222',
            type: 'element-answers',
          },
          included: [
            {
              attributes: {
                feedback: 'Good job!',
                status: 'ok',
                solution: givenCorrectionResponse.solution,
              },
              id: '222',
              type: 'correction-responses',
            },
          ],
        };

        // when
        const result = elementAnswerSerializer.serialize(elementAnswer);

        // then
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
});
