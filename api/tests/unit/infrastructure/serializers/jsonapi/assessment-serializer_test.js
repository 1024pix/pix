const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const Assessment = require('../../../../../lib/domain/models/data/assessment');

describe('Unit | Serializer | JSONAPI | assessment-serializer', function () {

  const modelObject = new Assessment({
    id: 'assessment_id',
    courseId: 'course_id',
    userName: 'Jon Snow',
    userEmail: 'jsnow@winterfell.got'
  });

  const jsonAssessment = {
    data: {
      type: "assessments",
      id: 'assessment_id',
      attributes: {
        "user-name": 'Jon Snow',
        "user-email": 'jsnow@winterfell.got'
      },
      relationships: {
        course: {
          data: {
            type: 'courses',
            id: 'course_id'
          }
        }
      }
    }
  };

  describe('#serialize()', function () {

    it('should convert an Assessment model object into JSON API data', function () {
      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.deep.equal(jsonAssessment);
    });

  });

  describe('#deserialize()', function () {

    it('should convert JSON API data into an Assessment model object', function () {
      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment.get('id')).to.equal(jsonAssessment.data.id);
      expect(assessment.get('courseId')).to.equal(jsonAssessment.data.relationships.course.data.id);
      expect(assessment.get('userName')).to.equal(jsonAssessment.data.attributes["user-name"]);
      expect(assessment.get('userEmail')).to.equal(jsonAssessment.data.attributes["user-email"]);
    });

  });

});
