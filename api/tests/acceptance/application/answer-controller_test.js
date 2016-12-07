const server = require('../../../server');
const Answer = require('../../../lib/domain/models/data/answer');

server.register(require('inject-then'));

describe('Acceptance | API | Answers', function () {

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

  /* Get
  –––––––––––––––––––––––––––––––––––––––––––––––––– */
  describe('Get /api/answers/:id (single answer)', function () {

    let inserted_answer_id = null;

    const inserted_answer = {
      value: '1,2',
      result: 'ok',
      challengeId: 'recLt9uwa2dR3IYpi',
      assessmentId: '12345'
    };

    beforeEach(function (done) {
      knex('answers').delete().then(() => {
        knex('answers').insert([inserted_answer]).then((id) => {
          inserted_answer_id = id;
          done();
        });
      });
    });

    afterEach(function (done) {
      knex('answers').delete().then(() => {done();});
    });

    it('should return 200 HTTP status code', function (done) {
      server.injectThen({method: 'GET', url: `/api/answers/${inserted_answer_id}`}).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.injectThen({method: 'GET', url: `/api/answers/${inserted_answer_id}`}).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return required answer', function (done) {
      server.injectThen({method: 'GET', url: `/api/answers/${inserted_answer_id}`}).then((response) => {
        const answer = response.result.data;

        expect(answer.id.toString()).to.equal(inserted_answer_id.toString());
        expect(answer.attributes.value.toString()).to.equal(inserted_answer.value.toString());
        expect(answer.attributes.result.toString()).to.equal(inserted_answer.result.toString());
        expect(answer.relationships.assessment.data.id.toString()).to.equal(inserted_answer.assessmentId.toString());
        expect(answer.relationships.challenge.data.id.toString()).to.equal(inserted_answer.challengeId.toString());

        done();
      });
    });

  });


  /* Find
  –––––––––––––––––––––––––––––––––––––––––––––––––– */
  describe('Find /api/answers?challengeId=Y&assessmentId=Z', function () {

    let inserted_answer_id = null;

    const queryUrl = '/api/answers?challenge=recLt9uwa2dR3IYpi&assessment=12345';

    const inserted_answer = {
      value: '1,2',
      result: 'ok',
      challengeId: 'recLt9uwa2dR3IYpi',
      assessmentId: '12345'
    };

    beforeEach(function (done) {
      knex('answers').delete().then(() => {
        knex('answers').insert([inserted_answer]).then((id) => {
          inserted_answer_id = id;
          done();
        });
      });
    });

    afterEach(function (done) {
      knex('answers').delete().then(() => {done();});
    });

    it('should return 200 HTTP status code', function (done) {
      server.injectThen({method: 'GET', url: queryUrl}).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.injectThen({method: 'GET', url: queryUrl}).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return required answer', function (done) {
      server.injectThen({method: 'GET', url: queryUrl}).then((response) => {
        const answer = response.result.data;

        expect(answer.id.toString()).to.equal(inserted_answer_id.toString());
        expect(answer.attributes.value.toString()).to.equal(inserted_answer.value.toString());
        expect(answer.attributes.result.toString()).to.equal(inserted_answer.result.toString());
        expect(answer.relationships.assessment.data.id.toString()).to.equal(inserted_answer.assessmentId.toString());
        expect(answer.relationships.challenge.data.id.toString()).to.equal(inserted_answer.challengeId.toString());

        done();
      });
    });

    it('should return 200 with "null" data if not found answer', function (done) {
      server.injectThen({method: 'GET', url: '/api/answers?challenge=nothing&assessment=nothing'}).then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.be.null;

        done();
      });
    });
  });


  /* Save
  –––––––––––––––––––––––––––––––––––––––––––––––––– */
  describe('POST /api/answers (create)', function () {

    beforeEach(function (done) {
      knex('answers').delete().then(() => {done();});
    });
    afterEach(function (done) {
      knex('answers').delete().then(() => {done();});
    });

    before(function (done) {
      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves/challenge_id')
        .times(5)
        .reply(200, {
          'id': 'recLt9uwa2dR3IYpi',
          'fields': {
            'Type d\'épreuve': 'QCU',
            'Bonnes réponses': '1'
            //other fields not represented
          }
        });
      done();
    });

    const options = {
      method: 'POST', url: '/api/answers', payload: {
        data: {
          type: 'answer',
          attributes: {
            value: '1'
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

    it('should return 201 HTTP status code', function (done) {
      server.injectThen(options).then((response) => {
        expect(response.statusCode).to.equal(201);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.injectThen(options).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should add a new answer into the database', function (done) {
      server.injectThen(options).then((response) => {
        Answer.count().then(function (afterAnswersNumber) {
          expect(afterAnswersNumber).to.equal(1);
          done();
        });
      });
    });

    it('should return persisted answer', function (done) {
      // when
      server.injectThen(options).then((response) => {
        const answer = response.result.data;

        new Answer()
          .fetch()
          .then(function (model) {
            expect(model.id).to.be.a('number');
            expect(model.get('value')).to.equal(options.payload.data.attributes.value);
            expect(model.get('result')).to.equal('ok');
            expect(model.get('assessmentId')).to.equal(options.payload.data.relationships.assessment.data.id);
            expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);

            // then
            expect(answer.id).to.equal(model.id);
            expect(answer.id).to.equal(response.result.data.id);
            expect(answer.attributes.value).to.equal(model.get('value'));
            expect(answer.attributes.result).to.equal(model.get('result'));
            expect(answer.relationships.assessment.data.id).to.equal(model.get('assessmentId'));
            expect(answer.relationships.challenge.data.id).to.equal(model.get('challengeId'));

            done();
          });


      });
    });

  });



  /* Update
  –––––––––––––––––––––––––––––––––––––––––––––––––– */
  describe('POST /api/answers (update)', function () {

    const options = {
      method: 'POST', url: '/api/answers', payload: {
        data: {
          type: 'answer',
          attributes: {
            value: '1'
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

    beforeEach(function (done) {
      knex('answers').delete().then(() => {
        server.injectThen(options).then((response) => {
          done();
        });
      });
    });
    afterEach(function (done) {
      knex('answers').delete().then(() => {done();});
    });

    before(function (done) {
      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves/challenge_id')
        .times(5)
        .reply(200, {
          'id': 'recLt9uwa2dR3IYpi',
          'fields': {
            'Type d\'épreuve': 'QCU',
            'Bonnes réponses': '1'
            //other fields not represented
          }
        });
      done();
    });



    it('should return 200 HTTP status code', function (done) {
      server.injectThen(options).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.injectThen(options).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should not add a new answer into the database', function (done) {
      server.injectThen(options).then((response) => {
        Answer.count().then(function (afterAnswersNumber) {
          expect(afterAnswersNumber).to.equal(1);
          done();
        });
      });
    });

    it('should return updated answer', function (done) {
      // when
      server.injectThen(options).then((response) => {
        const answer = response.result.data;

        new Answer()
          .fetch()
          .then(function (model) {
            expect(model.id).to.be.a('number');
            expect(model.get('value')).to.equal(options.payload.data.attributes.value);
            expect(model.get('result')).to.equal('ok');
            expect(model.get('assessmentId')).to.equal(options.payload.data.relationships.assessment.data.id);
            expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);

            // then
            expect(answer.id).to.equal(model.id);
            expect(answer.id).to.equal(response.result.data.id);
            expect(answer.attributes.value).to.equal(model.get('value'));
            expect(answer.attributes.result).to.equal(model.get('result'));
            expect(answer.relationships.assessment.data.id).to.equal(model.get('assessmentId'));
            expect(answer.relationships.challenge.data.id).to.equal(model.get('challengeId'));

            done();
          });
      });
    });


  });


});
