const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/course-group-serializer');
const CourseGroup = require('../../../../../lib/domain/models/referential/course-group');

describe('Unit | Serializer | JSONAPI | course-group-serializer', function() {

  describe('#serialize', function() {

    it('should convert courseGroup model Object to JSON API', function() {

      //given
      const courseGroup = new CourseGroup();
      courseGroup.id = 'fakeId';
      courseGroup.name = 'name of courseGroup';
      courseGroup.courses = [{
        id: 'courseId1',
        name: 'first course',
        description: 'first course description',
        imageUrl: 'urlImage',
        challenges: ['challenge1', 'challenge2', 'challenge3']
      }, {
        id: 'courseId2',
        name: 'second course',
        description: 'second course description',
        imageUrl: 'urlImage'
      }];

      const expectedJsonApicourseGroup = {
        data: {
          type: 'course-group',
          id: 'fakeId',
          attributes: {
            name: 'name of courseGroup'
          },
          relationships: {
            courses: {
              data: [
                { type: 'courses', id: 'courseId1' },
                { type: 'courses', id: 'courseId2' }
              ]
            }
          }
        },
        included: [{
          type: 'courses',
          id: 'courseId1',
          attributes: {
            name: 'first course',
            description: 'first course description',
            'image-url': 'urlImage',
            'nb-challenges': 3
          }
        }, {
          type: 'courses',
          id: 'courseId2',
          attributes: {
            name: 'second course',
            description: 'second course description',
            'image-url': 'urlImage',
            'nb-challenges': 0
          }
        }]
      };

      // when
      const jsonApicourseGroup = serializer.serialize(courseGroup);

      // then
      expect(jsonApicourseGroup).to.deep.equal(expectedJsonApicourseGroup);
    });
  });

  describe('#serializeArray', function() {

    //given
    const courseGroup1 = new CourseGroup();
    courseGroup1.id = 'fakeId1';
    courseGroup1.name = 'name of courseGroup';
    courseGroup1.courses = [
      { id: 'courseId1', name: 'first course', description: 'first course description', imageUrl: 'urlImage', challenges: ['challenge1', 'challenge2'] },
      { id: 'courseId2', name: 'second course', description: 'second course description', imageUrl: 'urlImage' }
    ];

    const courseGroup2 = new CourseGroup();
    courseGroup2.id = 'fakeId2';
    courseGroup2.name = 'name of courseGroup';
    courseGroup2.courses = [
      { id: 'courseId3', name: 'third course', description: 'third course description', imageUrl: 'urlImage' },
      { id: 'courseId4', name: 'fourth course', description: 'fourth course description', imageUrl: 'urlImage' }
    ];

    const courseGroupsArray = [courseGroup1, courseGroup2];

    const expectedJsonApicourseGroups = {
      data: [{
        type: 'course-group',
        id: 'fakeId1',
        attributes: {
          name: 'name of courseGroup'
        },
        relationships: {
          courses: {
            data: [
              { type: 'courses', id: 'courseId1' },
              { type: 'courses', id: 'courseId2' }
            ]
          }
        }
      }, {
        type: 'course-group',
        id: 'fakeId2',
        attributes: {
          name: 'name of courseGroup'
        },
        relationships: {
          courses: {
            data: [
              { type: 'courses', id: 'courseId3' },
              { type: 'courses', id: 'courseId4' }
            ]
          }
        }
      }],
      included: [{
        type: 'courses',
        id: 'courseId1',
        attributes: {
          name: 'first course',
          description: 'first course description',
          'image-url': 'urlImage',
          'nb-challenges': 2
        }
      }, {
        type: 'courses',
        id: 'courseId2',
        attributes: {
          name: 'second course',
          description: 'second course description',
          'image-url': 'urlImage',
          'nb-challenges': 0
        }
      }, {
        type: 'courses',
        id: 'courseId3',
        attributes: {
          name: 'third course',
          description: 'third course description',
          'image-url': 'urlImage',
          'nb-challenges': 0
        }
      }, {
        type: 'courses',
        id: 'courseId4',
        attributes: {
          name: 'fourth course',
          description: 'fourth course description',
          'image-url': 'urlImage',
          'nb-challenges': 0
        }
      }]
    };

    it('should convert an array of courseGroup model to JSON API', function() {
      // when
      const jsonApicourseGroup = serializer.serializeArray(courseGroupsArray);

      // then
      expect(jsonApicourseGroup).to.deep.equal(expectedJsonApicourseGroups);
    });
  });

})
;
