const { describe, it } = require('mocha');
const { expect } = require('chai');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/course-serializer');
const Course = require('../../../../../lib/domain/models/referential/course');

describe('Unit | Serializer | JSONAPI | CourseSerializer', function () {

  describe('#serialize()', function () {

    it('should convert a Course model object (with challenges order inverted) into JSON API data (with challenges order in right order)', function () {
      const course = new Course();
      course.id = 'course_id';
      course.name = 'Name of the course';
      course.description = 'Description of the course';
      course.duration = 10;
      course.isAdaptive = false;
      course.imageUrl = 'http://image.url';
      course.challenges = [
        'challenge_1',
        'challenge_2',
        'challenge_3',
        'challenge_4',
        'challenge_5'
      ];

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
            'duration': course.duration,
            'image-url': 'http://image.url'
          },
          'relationships': {
            'challenges': {
              'data': [
                { 'type': 'challenges', 'id': 'challenge_1' },
                { 'type': 'challenges', 'id': 'challenge_2' },
                { 'type': 'challenges', 'id': 'challenge_3' },
                { 'type': 'challenges', 'id': 'challenge_4' },
                { 'type': 'challenges', 'id': 'challenge_5' }
              ]
            }
          }
        }
      });
    });

  });

});
