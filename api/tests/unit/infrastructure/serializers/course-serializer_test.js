const serializer = require('../../../../lib/infrastructure/serializers/course-serializer');
const Course = require('../../../../lib/domain/models/referential/course');

describe('Unit | Serializer | CourseSerializer', function () {

  describe('#serialize()', function () {

    it('should convert a Course model object into JSON API data (with challenges order inverted)', function () {
      const record = {
        "id": 'course_id',
        "fields": {
          "Nom": 'Name of the course',
          "Description": 'Description of the course',
          "Durée": 10,
          "Adaptatif ?": false,
          "Épreuves": [
            "challenge_5",
            "challenge_4",
            "challenge_3",
            "challenge_2",
            "challenge_1"
          ],
          "Image": [{
            "url": "http://image.url",
          }]
        }
      };
      const course = new Course(record);

      // when
      const json = serializer.serialize(course);

      // then
      expect(json).to.deep.equal({
        "data": {
          "type": "courses",
          "id": course.id,
          "attributes": {
            "name": course.name,
            "isAdaptive": course.isAdaptive,
            "description": course.description,
            "duration": course.duration,
            "image-url": "http://image.url"
          },
          "relationships": {
            "challenges": {
              "data": [
                { "type": "challenges", "id": "challenge_1" },
                { "type": "challenges", "id": "challenge_2" },
                { "type": "challenges", "id": "challenge_3" },
                { "type": "challenges", "id": "challenge_4" },
                { "type": "challenges", "id": "challenge_5" }
              ]
            }
          }
        }
      });
    });

  });

});
