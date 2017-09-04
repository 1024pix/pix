const { describe, it, expect, sinon, beforeEach, afterEach } = require('../../../test-helper');
const profileService = require('../../../../lib/domain/services/profile-service');
const UserRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const SnapshotService = require('../../../../lib/domain/services/snapshot-service');
const ProfileCompletionService = require('../../../../lib/domain/services/profile-completion-service');
const snapshotController = require('../../../../lib/application/snapshots/snapshot-controller');
const authorizationToken = require('../../../../lib/infrastructure/validators/jsonwebtoken-verify');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const OrganizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const profileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const snapshotSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const logger = require('../../../../lib/infrastructure/logger');
const { InvalidTokenError, NotFoundError } = require('../../../../lib/domain/errors');

const user = {
  id: 3,
  firstName: 'Luke',
  lastName: 'Skywalker',
  email: 'luke@sky.fr'
};
const serializedUserProfile = {
  data: {
    type: 'users',
    id: 'user_id',
    attributes: {
      'first-name': 'Luke',
      'last-name': 'Skywalker',
      'total-pix-score': 128,
      'email': 'luke@sky.fr'
    },
    relationships: {
      competences: {
        data: [
          { type: 'competences', id: 'recCompA' },
          { type: 'competences', id: 'recCompB' }
        ]
      }
    },
  },
  included: [
    {
      type: 'areas',
      id: 'recAreaA',
      attributes: {
        name: 'area-name-1'
      }
    },
    {
      type: 'areas',
      id: 'recAreaB',
      attributes: {
        name: 'area-name-2'
      }
    },
    {
      type: 'competences',
      id: 'recCompA',
      attributes: {
        name: 'competence-name-1',
        index: '1.1',
        level: -1,
        'course-id': 'recBxPAuEPlTgt72q11'
      },
      relationships: {
        area: {
          data: {
            type: 'areas',
            id: 'recAreaA'
          }
        }
      }
    },
    {
      type: 'competences',
      id: 'recCompB',
      attributes: {
        name: 'competence-name-2',
        index: '1.2',
        level: 8,
        'pix-score': 128,
        'course-id': 'recBxPAuEPlTgt72q99'
      },
      relationships: {
        area: {
          data: {
            type: 'areas',
            id: 'recAreaB'
          }
        }
      }
    }
  ]
};

