import { expect } from 'chai';

import { CommonOrganizationLearnerFilter } from '../../../../../../../src/prescription/learner-management/domain/models/CommonOrganizationLearnerFilter.js';
import { organizationLearnerFilterSerializer } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/jsonapi/organization-learner-filter-serializer.js';

describe('Unit | Serializer | JSONAPI | organization-learner-filter-serializer', function () {
  describe('#serialize', function () {
    it('should scope the id by organization so filters from different organizations never collide in the front-end store', function () {
      // given
      const filterForOrganizationA = new CommonOrganizationLearnerFilter({
        organizationId: 1,
        attributeName: 'division',
        values: ['3EME A'],
      });
      const filterForOrganizationB = new CommonOrganizationLearnerFilter({
        organizationId: 2,
        attributeName: 'division',
        values: ['4EME B'],
      });

      // when
      const serializedA = organizationLearnerFilterSerializer.serialize([filterForOrganizationA]);
      const serializedB = organizationLearnerFilterSerializer.serialize([filterForOrganizationB]);

      // then
      expect(serializedA.data[0].id).to.not.equal(serializedB.data[0].id);
      expect(serializedA.data[0].id).to.equal('1-division');
      expect(serializedB.data[0].id).to.equal('2-division');
    });
  });
});
