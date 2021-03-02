const pick = require('lodash/pick');

const {
  domainBuilder,
  expect,
  knex,
  nock,
  sinon,
} = require('../../../test-helper');

const mailer = require('../../../../lib/infrastructure/mailers/mailer');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(async () => {
    await knex('authentication-methods').delete();
    await knex('users_pix_roles').delete();
    await knex('sessions').delete();
    await knex('users').delete();
  });

  describe('save', () => {

    const options = {
      method: 'POST',
      url: '/api/users',
      payload: {
        data: {
          type: 'users',
          attributes: {
            'password': 'Password123',
            'cgu': true,
            'recaptcha-token': 'reCAPTCHAToken',
          },
          relationships: {},
        },
      },
    };

    let user;

    context('user is valid', () => {

      beforeEach(() => {
        sinon.stub(mailer, 'sendEmail');

        nock('https://www.google.com')
          .post('/recaptcha/api/siteverify')
          .query(true)
          .reply(200, {
            'success': true,
          });

        user = domainBuilder.buildUser({ username: null });

        options.payload.data.attributes = {
          ...options.payload.data.attributes,
          'first-name': user.firstName,
          'last-name': user.lastName,
          email: user.email,
        };
      });

      afterEach(async () => {
        nock.cleanAll();
      });

      it('should return status 201 with user', async () => {
        // given
        const pickedUserAttributes = ['first-name', 'last-name', 'email', 'username', 'cgu'];
        const expectedAttributes = {
          'first-name': user.firstName,
          'last-name': user.lastName,
          email: user.email,
          username: user.username,
          cgu: user.cgu,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.equal('users');
        expect(response.result.data.attributes['recaptcha-token']).to.be.undefined;

        const userAttributes = pick(response.result.data.attributes, pickedUserAttributes);
        expect(userAttributes).to.deep.equal(expectedAttributes);
      });

      it('should create user in Database', async () => {
        // given
        const pickedUserAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu'];
        const expectedUser = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          cgu: user.cgu,
        };

        // when
        await server.inject(options);

        // then
        const userFound = await userRepository.getByUsernameOrEmailWithRolesAndPassword(user.email);
        expect(pick(userFound, pickedUserAttributes)).to.deep.equal(expectedUser);
        expect(userFound.authenticationMethods[0].authenticationComplement.password).to.exist;
      });

      it('should send account creation email to user', async () => {
        // given
        const expectedMail = {
          from: 'ne-pas-repondre@pix.fr',
          fromName: 'PIX - Ne pas répondre',
          subject: 'Votre compte Pix a bien été créé',
          template: 'test-account-creation-template-id',
          to: user.email,
          variables: {
            homeName: 'pix.fr',
            homeUrl: 'https://pix.fr',
            redirectionUrl: 'https://app.pix.fr/connexion',
            helpdeskUrl: 'https://support.pix.fr/support/tickets/new',
            displayNationalLogo: true,
            title: 'Votre compte Pix a bien été créé !',
            subtitle: 'Vous pouvez désormais commencer les tests.',
            goToPix: 'Commencer les tests',
            disclaimer: 'Si vous n\'êtes pas à l’origine de cette création de compte, vous pouvez en demander la suppression',
            helpdeskLinkLabel: 'ici',
            pixPresentation: 'Pix est le service public en ligne pour évaluer, développer et certifier ses compétences numériques.',
            moreOn: 'En savoir plus sur',
            doNotAnswer: 'Ceci est un e-mail automatique, merci de ne pas y répondre.',
            askForHelp: 'Besoin d’aide, contactez-nous',
          },
        };

        // when
        await server.inject(options);

        // then
        expect(mailer.sendEmail).to.have.been.calledWith(expectedMail);
      });
    });

    context('user is invalid', async () => {

      const validUserAttributes = {
        'first-name': 'John',
        'last-name': 'DoDoe',
        'email': 'john.doe@example.net',
        'password': 'Ab124B2C3#!',
        'cgu': true,
        'recaptcha-token': 'reCAPTCHAToken',
      };

      it('should return Unprocessable Entity (HTTP_422) with offending properties', async () => {

        const invalidUserAttributes = { ...validUserAttributes, 'must-validate-terms-of-service': 'not_a_boolean' };

        const options = {
          method: 'POST',
          url: '/api/users',
          payload: {
            data: {
              type: 'users',
              attributes: invalidUserAttributes,
              relationships: {},
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
        expect(response.result.errors[0].title).to.equal('Invalid data attribute "mustValidateTermsOfService"');
      });
    });
  });
});
