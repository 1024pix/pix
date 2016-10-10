const server = require('../../../server');
const after = require('mocha').after;

describe('/api/greetings', function () {

  after(function (done) {

    server.stop(done);
  });

  describe('route /', function (done) {

    it('/ should return "Hello, world!"', function (done) {

      const options = {
        method: "GET",
        url: "/"
      };

      server.inject(options, (response) => {

        response.statusCode.should.be.equal(200);
        response.result.should.have.lengthOf(13);
        response.result.should.be.equal('Hello, world!');
        done();
      });
    });
  });

  describe('route /{name}', function (done) {

    it('/ should return "Hello, {name}!"', function (done) {

      const options = {
        method: "GET",
        url: "/test_name"
      };

      server.inject(options, (response) => {

        response.statusCode.should.be.equal(200);
        response.result.should.be.equal('Hello, test_name!');
        done();
      });
    });
  });

});
