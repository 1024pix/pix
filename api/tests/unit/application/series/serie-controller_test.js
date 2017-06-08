const { describe, it, before, afterEach, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Serie = require('../../../../lib/domain/models/referential/serie');
const cache = require('../../../../lib/infrastructure/cache');

describe('Unit | Controller | serie-controller', function() {

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
      new Serie({ id: 'serie1' }),
      new Serie({ id: 'serie2' }),
      new Serie({ id: 'serie3' })
    ];

    it('should return all the series', function() {
      // given

      // when
      server.inject({ method: 'GET', url: '/api/series' }, (res) => {
        // then
        expect(res.result).to.deep.equal(series);
      });

    });
  });
});
