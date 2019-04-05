const { expect, sinon, knex, nock } = require('../../../test-helper');
const XRegExp = require('xregexp');
const mailJet = require('../../../../lib/infrastructure/mailjet');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('save', () => {

    context('user is valid', () => {

      const options = {
        method: 'POST',
        url: '/api/users',
        payload: {
          data: {
            type: 'users',
            attributes: {
              'first-name': 'John',
              'last-name': 'DoDoe',
              'email': 'john.dodoe@example.net',
              'password': 'A124B2C3#!',
              'cgu': true,
              'recaptcha-token': 'reCAPTCHAToken',
            },
            relationships: {},
          },
        },
      };

      beforeEach(() => {
        sinon.stub(mailJet, 'sendEmail');

        nock('https://www.google.com')
          .post('/recaptcha/api/siteverify')
          .query(true)
          .reply(200, {
            'success': true,
          });
      });

      afterEach(() => {
        nock.cleanAll();
        return knex('users').delete();
      });

      it('should return status 201 with user', () => {
        // given
        const payloadRegExp = XRegExp(
          '{' +
            '"data":{' +
              '"type":"users",' +
              '"id":"(\\d+)",' +
              '"attributes":{' +
                '"first-name":"John",' +
                '"last-name":"DoDoe",' +
                '"email":"john.dodoe@example.net",' +
                '"cgu":true,' +
                '"pix-orga-terms-of-service-accepted":false,' +
                '"pix-certif-terms-of-service-accepted":false' +
              '},' +
            '"relationships":{' +
              '"memberships":{'+
                '"links":{'+
                  '"related":"/users/(\\d+)/memberships"'+
                '}'+
              '},'+
              '"certification-center-memberships":{'+
                '"links":{'+
                  '"related":"/users/(\\d+)/certification-center-memberships"'+
                '}'+
              '},'+
              '"pix-score":{'+
                '"links":{'+
                  '"related":"/users/(\\d+)/pixscore"'+
                '}'+
              '},'+
              '"scorecards":{'+
                '"links":{'+
                  '"related":"/users/(\\d+)/scorecards"'+
                '}'+
              '}'+
            '}'+
            '}' +
          '}',
        );

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(201);
          expect(response.payload).to.match(payloadRegExp);
        });
      });

      it('should create user in Database', () => {
        // given
        const expectedUserWithNoPasswordNorId = {
          firstName: 'John',
          lastName: 'DoDoe',
          email: 'john.dodoe@example.net',
        };

        // when
        const promise = server.inject(options);

        // then
        return promise
          .then(() => knex('users').select())
          .then((users) => {
            expect(users).to.have.lengthOf(1);
            expect(users[0]).to.include(expectedUserWithNoPasswordNorId);
            expect(users[0].cgu).to.be.ok;
            expect(users[0].password).to.exist;
          });
      });

      it('should send account creation email to user', () => {
        // given
        const expectedMail = {
          from: 'ne-pas-repondre@pix.fr',
          fromName: 'PIX - Ne pas répondre',
          subject: 'Création de votre compte PIX',
          template: '143620',
          to: 'john.dodoe@example.net',
        };

        // when
        const promise = server.inject(options);

        // then
        return promise
          .then(() => expect(mailJet.sendEmail).to.have.been.calledWith(expectedMail));
      });
    });
  });
});
