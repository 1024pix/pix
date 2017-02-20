const {describe, it, before, after, beforeEach, afterEach, expect, knex} = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | follower-controller', function () {

  beforeEach(function (done) {
    knex('followers').delete().then(() => done());
  });

  afterEach(function (done) {
    knex('followers').delete().then(() => done());
  });

  after(function (done) {
    server.stop(done);
  });

  describe('POST /api/followers', function () {

    it('should persist the follower if follower does not exist', function (done) {
      const payload = {
        data: {
          type: 'followers',
          attributes: {
            email: 'shi+1@fu.me'
          }
        }
      };

      server.inject({method: 'POST', url: '/api/followers', payload}).then((response) => {
        expect(response.statusCode).to.equal(201);
        expect(response.headers['content-type']).to.contain('application/json');
        const follower = response.result;
        expect(follower.data.id).to.exist;
        expect(follower.data.type).to.equal('followers');
        expect(follower.data.attributes.email).to.equal('shi+1@fu.me');
        done();
      });
    });

    it('should return an error with status code 409 if follower already exist', function (done) {
      const payload = {
        data: {
          type: 'followers',
          attributes: {
            email: 'shi+1@fu.me'
          }
        }
      };
      server.inject({method: 'POST', url: '/api/followers', payload}).then(_ => {
        server.inject({method: 'POST', url: '/api/followers', payload}).then((res) => {
          expect(res.statusCode).to.equal(409);
          done();
        });
      });

    });
  });
});
