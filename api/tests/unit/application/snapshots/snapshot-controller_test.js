const { describe, it, sinon, beforeEach, afterEach } = require('../../../test-helper');
const profileService = require('../../../../lib/domain/services/profile-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const snapshotService = require('../../../../lib/domain/services/snapshot-service');
const profileCompletionService = require('../../../../lib/domain/services/profile-completion-service');
const snapshotController = require('../../../../lib/application/snapshots/snapshot-controller');
const authorizationToken = require('../../../../lib/infrastructure/validators/jsonwebtoken-verify');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const profileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const snapshotSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const logger = require('../../../../lib/infrastructure/logger');
const { InvalidTokenError, NotFoundError } = require('../../../../lib/domain/errors');

const USER_ID = 1;
const ORGANIZATION_ID = 3;
const SNAPSHOT_ID = 4;

const user = {
  id: USER_ID,
  firstName: 'Luke',
  lastName: 'Skywalker',
  email: 'luke@sky.fr'
};

describe('Unit | Controller | snapshot-controller', () => {

  describe('#Create', () => {

    const request = {
      headers: {
        authorization: 'valid_token'
      },
      payload: {
        data: {
          relationships: {
            organization: {
              data: {
                id: ORGANIZATION_ID
              }
            }
          }
        }
      }
    };

    beforeEach(() => {
      sinon.stub(validationErrorSerializer, 'serialize');
    });

    afterEach(() => {
      validationErrorSerializer.serialize.restore();
    });

    it('should have a request with Authorization header', () => {
      // given
      const replyStub = sinon.stub().returns({
        code: () => {
        }
      });

      // when
      snapshotController.create(null, replyStub);

      // then
      sinon.assert.calledOnce(validationErrorSerializer.serialize);
    });

    describe('Behavior', () => {

      let sandbox;
      const codeSpy = sinon.spy();
      const replyStub = sinon.stub().returns({
        code: codeSpy
      });

      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(authorizationToken, 'verify');
        sandbox.stub(userRepository, 'findUserById');
        sandbox.stub(snapshotSerializer, 'deserialize');
        sandbox.stub(profileService, 'getByUserId');
        sandbox.stub(organizationRepository, 'isOrganizationIdExist');
        sandbox.stub(snapshotService, 'create');
        sandbox.stub(profileSerializer, 'serialize');
        sandbox.stub(profileCompletionService, 'getPercentage');
        sandbox.stub(snapshotSerializer, 'serialize');
        sandbox.stub(logger, 'error');
      });

      afterEach(() => {
        sandbox.restore();
      });

      describe('Test collaboration', function() {

        it('should verify that user is well authenticated / authorized', () => {
          // given
          authorizationToken.verify.resolves();

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(authorizationToken.verify);
            sinon.assert.calledWith(authorizationToken.verify, 'valid_token');
          });
        });

        it('should fetch the user', () => {
          // given
          authorizationToken.verify.resolves(USER_ID);
          userRepository.findUserById.resolves();

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(userRepository.findUserById);
            sinon.assert.calledWith(userRepository.findUserById, USER_ID);
          });
        });

        it('should deserialize the request payload', () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves();

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(snapshotSerializer.deserialize);
            sinon.assert.calledWith(snapshotSerializer.deserialize, request.payload);
          });
        });

        it('should verify that the organization exists', () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves();
          snapshotSerializer.deserialize.resolves({ organization: { id: ORGANIZATION_ID } });

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(organizationRepository.isOrganizationIdExist);
            sinon.assert.calledWith(organizationRepository.isOrganizationIdExist, 3);
          });
        });

        it('should retrieve profile for user', () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves({ organization: { id: ORGANIZATION_ID } });
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(profileService.getByUserId);
            sinon.assert.calledWith(profileService.getByUserId, USER_ID);
          });
        });

        it('should serialize profile in JSON in order to be saved in DB', () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves({ organization: { id: ORGANIZATION_ID } });
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });
          profileService.getByUserId.resolves({ profile: 'a_valid_profile' });

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(profileSerializer.serialize);
            sinon.assert.calledWith(profileSerializer.serialize, { profile: 'a_valid_profile' });
          });
        });

        it('should calculate profile completion in percentage', () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves({ organization: { id: ORGANIZATION_ID } });
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });
          profileService.getByUserId.resolves();
          profileSerializer.serialize.resolves({ profile: 'a_valid_profile' });

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(profileCompletionService.getPercentage);
            sinon.assert.calledWith(profileCompletionService.getPercentage, { profile: 'a_valid_profile' });
          });
        });

        it('should create & save a Snapshot entity into the repository', () => {
          // given
          const snapshot = { organization: { id: ORGANIZATION_ID } };
          const serializedProfile = { profile: 'a_valid_profile' };

          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves(snapshot);
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });
          profileService.getByUserId.resolves();
          profileSerializer.serialize.resolves(serializedProfile);
          profileCompletionService.getPercentage.resolves();

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(snapshotService.create);
            sinon.assert.calledWith(snapshotService.create, snapshot, user, serializedProfile);
          });
        });

        it('should serialize the response payload', () => {
          // given
          const snapshot = { organization: { id: ORGANIZATION_ID } };
          const serializedProfile = { profile: 'a_valid_profile' };

          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves(snapshot);
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });
          profileService.getByUserId.resolves();
          profileSerializer.serialize.resolves(serializedProfile);
          profileCompletionService.getPercentage.resolves();
          snapshotService.create.resolves(SNAPSHOT_ID);

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(snapshotSerializer.serialize);
            sinon.assert.calledWith(snapshotSerializer.serialize, { id: SNAPSHOT_ID });
          });
        });

      });

      describe('Errors cases', () => {

        it('should return an error, when token is not valid', () => {
          // given
          authorizationToken.verify.rejects(new InvalidTokenError());
          const expectedSerializeArg = {
            data: {
              authorization: ['Le token n’est pas valide']
            }
          };

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(validationErrorSerializer.serialize);
            sinon.assert.calledWith(validationErrorSerializer.serialize, expectedSerializeArg);
          });
        });

        it('should return an error, when user is not found', () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.rejects(new NotFoundError());
          const expectedSerializeArg = {
            data: {
              authorization: ['Cet utilisateur est introuvable']
            }
          };

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(validationErrorSerializer.serialize);
            sinon.assert.calledWith(validationErrorSerializer.serialize, expectedSerializeArg);
          });
        });

        it('should return an error, when organisation is not found', () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves();
          snapshotSerializer.deserialize.resolves({ organization: { id: 'unknnown_organization_id' } });
          organizationRepository.isOrganizationIdExist.resolves(false);

          const expectedSerializeArg = {
            data: {
              authorization: ['Cette organisation n’existe pas']
            }
          };

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(validationErrorSerializer.serialize);
            sinon.assert.calledWith(validationErrorSerializer.serialize, expectedSerializeArg);
          });
        });

        it('should return an error, when snapshot saving fails', () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves();
          organizationRepository.isOrganizationIdExist.resolves();
          profileService.getByUserId.resolves();
          profileSerializer.serialize.resolves();
          snapshotService.create.rejects(new Error());

          const expectedSerializeArg = {
            data: {
              authorization: ['Une erreur est survenue lors de la création de l’instantané']
            }
          };
          // when
          const promise = snapshotController.create(request, replyStub);
          // then
          return promise.then(() => {
            sinon.assert.calledOnce(validationErrorSerializer.serialize);
            sinon.assert.calledWith(validationErrorSerializer.serialize, expectedSerializeArg);
          });
        });

        it('should log an error, when unknown error has occured', () => {
          // given
          const error = new Error('Another error');
          authorizationToken.verify.rejects(error);

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(logger.error, error);
          });
        });

      });
    });

  });
});
