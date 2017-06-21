const { describe, it, before, afterEach, beforeEach, expect } = require('../../../test-helper');
const Hapi = require('hapi');
const CourseGroup = require('../../../../lib/domain/models/referential/course-group');
const cache = require('../../../../lib/infrastructure/cache');

describe('Unit | Controller | course-group-controller', function() {

  let server;

  before(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/courses') });
  });

  beforeEach(function() {
    cache.flushAll();
  });

  afterEach(function() {
    cache.flushAll();
  });

  describe('#list', function() {

    const series = [
      new CourseGroup({ id: 'serie1' }),
      new CourseGroup({ id: 'serie2' }),
      new CourseGroup({ id: 'serie3' })
    ];

    it('should return all the courseGroups', function() {
      // given

      // when
      server.inject({ method: 'GET', url: '/api/course-groups' }, (res) => {
        // then
        expect(res.result).to.deep.equal(series);
      });

    });
  });
});
