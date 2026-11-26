import { expect } from 'chai';

import { combinedCourseBlueprintOrganizationSerializer } from '../../../../../src/quest/infrastructure/serializers/combined-course-blueprint-organization-serializer.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course-blueprint-organization', function () {
  describe('#serializeAttachedOrganizations', function () {
    it('should serialize attached and duplicated organization ids', function () {
      // given
      const model = { combinedCourseBlueprintId: 1, attachedIds: [2, 3], duplicatedIds: [4] };

      // when
      const json = combinedCourseBlueprintOrganizationSerializer.serializeAttachedOrganizations(model);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'combined-course-blueprint-organizations',
          id: '1',
          attributes: {
            'attached-ids': [2, 3],
            'duplicated-ids': [4],
          },
        },
      });
    });
  });

  describe('#serializeDetachedOrganizations', function () {
    it('should serialize detached and already detached organization ids', function () {
      // given
      const model = { combinedCourseBlueprintId: 1, detachedIds: [2, 3], alreadyDetachedIds: [4] };

      // when
      const json = combinedCourseBlueprintOrganizationSerializer.serializeDetachedOrganizations(model);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'combined-course-blueprint-organizations',
          id: '1',
          attributes: {
            'detached-ids': [2, 3],
            'already-detached-ids': [4],
          },
        },
      });
    });
  });
});
