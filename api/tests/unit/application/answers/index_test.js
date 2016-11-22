const Hapi = require('hapi');
const AnswerController = require('../../../../lib/application/answers/answer-controller');

describe('Unit | Router | AnswerRouter', function () {

  let server;

  beforeEach(function () {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/answers') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('POST /api/answers', function () {

    before(function (done) {
      sinon.stub(AnswerController, 'save', (request, reply) => reply('ok'));
      done();
    });

    after(function (done) {
      AnswerController.save.restore();
      done();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'POST', url: '/api/answers' }, done);
    });
  });

  describe('GET /api/answers/{id}', function () {

    before(function (done) {
      sinon.stub(AnswerController, 'get', (request, reply) => reply('ok'));
      done();
    });

    after(function (done) {
      AnswerController.get.restore();
      done();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'GET', url: '/api/answers/answer_id' }, done);
    });
  });

});
