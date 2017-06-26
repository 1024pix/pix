const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/course-group-serializer');
const CourseGroup = require('../../../../../lib/domain/models/referential/course-group');

describe('Unit | Serializer | JSONAPI | serie-serializer', function() {

  //given
  const courseGroup = new CourseGroup();
  courseGroup.id = 'fakeId';
  courseGroup.name = 'name of courseGroup';
  courseGroup.courses = [{ id: 'courseId1', name: 'first course', description:'first course description', imageUrl : 'urlImage' }, { id: 'courseId2', name: 'second course', description:'second course description', imageUrl : 'urlImage'  }];

  const expectedJsonApicourseGroup = {
    data: {
      type: 'course-group',
      id: 'fakeId',
      attributes: {
        name: 'name of courseGroup'
      },
      relationship: {
        courses: {
          data: [
            { type: 'course', id: 'courseId1' },
            { type: 'course', id: 'courseId2' }
          ]
        }
      },
      included : [{
        type : 'course',
        id : 'courseId1',
        attributes : {
          name : 'first course',
          description : 'first course description',
          imageUrl : 'urlImage'
        }
      }, {
        type : 'course',
        id : 'courseId2',
        attributes : {
          name : 'second course',
          description : 'second course description',
          imageUrl : 'urlImage'
        }
      }]
    }
  };

  describe('#serialize', function() {

    it('should convert courseGroup model Object to JSON API', function() {
      // when
      const jsonApicourseGroup = serializer.serialize(courseGroup);

      // then
      expect(jsonApicourseGroup).to.deep.equal(expectedJsonApicourseGroup);
    });
  });

});
