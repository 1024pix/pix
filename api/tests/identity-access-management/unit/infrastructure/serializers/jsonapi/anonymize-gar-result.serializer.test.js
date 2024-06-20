import { anonymizeGarResultSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/anonymize-gar-result.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | anonymize-gar-result', function () {
  describe('#serialize', function () {
    it('converts GAR anonymized results into JSON API data', function () {
      //given
      const anonymized = 7307;
      const total = 7351;
      const anonymizedResults = { anonymized, total };

      //when
      const json = anonymizeGarResultSerializer.serialize(anonymizedResults);

      //then
      const expectedJSON = {
        data: {
          type: 'anonymize-gar-results',
          attributes: {
            anonymized,
            total,
          },
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
