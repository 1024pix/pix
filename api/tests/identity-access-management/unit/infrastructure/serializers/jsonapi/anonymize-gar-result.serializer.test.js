import { anonymizeGarResultSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/anonymize-gar-result.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | anonymize-gar-result', function () {
  describe('#serialize', function () {
    it('converts GAR anonymized results into JSON API data', function () {
      // given
      const garAnonymizedUserIds = [1002, 1003];
      const total = 3;
      const anonymizedResults = { garAnonymizedUserIds, total };

      // when
      const json = anonymizeGarResultSerializer.serialize(anonymizedResults);

      // then
      const expectedJSON = {
        data: {
          type: 'anonymize-gar-results',
          attributes: {
            'gar-anonymized-user-ids': garAnonymizedUserIds,
            total,
          },
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
