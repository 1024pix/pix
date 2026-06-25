import { organizationLearnerTypeSerializer } from '../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/organization-learner-type/organization-learner-type-serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | organization-learner-type-serializer', function () {
  describe('#serialize', function () {
    it('should return a JSON API serialized organization learner type', function () {
      // given
      const organizationLearnerType = domainBuilder.acquisition.buildOrganizationLearnerType({
        id: 123,
        name: 'Student',
      });

      // when
      const serializedOrganizationLearnerType = organizationLearnerTypeSerializer.serialize(organizationLearnerType);

      // then
      expect(serializedOrganizationLearnerType).to.deep.equal({
        data: {
          id: '123',
          type: 'organization-learner-types',
          attributes: {
            name: 'Student',
          },
        },
      });
    });
  });
});
