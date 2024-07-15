import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/course-serializer.js';
import { Course } from '../../../../../src/shared/domain/models/Course.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | course-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Course model object into JSON API data', function () {
      const course = new Course({
        id: 'course_id',
        name: 'Name of the course',
        description: 'Description of the course',
        challenges: ['rec_challenge_1', 'rec_challenge_2', 'rec_challenge_3', 'rec_challenge_4', 'rec_challenge_5'],
      });

      // when
      const json = serializer.serialize(course);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'courses',
          id: course.id,
          attributes: {
            name: course.name,
            description: course.description,
            'nb-challenges': 5,
          },
        },
      });
    });
  });
});
