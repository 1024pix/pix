import { PasswordNotMatching } from '../../../../../src/identity-access-management/domain/errors.js';
import { authenticateApplication } from '../../../../../src/identity-access-management/domain/usecases/authenticate-application.js';
import { config } from '../../../../../src/shared/config.js';
import {
  ApplicationScopeNotAllowedError,
  ApplicationWithInvalidCredentialsError,
} from '../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Usecase | authenticate-application', function () {
  context('when application is not found', function () {
    it('should throw an error', async function () {
      const payload = {
        clientId: Symbol('id'),
        clientSecret: Symbol('secret'),
      };

      const clientApplicationRepository = {
        findByClientId: sinon.stub(),
      };
      clientApplicationRepository.findByClientId.withArgs(payload.clientId).resolves(undefined);

      const err = await catchErr(authenticateApplication)({ ...payload, clientApplicationRepository });

      expect(err).to.be.instanceOf(ApplicationWithInvalidCredentialsError);
    });
  });

  context('when application is found', function () {
    context('when client secrets are different', function () {
      it('should throw an error', async function () {
        const payload = {
          clientId: 'test-apimOsmoseClientId',
          clientSecret: 'mauvais-secret',
        };

        const clientApplicationRepository = {
          findByClientId: sinon.stub(),
        };
        const application = domainBuilder.buildClientApplication({
          name: 'test-apimOsmoseClientId',
          clientSecret: 'mon-secret',
          scopes: [],
        });
        clientApplicationRepository.findByClientId.withArgs(payload.clientId).resolves(application);

        const cryptoService = {
          checkPassword: sinon.stub(),
        };
        cryptoService.checkPassword
          .withArgs({ password: payload.clientSecret, passwordHash: application.clientSecret })
          .rejects(new PasswordNotMatching());

        const err = await catchErr(authenticateApplication)({ ...payload, clientApplicationRepository, cryptoService });

        expect(err).to.be.instanceOf(ApplicationWithInvalidCredentialsError);
      });
    });

    context('when client scopes are different', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [{ scope: 'mauvais-scope bon-scope' }, { scope: 'mauvais-scope' }].forEach(({ scope }) => {
        it(`should throw an error when scope is ${scope}`, async function () {
          const payload = {
            clientId: 'test-apimOsmoseClientId',
            clientSecret: 'bon-secret',
            scope,
          };

          const clientApplicationRepository = {
            findByClientId: sinon.stub(),
          };
          const application = domainBuilder.buildClientApplication({
            name: 'test-apimOsmoseClientId',
            clientSecret: 'bon-secret',
            scopes: ['bon-scope'],
          });
          clientApplicationRepository.findByClientId.withArgs(payload.clientId).resolves(application);

          const cryptoService = {
            checkPassword: sinon.stub(),
          };
          cryptoService.checkPassword
            .withArgs({ password: payload.clientSecret, passwordHash: application.clientSecret })
            .resolves();

          const err = await catchErr(authenticateApplication)({
            ...payload,
            clientApplicationRepository,
            cryptoService,
          });

          expect(err).to.be.instanceOf(ApplicationScopeNotAllowedError);
        });
      });
    });

    context('when given information is correct', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [{ scope: 'bon-scope' }, { scope: 'bon-scope autre-bon-scope' }].forEach(({ scope }) => {
        it(`should return created token with scope ${scope}`, async function () {
          const payload = {
            clientId: 'test-apimOsmoseClientId',
            clientSecret: 'bon-secret',
            scope,
          };

          const clientApplicationRepository = {
            findByClientId: sinon.stub(),
          };
          const application = domainBuilder.buildClientApplication({
            name: 'mon-application',
            clientId: 'test-apimOsmoseClientId',
            clientSecret: 'bon-secret',
            scopes: ['bon-scope', 'autre-bon-scope'],
          });
          clientApplicationRepository.findByClientId.withArgs(payload.clientId).resolves(application);

          const cryptoService = {
            checkPassword: sinon.stub(),
          };
          cryptoService.checkPassword
            .withArgs({ password: payload.clientSecret, passwordHash: application.clientSecret })
            .resolves();

          const tokenService = {
            createAccessTokenFromApplication: sinon.stub(),
          };
          const expectedToken = Symbol('Mon Super token');
          tokenService.createAccessTokenFromApplication
            .withArgs(
              application.clientId,
              application.name,
              payload.scope,
              config.authentication.secret,
              config.authentication.accessTokenLifespanMs,
            )
            .resolves(expectedToken);

          const token = await authenticateApplication({
            ...payload,
            tokenService,
            clientApplicationRepository,
            cryptoService,
          });

          expect(token).to.be.equal(expectedToken);
        });
      });
    });
  });
});
