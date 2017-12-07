const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/course-serializer');
const Course = require('../../../../../lib/domain/models/referential/course');

describe('Unit | Serializer | JSONAPI | course-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Course model object into JSON API data', function() {
      const course = new Course();
      course.id = 'course_id';
      course.name = 'Name of the course';
      course.description = 'Description of the course';
      course.duration = 10;
      course.isAdaptive = false;
      course.imageUrl = 'http://image.url';
      course.challenges = [
        'rec_challenge_1',
        'rec_challenge_2',
        'rec_challenge_3',
        'rec_challenge_4',
        'rec_challenge_5'
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
            'image-url': 'http://image.url',
            'nb-challenges': 5
          }
        }
      });
    });

    describe('field "nbChallenges"', () => {

      it('should be length of challenges associated to the course where they exist', () => {
        // given
        const course = new Course();
        course.id = 'course_id';
        course.challenges = [
          'rec_challenge_1',
          'rec_challenge_2',
          'rec_challenge_3',
          'rec_challenge_4',
          'rec_challenge_5'
        ];

        // when
        const json = serializer.serialize(course);

        // then
        expect(json).to.deep.equal({
          'data': {
            'type': 'courses',
            'id': course.id,
            'attributes': {
              'nb-challenges': 5
            }
          }
        });
      });

      it('should be undefined when there is no challenges associated to the course', () => {
        // given
        const course = new Course();
        course.id = 'course_id';
        course.challenges = undefined;

        // when
        const json = serializer.serialize(course);

        // then
        expect(json).to.deep.equal({
          'data': {
            'type': 'courses',
            'id': course.id
          }
        });
      });
    });

  });

});
