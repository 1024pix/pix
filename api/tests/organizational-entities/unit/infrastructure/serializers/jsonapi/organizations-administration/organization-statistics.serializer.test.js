import * as organizationStatisticsSerializer from '../../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/organizations-administration/organization-statistics.serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Infrastructure | Serializers | JSONAPI | Organizations-Administrations | organization-statistics', function () {
  describe('#serialize', function () {
    it('should convert a statistics object into JSON API data', function () {
      // given
      const statistics = {
        organizationId: 1,
        totalParticipantsCount: 42,
        id: '1_organization_statistics',
        totalParticipantsCountByYear: [],
      };

      const expectedJSON = {
        data: {
          type: 'organization-statistics',
          id: '1_organization_statistics',
          attributes: {
            'organization-id': 1,
            'total-participants-count': 42,
            'total-participants-count-by-year': [],
          },
        },
      };

      // when
      const json = organizationStatisticsSerializer.serialize(statistics);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
