import { expect } from '../../../../../test-helper.js';
import { QcuCorrectionResponse } from '../../../../../../src/devcomp/domain/models/QcuCorrectionResponse.js';
import { AnswerStatus } from '../../../../../../lib/domain/models/index.js';
import * as correctionResponseSerializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/correction-response-serializer.js';

describe('Unit | DevComp | Infrastructure | Serializers | Jsonapi | CorrectionResponseSerializer', function () {
  describe('#serialize', function () {
    it('should return a serialized CorrectionReponse', function () {
      // given
      const givenCorrectionResponse = new QcuCorrectionResponse({
        status: AnswerStatus.OK,
        feedback: 'Good job!',
        solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
      });
      const expectedResult = {
        data: {
          attributes: {
            feedback: 'Good job!',
            status: 'ok',
            solution: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
          },
          id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
          type: 'correction-responses',
        },
      };

      // when
      const result = correctionResponseSerializer.serialize(givenCorrectionResponse);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
