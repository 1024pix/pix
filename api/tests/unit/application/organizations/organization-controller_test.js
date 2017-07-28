const { describe, it, expect, sinon, beforeEach, afterEach } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/data/user');
const Organisation = require('../../../../lib/domain/models/data/organization');
const controller = require('../../../../lib/application/organizations/organization-controller');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const organisationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const organizationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');
const organizationService = require('../../../../lib/domain/services/organization-service');
const logger = require('../../../../lib/infrastructure/logger');
const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | organizationController', () => {

  describe('#create', () => {

    let request;
    let replyStub;
    let codeStub;
    let sandbox;
    const organization = new Organisation({ email: 'existing-email@example.net', type: 'PRO' });
    const user = new User({ email: 'existing-email@example.net', id: 12 });

    beforeEach(() => {
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox = sinon.sandbox.create();

      sandbox.stub(logger, 'error');
      sandbox.stub(userRepository, 'save').resolves(user);
      sandbox.stub(userRepository, 'isEmailAvailable').resolves();
      sandbox.stub(organizationService, 'generateOrganizationCode').returns('ABCD12');
      sandbox.stub(organisationRepository, 'saveFromModel').resolves(organization);
      sandbox.stub(organisationRepository, 'isCodeAvailable').resolves();
      sandbox.stub(organizationSerializer, 'deserialize').returns(organization);
      sandbox.stub(organizationSerializer, 'serialize');

      request = {
        payload: {
          data: {
            attributes: {
              type: 'PRO',
              email: 'existing-email@example.net',
              'first-name': 'Tom',
              'last-name': 'Hanks',
              password: 'Pix2048#-DamnItEvolved'
            }
          }
        }
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should provide get method', () => {
      expect(controller.create).to.exist;
    });

    it('should use reply', () => {
      // When
      const promise = controller.create(request, replyStub);

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(replyStub);
      });
    });

    it('should try to register a new user', () => {
      // When
      const promise = controller.create(request, replyStub);

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(userRepository.save, {
          email: 'existing-email@example.net',
          firstName: 'Tom',
          lastName: 'Hanks',
          cgu: true,
          password: 'Pix2048#-DamnItEvolved'
        });

      });
    });

    describe('when unable to create an account', () => {
      beforeEach(() => {
        userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());
      });

      it('should reply 400', () => {
        // When
        const promise = controller.create(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(codeStub, 400);
          sinon.assert.calledWith(replyStub, {
            'errors': [
              {
                'detail': 'L\'adresse existing-email@example.net est déjà associée à un utilisateur.',
                'meta': {
                  'field': 'email'
                },
                'source': {
                  'pointer': '/data/attributes/email'
                },
                'status': '400',
                'title': 'Invalid Attribute'
              }
            ]
          });
        });
      });
    });

    describe('when the user account has been created', () => {
      it('should deserialize an organization', () => {
        // When
        const promise = controller.create(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledOnce(organizationSerializer.deserialize);
        });
      });

      it('should persist the organisation with the userID', () => {
        // When
        const promise = controller.create(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledOnce(organisationRepository.saveFromModel);

          const callArguments = organisationRepository.saveFromModel.firstCall.args[0];
          expect(callArguments.get('userId')).to.equal(12);
        });
      });

      it('should serialize the response', () => {
        // Given
        const serializedOrganization = { message: 'serialized organization' };
        organizationSerializer.serialize.returns(serializedOrganization);

        // When
        const promise = controller.create(request, replyStub);

        // Then
        return promise.then(() => {

          const callArguments = organizationSerializer.serialize.firstCall.args[0];
          expect(callArguments.user).to.equal(user);

          sinon.assert.calledWith(organizationSerializer.serialize, organization);
          sinon.assert.calledWith(replyStub, serializedOrganization);

        });
      });

      describe('generating a code for the organization', () => {
        it('should generate a code', () => {
          // When
          const promise = controller.create(request, replyStub);

          // Then
          return promise.then(() => {
            sinon.assert.calledOnce(organizationService.generateOrganizationCode);
          });
        });

        it('should verify if the code is unique', () => {
          // Then
          const promise = controller.create(request, replyStub);

          // When
          return promise.then(() => {
            sinon.assert.calledWith(organisationRepository.isCodeAvailable, 'ABCD12');
          });
        });

        it('should generate a code as many times as necessary to find a unique one', () => {
          // Given
          organizationService.generateOrganizationCode.onFirstCall().returns('CODE01');
          organizationService.generateOrganizationCode.onSecondCall().returns('CODE02');
          organizationService.generateOrganizationCode.onThirdCall().returns('CODE03');

          organisationRepository.isCodeAvailable.withArgs('CODE01').rejects();
          organisationRepository.isCodeAvailable.withArgs('CODE02').rejects();
          organisationRepository.isCodeAvailable.withArgs('CODE03').resolves('CODE03');

          // Then
          const promise = controller.create(request, replyStub);

          // When
          return promise.then(() => {
            sinon.assert.calledThrice(organisationRepository.isCodeAvailable);
          });
        });

        it('should generate a code as many times as necessary to find a unique one', () => {
          // Given
          const code = 'CODE01';
          organizationService.generateOrganizationCode.resolves(code);
          organisationRepository.isCodeAvailable.resolves(code);

          // Then
          const promise = controller.create(request, replyStub);

          // When
          return promise.then(() => {
            const callArguments = organisationRepository.saveFromModel.firstCall.args[0];
            expect(callArguments.get('code')).to.equal(code);
          });
        });

      });

      describe('when the organization payload is invalid', () => {
        it('should reply 400', () => {
          // When
          const promise = controller.create(request, replyStub);

          // Then
          return promise.catch(() => {
            sinon.assert.calledWith(replyStub, {
              'errors': [
                {
                  'detail': 'L\'adresse existing-email@example.net est déjà associée à un utilisateur.',
                  'meta': {
                    'field': 'email'
                  },
                  'source': {
                    'pointer': '/data/attributes/email'
                  },
                  'status': '400',
                  'title': 'Invalid Attribute'
                }
              ]
            });
          });
        });
      });

    });

    describe('when unable to save something in the database', () => {
      it('should return 500', () => {
        // Given
        const error = new Error();
        userRepository.isEmailAvailable.rejects(error);

        // When
        const promise = controller.create(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(codeStub, 500);
          sinon.assert.calledOnce(replyStub);
        });
      });

      it('should log any error', () => {
        // Given
        const error = new Error();
        userRepository.isEmailAvailable.rejects(error);

        // When
        const promise = controller.create(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(logger.error, error);
        });
      });

    });
  });
});
