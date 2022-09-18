const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const cloneDeep = require('lodash/cloneDeep');
const moduleUnderTest = require('../../../../lib/application/account-recovery');
const accountRecoveryController = require('../../../../lib/application/account-recovery/account-recovery-controller');

describe('Unit | Router | account-recovery', function () {
  let httpTestServer;
  beforeEach(function () {
    httpTestServer = new HttpTestServer();
  });

  describe('POST /api/account-recovery', function () {
    let method, url;
    const validPayload = {
      data: {
        attributes: {
          'first-name': 'Buffy',
          'last-name': 'Summers',
          'ine-ina': '012345678BS',
          birthdate: '1981-01-19',
          email: 'the-slayer@sunnydale.com',
        },
      },
    };

    beforeEach(function () {
      method = 'POST';
      url = '/api/account-recovery';
    });

    context('Payload schema validation', function () {
      context('Success cases', function () {
        beforeEach(function () {
          sinon.stub(accountRecoveryController, 'sendEmailForAccountRecovery').returns('ok');
        });

        it("should call controller's handler when payload is valid with INE", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const validPayloadINE = cloneDeep(validPayload);
          validPayloadINE.data.attributes['ine-ina'] = '012345678BS';

          // when
          await httpTestServer.request(method, url, validPayloadINE);

          // then
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.have.been.called;
        });

        it("should call controller's handler when payload is valid with INA", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const validPayloadINA = cloneDeep(validPayload);
          validPayloadINA.data.attributes['ine-ina'] = '0123456789B';

          // when
          await httpTestServer.request(method, url, validPayloadINA);

          // then
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.have.been.called;
        });
      });

      context('Error cases', function () {
        beforeEach(function () {
          sinon.stub(accountRecoveryController, 'sendEmailForAccountRecovery').throws('I should not be called');
        });

        it("should not call controller's handler and return error code 400 when first-name is not provided", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['first-name'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.first-name" must be a string',
          });
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when last-name is not provided", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['last-name'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.last-name" must be a string',
          });
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when ine-ina is not provided", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['ine-ina'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.ine-ina" must be one of [string]',
          });
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when ine-ina is neither a INE good format nor INA good format", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['ine-ina'] = 'PIMPON';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.ine-ina" does not match any of the allowed types',
          });
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when birthdate is not provided", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['birthdate'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.birthdate" must be a valid date',
          });
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when birthdate is not in good format", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['birthdate'] = '25/12/2020';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.birthdate" must be in YYYY-MM-DD format',
          });
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when email is not provided", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['email'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.email" must be a string',
          });
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when email is not in good format", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['email'] = 'not an email';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.email" must be a valid email',
          });
          expect(accountRecoveryController.sendEmailForAccountRecovery).to.not.have.been.called;
        });
      });
    });
  });

  describe('GET /api/account-recovery/{temporaryKey}', function () {
    let method, baseUrl;
    const validTemporaryKey = { temporaryKey: 'JE_FAIT_BIEN_PLUS_DE_32_CARACTERES' };

    beforeEach(async function () {
      method = 'GET';
      baseUrl = '/api/account-recovery/';
    });

    context('Route temporary key validation', function () {
      context('Success cases', function () {
        it("should call controller's handler when provided temporary key is valid", async function () {
          // given
          sinon.stub(accountRecoveryController, 'checkAccountRecoveryDemand').returns('ok');
          await httpTestServer.register(moduleUnderTest);
          const url = `${baseUrl}${JSON.stringify(validTemporaryKey)}`;

          // when
          await httpTestServer.request(method, url);

          // then
          expect(accountRecoveryController.checkAccountRecoveryDemand).to.have.been.called;
        });
      });

      context('Error cases', function () {
        beforeEach(function () {
          sinon.stub(accountRecoveryController, 'checkAccountRecoveryDemand').throws('I should not be called');
        });

        it("should not call controller's handler and return code 400 when temporary key is not provided", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidTemporaryKey = cloneDeep(validTemporaryKey);
          invalidTemporaryKey.temporaryKey = null;
          const url = `${baseUrl}${JSON.stringify(invalidTemporaryKey)}`;

          // when
          const response = await httpTestServer.request(method, url);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"temporaryKey" length must be at least 32 characters long',
          });
          expect(accountRecoveryController.checkAccountRecoveryDemand).to.not.have.been.called;
        });

        it('should return code 400 when temporary key is not long enough', async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidTemporaryKey = cloneDeep(validTemporaryKey);
          invalidTemporaryKey.temporaryKey = 'Coucou';
          const url = `${baseUrl}${JSON.stringify(invalidTemporaryKey)}`;

          // when
          const response = await httpTestServer.request(method, url);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"temporaryKey" length must be at least 32 characters long',
          });
          expect(accountRecoveryController.checkAccountRecoveryDemand).to.not.have.been.called;
        });
      });
    });
  });
  describe('PATCH /api/account-recovery', function () {
    let method, url;
    const validPayload = {
      data: {
        attributes: {
          'temporary-key': 'IM_SUPER_LONG_ENOUGH_TO_BE_A_VALID_TEMP_KEY',
          password: 'AtLeast8CharsOneUpperOneLowerOneDigit',
        },
      },
    };

    beforeEach(function () {
      method = 'PATCH';
      url = '/api/account-recovery';
    });

    context('Payload schema validation', function () {
      context('Success cases', function () {
        it("should call controller's handler when payload is valid", async function () {
          // given
          sinon.stub(accountRecoveryController, 'updateUserAccountFromRecoveryDemand').returns('ok');
          await httpTestServer.register(moduleUnderTest);

          // when
          await httpTestServer.request(method, url, validPayload);

          // then
          expect(accountRecoveryController.updateUserAccountFromRecoveryDemand).to.have.been.calledOnce;
        });
      });

      context('Error cases', function () {
        beforeEach(function () {
          sinon.stub(accountRecoveryController, 'updateUserAccountFromRecoveryDemand').throws('I should not be called');
        });

        it("should not call controller's handler and return error code 400 when temporary-key is not provided", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['temporary-key'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.temporary-key" must be a string',
          });
          expect(accountRecoveryController.updateUserAccountFromRecoveryDemand).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when temporary-key is not long enough", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['temporary-key'] = 'HELLO';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.temporary-key" length must be at least 32 characters long',
          });
          expect(accountRecoveryController.updateUserAccountFromRecoveryDemand).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when password is not provided", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['password'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.password" must be a string',
          });
          expect(accountRecoveryController.updateUserAccountFromRecoveryDemand).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when password is not long enough", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['password'] = 'Ab3';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error.status).to.equal('400');
          expect(error.title).to.equal('Bad Request');
          expect(error.detail).to.contains('fails to match the required pattern');
          expect(accountRecoveryController.updateUserAccountFromRecoveryDemand).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when password has no uppercase character", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['password'] = 'bonjourparis123';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error.status).to.equal('400');
          expect(error.title).to.equal('Bad Request');
          expect(error.detail).to.contains('fails to match the required pattern');
          expect(accountRecoveryController.updateUserAccountFromRecoveryDemand).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when password has no lowercase character", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['password'] = 'BONJOURPARIS123';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error.status).to.equal('400');
          expect(error.title).to.equal('Bad Request');
          expect(error.detail).to.contains('fails to match the required pattern');
          expect(accountRecoveryController.updateUserAccountFromRecoveryDemand).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when password has no digit", async function () {
          // given
          await httpTestServer.register(moduleUnderTest);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['password'] = 'BONJOURparis';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error.status).to.equal('400');
          expect(error.title).to.equal('Bad Request');
          expect(error.detail).to.contains('fails to match the required pattern');
          expect(accountRecoveryController.updateUserAccountFromRecoveryDemand).to.not.have.been.called;
        });
      });
    });
  });
});
