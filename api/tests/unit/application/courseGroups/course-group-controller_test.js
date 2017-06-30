const { describe, it, afterEach, beforeEach, expect, sinon } = require('../../../test-helper');
const CourseGroup = require('../../../../lib/domain/models/referential/course-group');
const courseGroupRepository = require('../../../../lib/infrastructure/repositories/course-group-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const courseGroupSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-group-serializer');
const cache = require('../../../../lib/infrastructure/cache');
const server = require('../../../../server');

const controller = require('../../../../lib/application/courseGroups/course-group-controller');

describe('Unit | Controller | course-group-controller', function() {

  const courseGroups = [];

  let courseGroupRepositoryListStub;
  let courseRepositoryGetStub;

  beforeEach(function() {
    cache.flushAll();
    courseGroupRepositoryListStub = sinon.stub(courseGroupRepository, 'list').resolves(courseGroups);
    courseRepositoryGetStub = sinon.stub(courseRepository, 'get').resolves({});
  });

  afterEach(function() {
    cache.flushAll();
    courseGroupRepositoryListStub.restore();
    courseRepositoryGetStub.restore();
  });

  describe('#list', function() {

    it('should call the course-group repository', function() {
      // when
      const promise = server.injectThen({ method: 'GET', url: '/api/course-groups' });

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(courseGroupRepositoryListStub);
      });

    });

    it('should return all the courseGroups', function() {
      // when
      const promise = server.injectThen({ method: 'GET', url: '/api/course-groups' });

      // Then
      return promise.then((res) => {
        expect(res.result).to.deep.equal(courseGroupSerializer.serializeArray(courseGroups));
      });

    });

    it('should retrieve course details for every course', function() {
      // Given
      const replySpy = sinon.spy();
      courseGroupRepositoryListStub.resolves([
        new CourseGroup({ id: 'serie1', courses: [{ id: 'test1' }, { id: 'test2' }] }),
        new CourseGroup({ id: 'serie2', courses: [{ id: 'test3' }, { id: 'test4' }] })
      ]);

      // when
      const promise = controller.list({}, replySpy);

      // Then
      return promise.then(_ => {
        sinon.assert.callCount(courseRepositoryGetStub, 4);
        sinon.assert.calledWith(courseRepositoryGetStub, 'test1');
        sinon.assert.calledWith(courseRepositoryGetStub, 'test2');
        sinon.assert.calledWith(courseRepositoryGetStub, 'test3');
        sinon.assert.calledWith(courseRepositoryGetStub, 'test4');
      });

    });

    it('should retrieve course details', function() {
      // Given
      const replySpy = sinon.spy();
      courseRepositoryGetStub.resolves({
        id: 'test1',
        name: 'Test 1',
        description: 'Description du course 1',
        imageUrl: 'image/url.jpg'
      });
      courseGroupRepositoryListStub.resolves([new CourseGroup({
        id: 'serie1',
        name: 'OTTO',
        courses: [{ id: 'test1' }]
      })]);

      // when
      const promise = controller.list({}, replySpy);

      // Then
      return promise.then(_ => {
        expect(replySpy.firstCall.args).to.deep.equal([
          {
            'data': [
              {
                'type': 'course-group',
                'id': 'serie1',
                'attributes': {
                  'name': 'OTTO'
                },
                'relationships': {
                  'courses': {
                    'data': [
                      {
                        'id': 'test1',
                        'type': 'courses'
                      }
                    ]
                  }
                }
              }],
            'included': [
              {
                'type': 'courses',
                'id': 'test1',
                'attributes': {
                  'description': 'Description du course 1',
                  'image-url': 'image/url.jpg',
                  'name': 'Test 1',
                  'nb-challenges': 0,
                }
              }
            ]
          }
        ]);
      });

    });

    it('should have all course details loaded before send response', function() {
      // Given
      const replySpy = sinon.spy();
      courseRepositoryGetStub.returns(new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: 'test1',
            name: 'Test 1',
            description: 'Description du course 1',
            imageUrl: 'image/url.jpg'
          });
        }, 100);
      }));
      courseGroupRepositoryListStub.resolves([new CourseGroup({
        id: 'serie1',
        name: 'OTTO',
        courses: [{ id: 'test1' }]
      })]);

      // when
      const promise = controller.list({}, replySpy);

      // Then
      return promise.then(_ => {
        expect(replySpy.firstCall.args).to.deep.equal([
          {
            'data': [
              {
                'type': 'course-group',
                'id': 'serie1',
                'attributes': {
                  'name': 'OTTO'
                },
                'relationships': {
                  'courses': {
                    'data': [
                      {
                        'id': 'test1',
                        'type': 'courses'
                      }
                    ]
                  }
                }
              }],
            'included': [
              {
                'type': 'courses',
                'id': 'test1',
                'attributes': {
                  'description': 'Description du course 1',
                  'image-url': 'image/url.jpg',
                  'name': 'Test 1',
                  'nb-challenges': 0
                }
              }
            ]
          }
        ]);
      });

    });
  });
})
;

