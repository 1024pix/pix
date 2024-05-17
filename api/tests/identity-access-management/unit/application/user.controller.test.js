import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { userController } from '../../../../src/identity-access-management/application/user/user.controller.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
import { User } from '../../../../src/shared/domain/models/User.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | User', function () {
  let userSerializer;

  beforeEach(function () {
    userSerializer = {
      deserialize: sinon.stub(),
      serialize: sinon.stub(),
    };
  });

  describe('#save', function () {
    const email = 'to-be-free@ozone.airplane';
    const password = 'Password123';

    const deserializedUser = new User();
    const savedUser = new User({ email });
    const localeFromHeader = 'fr-fr';
    let dependencies;

    beforeEach(function () {
      userSerializer.deserialize.returns(deserializedUser);

      const validationErrorSerializer = {
        deserialize: sinon.stub(),
        serialize: sinon.stub(),
      };
      const cryptoService = {
        hashPassword: sinon.stub(),
      };
      const mailService = {
        sendAccountCreationEmail: sinon.stub(),
      };
      const localeService = {
        getCanonicalLocale: sinon.stub(),
      };

      dependencies = {
        userSerializer,
        validationErrorSerializer,
        cryptoService,
        mailService,
        localeService,
        requestResponseUtils,
      };

      sinon.stub(usecases, 'createUser').returns(savedUser);
    });

    describe('when request is valid', function () {
      describe('when there is no locale cookie', function () {
        it('should return a serialized user and a 201 status code', async function () {
          // given
          const expectedSerializedUser = { message: 'serialized user' };
          userSerializer.serialize.returns(expectedSerializedUser);

          // when
          const response = await userController.save(
            {
              payload: {
                data: {
                  attributes: {
                    'first-name': 'John',
                    'last-name': 'DoDoe',
                    email: 'john.dodoe@example.net',
                    cgu: true,
                    password,
                  },
                },
              },
            },
            hFake,
            dependencies,
          );

          // then
          expect(dependencies.userSerializer.serialize).to.have.been.calledWithExactly(savedUser);
          expect(dependencies.localeService.getCanonicalLocale).to.not.have.been.called;
          expect(response.source).to.deep.equal(expectedSerializedUser);
          expect(response.statusCode).to.equal(201);
        });
      });

      describe('when there is a locale cookie', function () {
        it('should return a serialized user with "locale" attribute and a 201 status code', async function () {
          // given
          const localeFromCookie = 'fr-FR';
          const expectedSerializedUser = { message: 'serialized user', locale: localeFromCookie };
          const savedUser = new User({ email, locale: localeFromCookie });

          const useCaseParameters = {
            user: { ...deserializedUser, locale: localeFromCookie },
            password,
            localeFromHeader,
            campaignCode: null,
          };

          dependencies.localeService.getCanonicalLocale.returns(localeFromCookie);
          dependencies.userSerializer.serialize.returns(expectedSerializedUser);
          usecases.createUser.resolves(savedUser);

          // when
          const response = await userController.save(
            {
              payload: {
                data: {
                  attributes: {
                    'first-name': 'John',
                    'last-name': 'DoDoe',
                    email: 'john.dodoe@example.net',
                    cgu: true,
                    password,
                  },
                },
              },
              state: {
                locale: localeFromCookie,
              },
            },
            hFake,
            dependencies,
          );

          // then
          expect(usecases.createUser).to.have.been.calledWithExactly(useCaseParameters);
          expect(dependencies.localeService.getCanonicalLocale).to.have.been.calledWithExactly(localeFromCookie);
          expect(dependencies.userSerializer.serialize).to.have.been.calledWithExactly(savedUser);
          expect(response.statusCode).to.equal(201);
        });
      });
    });
  });
});
