import { expect, domainBuilder } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/autonomous-course-target-profiles-serializer.js';

describe('Unit | Serializer | JSONAPI | autonomous-course-target-profile-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized autonomous course target-profiles to JSONAPI', function () {
      // given
      const targetProfile1 = domainBuilder.buildTargetProfileForAdmin({
        name: 'profil cible 1',
        category: 'ONE',
      });
      const targetProfile2 = domainBuilder.buildTargetProfileForAdmin({
        name: 'profil cible 2',
        category: 'TWO',
      });

      // when
      const serializedAutonomousCourseTargetProfiles = serializer.serialize([targetProfile1, targetProfile2]);

      // then
      const expectedSerializedAutonomousCourse = {
        data: [
          {
            id: String(targetProfile1.id),
            type: 'autonomous-course-target-profiles',
            attributes: {
              name: targetProfile1.name,
              category: targetProfile1.category,
            },
          },
          {
            id: String(targetProfile2.id),
            type: 'autonomous-course-target-profiles',
            attributes: {
              name: targetProfile2.name,
              category: targetProfile2.category,
            },
          },
        ],
      };
      return expect(serializedAutonomousCourseTargetProfiles).to.deep.equal(expectedSerializedAutonomousCourse);
    });
  });
});
