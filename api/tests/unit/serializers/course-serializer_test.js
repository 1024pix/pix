const serializer = require('../../../app/serializers/course-serializer');
const Course = require('../../../app/models/referential/course');

describe('Serializer | CourseSerializer', function () {

  describe('#serialize()', function () {

    it('should convert a Course model object into JSON API data', function () {
      const record = {
        "id": 'course_id',
        "fields": {
          "Nom": 'Name of the course',
          "Description": 'Description of the course',
          "Durée": 10,
          "Épreuves": [
            "challenge_qcu_id",
            "challenge_qcm_id",
            "challenge_qrocm_id"
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
            "description": course.description,
            "duration": course.duration,
            "image-url": "http://image.url"
          },
          "relationships": {
            "challenges": {
              "data": [
                { "type": "challenges", "id": "challenge_qcu_id" },
                { "type": "challenges", "id": "challenge_qcm_id" },
                { "type": "challenges", "id": "challenge_qrocm_id" }
              ]
            }
          }
        }
      });
    });

  });

});
