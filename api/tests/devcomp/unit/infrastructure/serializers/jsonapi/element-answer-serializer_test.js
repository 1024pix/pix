import { expect } from '../../../../../test-helper.js';
import { QcuCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QcuCorrectionResponse.js';
import { AnswerStatus } from '../../../../../../lib/domain/models/index.js';
import * as elementAnswerSerializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/element-answer-serializer.js';
import { ElementAnswer } from '../../../../../../src/devcomp/domain/models/ElementAnswer.js';
import omit from 'lodash/omit.js';
import { QrocmCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QrocmCorrectionResponse.js';

describe('Unit | DevComp | Infrastructure | Serializers | Jsonapi | ElementAnswerSerializer', function () {
  describe('#serialize', function () {
    describe('When correction response is for QCU', function () {
      describe('when element answer does not provide id', function () {
        it('should return a serialized ElementAnswer', function () {
          // given
          const givenCorrectionResponse = new QcuCorrectionResponse({
            status: AnswerStatus.OK,
            feedback: 'Good job!',
            solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
          });

          const elementAnswer = new ElementAnswer({
            elementId: '123',
            userResponseValue: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
            correction: givenCorrectionResponse,
          });
          const expectedResult = {
            data: {
              attributes: {
                'element-id': '123',
                'user-response-value': 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
              },
              relationships: {
                correction: {
                  data: {
                    type: 'correction-responses',
                  },
                },
              },
              type: 'element-answers',
            },
            included: [
              {
                attributes: {
                  feedback: 'Good job!',
                  status: 'ok',
                  solution: givenCorrectionResponse.solution,
                },
                type: 'correction-responses',
              },
            ],
          };

          // when
          const result = elementAnswerSerializer.serialize(elementAnswer);

          // then
          expect(omit(result, ['data.id', 'data.relationships.correction.data.id', 'included[0].id'])).to.deep.equal(
            expectedResult,
          );
        });
      });

      describe('when element answer provides id', function () {
        it('should return a serialized ElementAnswer', function () {
          // given
          const givenCorrectionResponse = new QcuCorrectionResponse({
            status: AnswerStatus.OK,
            feedback: 'Good job!',
            solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
          });

          const elementAnswer = new ElementAnswer({
            id: 233,
            elementId: '123',
            userResponseValue: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
            correction: givenCorrectionResponse,
          });

          const expectedResult = {
            data: {
              attributes: {
                'element-id': '123',
                'user-response-value': 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
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
    });

    describe('When correction response is for QROCM-ind', function () {
      describe('when element answer does not provide id', function () {
        it('should return a serialized ElementAnswer', function () {
          // given
          const solution = {
            inputBlock: ['@'],
            selectBlock: ['1'],
          };
          const userAnswerValue = {
            inputBlock: '@',
            selectBlock: '1',
          };
          const givenCorrectionResponse = new QrocmCorrectionResponse({
            status: AnswerStatus.OK,
            feedback: 'Good job!',
            solution,
          });

          const elementAnswer = new ElementAnswer({
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
                    type: 'correction-responses',
                  },
                },
              },
              type: 'element-answers',
            },
            included: [
              {
                attributes: {
                  feedback: 'Good job!',
                  status: 'ok',
                  solution: givenCorrectionResponse.solution,
                },
                type: 'correction-responses',
              },
            ],
          };

          // when
          const result = elementAnswerSerializer.serialize(elementAnswer);

          // then
          expect(omit(result, ['data.id', 'data.relationships.correction.data.id', 'included[0].id'])).to.deep.equal(
            expectedResult,
          );
        });

        describe('when element answer provides id', function () {
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
  });
});
