const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/course-serializer');
const Course = require('../../../../../lib/domain/models/Course');

describe('Unit | Serializer | JSONAPI | course-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Course model object into JSON API data', function() {
      const course = new Course({
        id: 'course_id',
        name: 'Name of the course',
        description: 'Description of the course',
        isAdaptive: false,
        imageUrl: 'http://image.url',
        type: 'DEMO',
        challenges: [
          'rec_challenge_1',
          'rec_challenge_2',
          'rec_challenge_3',
          'rec_challenge_4',
          'rec_challenge_5'
        ],
        assessment: {
          id: 455
        }
      });

      // when
      const json = serializer.serialize(course);

      // then
      expect(json).to.deep.equal({
        'data': {
          'type': 'courses',
          'id': course.id,
          'attributes': {
            'name': course.name,
            'is-adaptive': course.isAdaptive,
            'description': course.description,
            'image-url': 'http://image.url',
            'nb-challenges': 5,
            'type': course.type
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessments',
                id: '455'
              }
            }
          }
        }
      });
    });

  });

});
