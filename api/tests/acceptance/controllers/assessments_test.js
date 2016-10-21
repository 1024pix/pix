'use strict';

const server = require('../../../server');
const Assessment = require('../../../app/models/data/assessment');

describe('API | Assessments', function () {

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

  describe('POST /api/assessments', function () {

    const options = {
      method: "POST", url: "/api/assessments", payload: {
        data: {
          type: "assessment",
          attributes: {
            "user-name": 'Jon Snow',
            "user-email": 'jsnow@winterfell.got'
          },
          relationships: {
            course: {
              data: {
                type: 'course',
                id: 'course_id'
              }
            }
          }
        }
      }
    };

    it("should return 201 HTTP status code", function (done) {
      server.injectThen(options).then((response) => {
        expect(response.statusCode).to.equal(201);
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

    it("should add a new assessment into the database", function (done) {
      // given
      Assessment.count().then(function (beforeAssessmentsNumber) {
        // when
        server.injectThen(options).then((response) => {
          Assessment.count().then(function (afterAssessmentsNumber) {
            // then
            expect(afterAssessmentsNumber).to.equal(beforeAssessmentsNumber + 1);
            done();
          });
        });
      });
    });

    it("should persist the given course ID and user ID", function (done) {

      // when
      server.injectThen(options).then((response) => {

        new Assessment({ id: response.result.data.id })
          .fetch()
          .then(function (model) {
            expect(model.get('courseId')).to.equal(options.payload.data.relationships.course.data.id);
            expect(model.get('userName')).to.equal(options.payload.data.attributes["user-name"]);
            expect(model.get('userEmail')).to.equal(options.payload.data.attributes["user-email"]);
            done();
          });

      });
    });

    it("should return persisted assessement", function (done) {

      // when
      server.injectThen(options).then((response) => {
        const assessment = response.result.data;

        // then
        expect(assessment.id).to.exist;
        expect(assessment.attributes["user-id"]).to.equal(options.payload.data.attributes["user-id"]);
        expect(assessment.attributes["user-name"]).to.equal(options.payload.data.attributes["user-name"]);
        expect(assessment.attributes["user-email"]).to.equal(options.payload.data.attributes["user-email"]);
        expect(assessment.relationships.course.data.id).to.equal(options.payload.data.relationships.course.data.id);

        done();
      });
    });

  });

});
