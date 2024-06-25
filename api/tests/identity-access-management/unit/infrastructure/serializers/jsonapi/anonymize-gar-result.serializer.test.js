import { anonymizeGarResultSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/anonymize-gar-result.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | anonymize-gar-result', function () {
  describe('#serialize', function () {
    it('converts GAR anonymized results into JSON API data', function () {
      // given
      const garAnonymizedUserCount = 2;
      const total = 3;
      const anonymizedResults = { garAnonymizedUserCount, total };

      // when
      const json = anonymizeGarResultSerializer.serialize(anonymizedResults);

      // then
      const expectedJSON = {
        data: {
          type: 'anonymize-gar-results',
          attributes: {
            'gar-anonymized-user-count': garAnonymizedUserCount,
            total,
          },
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
