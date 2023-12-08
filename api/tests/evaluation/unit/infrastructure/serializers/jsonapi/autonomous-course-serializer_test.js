import { expect } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/autonomous-course-serializer.js';

describe('Unit | Serializer | JSONAPI | autonomous-course-serializer', function () {
  describe('#serializeId', function () {
    it('should return a serialized autonomous course to JSONAPI with only ID filled', function () {
      // when
      const serializedAutonomousCourse = serializer.serializeId(1);

      // then
      const expectedSerializedAutonomousCourse = {
        data: {
          id: '1',
          type: 'autonomous-courses',
        },
      };
      return expect(serializedAutonomousCourse).to.deep.equal(expectedSerializedAutonomousCourse);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data to Autonomous Course object', async function () {
      // given
      const jsonTraining = {
        data: {
          type: 'autonomous-courses',
          attributes: {
            'target-profile-id': 30,
            'internal-title': 'internal title',
            'public-title': 'public title',
            'custom-landing-page-text': 'Custom landing page text',
          },
        },
      };

      // when
      const autonomousCourse = await serializer.deserialize(jsonTraining);

      // then
      expect(autonomousCourse).to.deep.equal({
        internalTitle: 'internal title',
        publicTitle: 'public title',
        targetProfileId: 30,
        customLandingPageText: 'Custom landing page text',
      });
    });
  });
});
