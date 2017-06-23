const { describe, it, before, afterEach, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const CourseGroup = require('../../../../lib/domain/models/referential/course-group');
const courseGroupRepository = require('../../../../lib/infrastructure/repositories/course-group-repository');
const courseGroupSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-group-serializer');
const cache = require('../../../../lib/infrastructure/cache');
const server = require('../../../../server');

describe('Unit | Controller | course-group-controller', function() {

  const courseGroups = [
    new CourseGroup({ id: 'serie1' }),
    new CourseGroup({ id: 'serie2' }),
    new CourseGroup({ id: 'serie3' })
  ];
  let courseGroupRepositoryListStub;

  beforeEach(function() {
    cache.flushAll();
    courseGroupRepositoryListStub = sinon.stub(courseGroupRepository, 'list').resolves(courseGroups);
  });

  afterEach(function() {
    cache.flushAll();
    courseGroupRepository.list.restore();
  });

  describe('#list', function() {

    it('should call the repository', function() {
      // given

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

  });
});

