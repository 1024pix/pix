const { describe, it, before, after, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const User = require('../../../../lib/domain/models/data/user');

describe('Unit | Controller | UserController', function () {

  let server;

  before(function () {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/users') });
  });

  describe('#list', function () {

    let stub;
    const users = [
      new User({ "id": "user_1" }),
      new User({ "id": "user_2" }),
      new User({ "id": "user_3" })
    ];

    before(function () {
      stub = sinon.stub(User, 'fetchAll');
    });

    after(function () {
      stub.restore();
    });

    it('should fetch and return all the users, serialized as JSONAPI', function (done) {
      // given
      stub.resolves(users);

      // when
      server.inject({ method: 'GET', url: '/api/users' }, (res) => {

        // then
        expect(res.result).to.deep.equal(users);
        done();
      });
    });

    it('should return an error 500 when the fetch fails', function(done) {
      // given
      stub.rejects(new Error('Fetch error'));

      // when
      server.inject({ method: 'GET', url: '/api/users' }, (res) => {

        // then
        expect(res.statusCode).to.equal(500);
        done();
      });
    });
  });

  describe('#get', function () {

    let stub;
    const user = new User({ "id": "user_id" });

    before(function () {
      stub = sinon.stub(User.prototype, 'fetch');
    });

    after(function () {
      stub.restore();
    });

    it('should fetch and return the given user, serialized as JSONAPI', function (done) {
      // given
      stub.resolves(user);

      // when
      server.inject({ method: 'GET', url: '/api/users/user_id' }, (res) => {

        // then
        expect(res.result).to.deep.equal(user);
        done();
      });
    });

    it('should reply with error status code 404 if user not found', function (done) {
      // given
      const error = {
        "error": {
          "type": "MODEL_ID_NOT_FOUND",
          "message": "Could not find row by id unknown_id"
        }
      };
      stub.rejects(error);

      // when
      server.inject({ method: 'GET', url: '/api/users/unknown_id' }, (res) => {

        // then
        expect(res.statusCode).to.equal(404);
        done();
      });
    });
  });

});
