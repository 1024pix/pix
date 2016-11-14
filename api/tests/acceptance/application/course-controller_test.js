const server = require('../../../server');
const _ = require('lodash');
const util = require('util');

describe.skip('API | Courses', function () {

  before(function (done) {
    knex.migrate.latest().then(() => {
      knex.seed.run().then(() => {
        done();
      });
    });
  });

  after(function (done) {
    server.stop(done);
  });

  describe('GET /api/courses', function () {

    before(function (done) {
      nock('https://api.airtable.com')
        .get('/v0/test-base/Tests?view=PIX%20view')
        .times(3)
        .reply(200, {
          "records": [{
            "id": "recxmmYXTCmpaqHmU",
            "fields": {},
          }, {
            "id": "rec5duNNrPqbSzQ8o",
            "fields": {},
          }, {
            "id": "recgCojOs6ykwak43",
            "fields": {},
          }, {
            "id": "recqBFUffy0sCq6ah",
            "fields": {},
          }, {
            "id": "recURdA2VWp4TD30H",
            "fields": {},
          }]
        });
      done();
    });

    after(function (done) {
      nock.cleanAll();
      done();
    });

    const options = { method: "GET", url: "/api/courses" };

    it("should return 200 HTTP status code", function (done) {
      server.injectThen(options).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("should return application/json", function (done) {
      server.injectThen(options).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it("should return all the courses from the tests referential", function (done) {
      server.injectThen(options).then((response) => {
        const courses = response.result.data;
        expect(courses.length).to.equal(5);
        done();
      });
    });
  });

  describe('GET /api/courses/:course_id', function () {

    before(function (done) {
      nock('https://api.airtable.com')
        .get('/v0/test-base/Tests/rec5duNNrPqbSzQ8o')
        .times(5)
        .reply(200, {
          id: 'rec5duNNrPqbSzQ8o',
          fields: {
            "Nom": "A la recherche de l'information #01",
            "Description": "Mener une recherche et une veille d'information",
            "Image": [{
              "id": "attmP7vjRHdp5UcQA",
              "url": "https://dl.airtable.com/x5gtLtMTpyJBg9dJov82_keyboard-824317_960_720.jpg",
              "filename": "keyboard-824317_960_720.jpg",
              "type": "image/jpeg"
            }],
            "Durée": 13,
            "Épreuves": [
              "recphb0Gowk6hcXdp",
              "recB9k5U9GUCSVTuP",
              "rectN26toxkJmt9S4",
              "recj0g7zZF5LTxij5",
              "recFxCIKMhdRF6C0d",
              "recT0Ks2EDgoDgEKc",
              "recwWzTquPlvIl4So",
              "recUcM3s9DFvpnFqj",
              "recge9Mkog1drln4i",
              "recdTpx4c0kPPDTtf"
            ],
            "Ordre affichage": 2,
            "Preview": "http://development.pix.beta.gouv.fr/courses/rec5duNNrPqbSzQ8o/preview",
            "Nb d'épreuves": 10,
            "Acquis": "#ordonnancement,#source,#rechercheInfo,#moteur,#wikipedia,#syntaxe,#sponsor,#rechercheInfo,#cult1.1,#rechercheInfo"
          },
          createdTime: "2016-08-09T15:17:53.000Z"
        });
      done();
    });

    after(function (done) {
      nock.cleanAll();
      done();
    });

    const options = { method: "GET", url: "/api/courses/rec5duNNrPqbSzQ8o" };

    it("should return 200 HTTP status code", function (done) {
      server.injectThen(options).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("should return application/json", function (done) {
      server.injectThen(options).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it("should return the expected course", function (done) {
      server.injectThen(options).then((response) => {
        const course = response.result.data;
        expect(course.id).to.equal("rec5duNNrPqbSzQ8o");
        expect(course.attributes.name).to.equal("A la recherche de l'information #01");
        expect(course.attributes.description).to.equal("Mener une recherche et une veille d'information");
        done();
      });
    });
  });

});