describe('Unit | Controller | snapshotController', () => {

  describe('#Create', () => {

    let sandbox;
    const request = {
      headers: {
        authorization: 'valid_token'
      },
      payload: {
        data: {
          relationships: {
            organization: {
              data: {
                id: 3
              }
            }
          }
        }
      }
    };
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(validationErrorSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should be a function', () => {
      // then
      expect(snapshotController.create).to.be.a('function');
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
        sandbox.stub(UserRepository, 'findUserById');
        sandbox.stub(profileService, 'getByUserId');
        sandbox.stub(OrganizationRepository, 'isOrganizationIdExist');
        sandbox.stub(SnapshotService, 'create');
        sandbox.stub(profileSerializer, 'serialize');
        sandbox.stub(ProfileCompletionService, 'getPercentage');
        sandbox.stub(snapshotSerializer, 'serialize');
        sandbox.stub(logger, 'error');
      });

      afterEach(() => {
        sandbox.restore();
      });

      describe('Test collaboration', function() {

        it('should call authorization token verify service', () => {
          // given
          authorizationToken.verify.resolves({});

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(authorizationToken.verify);
            sinon.assert.calledWith(authorizationToken.verify, request.headers.authorization);
          });
        });

        it('should call UserRepository', () => {
          // given
          authorizationToken.verify.resolves(user.id);
          UserRepository.findUserById.resolves({});

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(UserRepository.findUserById);
            sinon.assert.calledWith(UserRepository.findUserById, user.id);
          });
        });

        it('should call OrganizationRepository', () => {
          // given
          authorizationToken.verify.resolves({});
          UserRepository.findUserById.resolves({});
          OrganizationRepository.isOrganizationIdExist.resolves();

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(OrganizationRepository.isOrganizationIdExist);
            sinon.assert.calledWith(OrganizationRepository.isOrganizationIdExist, request.payload.data.relationships.organization.data.id);
          });
        });

        it('should call profile service', () => {
          // given
          authorizationToken.verify.resolves({});
          UserRepository.findUserById.resolves({});
          OrganizationRepository.isOrganizationIdExist.resolves(true);
          profileService.getByUserId.resolves({});

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(profileService.getByUserId);
          });
        });

        it('should call profile serializer', () => {
          // given
          authorizationToken.verify.resolves({});
          UserRepository.findUserById.resolves({});
          OrganizationRepository.isOrganizationIdExist.resolves(true);
          profileService.getByUserId.resolves({});
          profileSerializer.serialize.returns({});
          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(profileSerializer.serialize);
          });
        });

        it('should call Profile completion service', () => {
          // given
          authorizationToken.verify.resolves({});
          UserRepository.findUserById.resolves({});
          OrganizationRepository.isOrganizationIdExist.resolves(true);
          profileService.getByUserId.resolves({});
          profileSerializer.serialize.returns({});
          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(ProfileCompletionService.getPercentage);
          });
        });

        it('should call Snapshot repository', () => {
          // given
          authorizationToken.verify.resolves({});
          UserRepository.findUserById.resolves({});
          OrganizationRepository.isOrganizationIdExist.resolves(true);
          profileService.getByUserId.resolves({});
          profileSerializer.serialize.returns(serializedUserProfile);
          ProfileCompletionService.getPercentage.resolves(25);
          SnapshotService.create.resolves({});
          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(SnapshotService.create);
            sinon.assert.calledWith(SnapshotService.create, {
              organizationId: request.payload.data.relationships.organization.data.id,
              completionPercentage: 25,
              profile: serializedUserProfile
            });
          });
        });

        it('should call Snapshot serializer', () => {
          // given
          authorizationToken.verify.resolves({});
          UserRepository.findUserById.resolves({});
          OrganizationRepository.isOrganizationIdExist.resolves(true);
          profileService.getByUserId.resolves({});
          profileSerializer.serialize.returns(serializedUserProfile);
          ProfileCompletionService.getPercentage.resolves(25);
          SnapshotService.create.resolves(2);
          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(snapshotSerializer.serialize);
            sinon.assert.calledWith(snapshotSerializer.serialize, {
              id: 2
            });
          });
        });

      });

      describe('When all things is ok', () => {

        it('should persist a new Snapshot', () => {
          // given
          authorizationToken.verify.resolves('user_id');
          UserRepository.findUserById.resolves(user);
          OrganizationRepository.isOrganizationIdExist.resolves(true);
          profileService.getByUserId.resolves({});
          profileSerializer.serialize.returns(serializedUserProfile);
          ProfileCompletionService.getPercentage.resolves(25);
          const expectedSnapshotDetails = {
            organizationId: request.payload.data.relationships.organization.data.id,
            completionPercentage: 25,
            profile: serializedUserProfile
          };
          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(SnapshotService.create, expectedSnapshotDetails);
            sinon.assert.calledWith(codeSpy, 201);
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
          authorizationToken.verify.resolves('user_id');
          UserRepository.findUserById.rejects(new NotFoundError());
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
          authorizationToken.verify.resolves('user_id');
          UserRepository.findUserById.resolves({});
          OrganizationRepository.isOrganizationIdExist.resolves(false);

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
          authorizationToken.verify.resolves('user_id');
          UserRepository.findUserById.resolves({});
          OrganizationRepository.isOrganizationIdExist.resolves(true);
          profileService.getByUserId.resolves({});
          profileSerializer.serialize.returns(serializedUserProfile);
          SnapshotService.create.rejects(new Error());

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
          const error = new Error();
          authorizationToken.verify.resolves('user_id');
          UserRepository.findUserById.resolves({});
          OrganizationRepository.isOrganizationIdExist.resolves(true);
          profileService.getByUserId.resolves({});
          profileSerializer.serialize.returns(serializedUserProfile);
          ProfileCompletionService.getPercentage.resolves(25);
          SnapshotService.create.rejects(error);

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
