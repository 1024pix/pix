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
});
