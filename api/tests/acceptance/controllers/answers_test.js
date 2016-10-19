'use strict';

const server = require('../../../server');
const Answer = require('../../../app/models/data/answer');

describe('API | Answers', function () {

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

  describe('POST /api/answers', function () {

    const options = {
      method: "POST", url: "/api/answers", payload: {
        data: {
          type: 'answer',
          attributes: {
            value: "1"
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessment',
                id: 'assessment_id'
              }
            },
            challenge: {
              data: {
                type: 'challenge',
                id: 'challenge_id'
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

    it("should add a new answer into the database", function (done) {
      // given
      Answer.count().then(function (beforeAnswersNumber) {
        // when
        server.injectThen(options).then((response) => {
          Answer.count().then(function (afterAnswersNumber) {
            // then
            expect(afterAnswersNumber).to.equal(beforeAnswersNumber + 1);
            done();
          });
        });
      });
    });

    it("should persist the given course ID and user ID", function (done) {

      // when
      server.injectThen(options).then((response) => {

        new Answer({ id: response.result.data.id })
          .fetch()
          .then(function (model) {
            console.log(JSON.stringify(model));

            expect(model.get('value')).to.equal(options.payload.data.attributes.value);
            expect(model.get('assessmentId')).to.equal(options.payload.data.relationships.assessment.data.id);
            expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);
            done();
          });

      });
    });

    it("should return persisted assessement", function (done) {
      // when
      server.injectThen(options).then((response) => {
        const answer = response.result.data;

        // then
        expect(answer.id).to.exist;
        expect(answer.attributes.value).to.equal(options.payload.data.attributes.value);
        expect(answer.relationships.assessment.data.id).to.equal(options.payload.data.relationships.assessment.data.id);
        expect(answer.relationships.challenge.data.id).to.equal(options.payload.data.relationships.challenge.data.id);

        done();
      });
    });

  });

});
