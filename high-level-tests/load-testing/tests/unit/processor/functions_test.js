const { expect, sinon } = require('../../test-helpers');
const faker = require('@faker-js/faker');
const {
  foundNextChallenge,
  handleResponseForChallengeId,
  setupSignupFormData,
} = require('../../../processor/functions');

describe('Unit | Processor | Functions', () => {

  describe('#foundNextChallenge', () => {

    it('should call next with true if challengeId exist', () => {
      // given
      const challengeId = 100;
      const context = {
        vars: {
          challengeId,
        },
      };
      const next = sinon.stub();

      // when
      foundNextChallenge(context, next);

      // then
      expect(next).to.be.calledWith(true);
    });

    it('should call next with false if challengeId is undefined', () => {
      // given
      const challengeId = undefined;
      const context = {
        vars: {
          challengeId,
        },
      };
      const next = sinon.stub();

      // when
      foundNextChallenge(context, next);

      // then
      expect(next).to.be.calledWith(false);
    });
  });

  describe('#handleResponseForChallengeId', () => {

    it('should retrieve challengeId', () => {
      // given
      const challengeId = 'recZTnGUZgrglFQE3';
      const requestParams = {};
      const response = {
        body: `{"data":{"id":"${challengeId}"}}`,
      };
      const context = {
        vars: {},
      };
      const events = {};
      const next = sinon.stub();

      // when
      handleResponseForChallengeId(
        requestParams, response, context, events, next,
      );

      // then
      expect(context.vars.challengeId).to.be.equal(challengeId);
      expect(next).to.be.called;
    });
  });

  describe('#setupSignupFormData', () => {

    it('should create user attributes', () => {
      // given
      sinon.spy(faker.name, 'firstName');
      sinon.spy(faker.name, 'lastName');
      sinon.spy(faker.datatype, 'uuid');
      const done = sinon.stub();
      const events = {};
      const context = {
        vars: {},
      };

      // when
      setupSignupFormData(context, events, done);

      // then
      expect(faker.name.firstName).to.be.called;
      expect(faker.name.lastName).to.be.called;
      expect(faker.datatype.uuid).to.be.called;

      expect(context.vars.firstName).to.be.ok;
      expect(context.vars.lastName).to.be.ok;
      expect(context.vars.email.endsWith('@example.net')).to.be.true;
      expect(context.vars.password).to.be.equal('Password123');

      expect(done).to.be.called;
    });
  });
});
