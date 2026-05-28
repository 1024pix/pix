import * as organizationStatisticsSerializer from '../../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/organizations-administration/organization-statistics.serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Infrastructure | Serializers | JSONAPI | Organizations-Administrations | organization-statistics', function () {
  describe('#serialize', function () {
    it('should convert a statistics object into JSON API data', function () {
      // given
      const statistics = { totalParticipantsCount: 42, id: '1_organization_statistics' };

      const expectedJSON = {
        data: {
          type: 'organization-statistics',
          id: '1_organization_statistics',
          attributes: {
            'total-participants-count': 42,
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
