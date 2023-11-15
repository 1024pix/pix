import { expect } from '../../../../../test-helper.js';
import { QcuCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QcuCorrectionResponse.js';
import { AnswerStatus } from '../../../../../../lib/domain/models/index.js';
import * as elementAnswerSerializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/element-answer-serializer.js';
import { ElementAnswer } from '../../../../../../src/devcomp/domain/models/ElementAnswer.js';
import omit from 'lodash/omit.js';

describe('Unit | DevComp | Serializers | ElementAnswerSerializer', function () {
  describe('#serialize', function () {
    it('should return a serialized ElementAnswer', function () {
      // given
      const givenCorrectionResponse = new QcuCorrectionResponse({
        status: AnswerStatus.OK,
        feedback: 'Good job!',
        solutionId: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
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
              'solution-id': givenCorrectionResponse.solutionId,
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
});
