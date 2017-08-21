const { describe, it, expect, sinon, beforeEach, afterEach } = require('../../../test-helper');
const profileService = require('../../../../lib/domain/services/profile-service');
const UserRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const SnapshotRepository = require('../../../../lib/infrastructure/repositories/snapshot-repository');
const snapshotController = require('../../../../lib/application/snapshots/snapshot-controller');
const authorizationToken = require('../../../../lib/infrastructure/validators/jsonwebtoken-verify');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const { InvalidTokenError, NotFoundError } = require('../../../../lib/domain/errors');

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

describe.skip('Unit | Controller | snapshotController', () => {

  describe('#Create', () => {

    let sandbox;
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

    it('should be able to reply', () => {
      // given
      const replyStub = sinon.stub().returns({
        code: () => {
        }
      });

      // when
      snapshotController.create(null, replyStub);

      // then
      sinon.assert.calledOnce(replyStub);
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
      const request = {
        headers: {
          authorization: 'valid_token'
        },
        payload: {}
      };

      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(authorizationToken, 'verify');
        sandbox.stub(UserRepository, 'findUserById');
        sandbox.stub(profileService, 'getByUserId');
        sandbox.stub(SnapshotRepository, 'save');
      });

      afterEach(() => {
        sandbox.restore();
      });

      describe('When user token is valid', () => {

        it('should persist a new Snapshot', () => {
          // given
          authorizationToken.verify.resolves('user_id');
          UserRepository.findUserById.resolves({});
          profileService.getByUserId.resolves(serializedUserProfile);

          // when
          const promise = snapshotController.create(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(SnapshotRepository.save, serializedUserProfile);
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

        it('should return an error, when snapshot saving fails', () => {
          // given
          authorizationToken.verify.resolves('user_id');
          UserRepository.findUserById.resolves({});
          profileService.getByUserId.resolves(serializedUserProfile);
          SnapshotRepository.save.rejects();
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

      });
    });

  });
});
