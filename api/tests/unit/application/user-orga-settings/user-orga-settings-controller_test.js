const { sinon, expect, hFake, catchErr } = require('../../../test-helper');

const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
const User = require('../../../../lib/domain/models/User');
const Organization = require('../../../../lib/domain/models/Organization');

const { UserNotAuthorizedToCreateResourceError } = require('../../../../lib/domain/errors');

const userOrgaSettingsController = require('../../../../lib/application/user-orga-settings/user-orga-settings-controller');

const usecases = require('../../../../lib/domain/usecases');

const userOrgaSettingsSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-orga-settings-serializer');

describe('Unit | Controller | user-orga-settings-controller', () => {

  describe('#create', () => {
    const userId = 123;
    const organizationId = 234;

    const userOrgaSettings = new UserOrgaSettings({ user: new User({ id: userId }), organization: new Organization({ id: organizationId }) });

    let request;

    beforeEach(() => {
      request = {
        auth: { credentials: { userId } },
        payload: {
          data: {
            relationships: {
              organization: {
                data: {
                  id: organizationId,
                  type: 'organizations'
                }
              },
              user: {
                data: {
                  id: userId,
                  type: 'users'
                }
              }
            },
          },
        },
      };

      sinon.stub(userOrgaSettingsSerializer, 'serialize');
      sinon.stub(usecases, 'createUserOrgaSettings');
    });

    describe('when request is valid', () => {

      beforeEach(() => {
        usecases.createUserOrgaSettings.resolves(userOrgaSettings);
      });

      it('should return a serialized user and a 201 status code', async () => {
        // given
        const expectedSerializedUserOrgaSettings = { message: 'serialized user' };
        userOrgaSettingsSerializer.serialize.returns(expectedSerializedUserOrgaSettings);

        // when
        const response = await userOrgaSettingsController.create(request, hFake);

        // then
        expect(userOrgaSettingsSerializer.serialize).to.have.been.calledWith(userOrgaSettings);
        expect(response.source).to.deep.equal(expectedSerializedUserOrgaSettings);
        expect(response.statusCode).to.equal(201);
      });

      it('should call the user orga settings creation usecase', async () => {
        // when
        await userOrgaSettingsController.create(request, hFake);

        // then
        expect(usecases.createUserOrgaSettings).to.have.been.calledWith({ userId, organizationId });
      });
    });

    describe('when request in not valid', function() {

      it('should throw a UserNotAuthorizedToCreateResourceError when payload user and connected user are not the same', async () => {
        // given
        request.auth.credentials.userId = 321;

        // when
        const error = await catchErr(userOrgaSettingsController.create)(request, hFake);

        // then
        expect(error).to.be.instanceof(UserNotAuthorizedToCreateResourceError);
      });
    });
  });

  describe('#update', () => {

    const userId = 7;
    const organizationId = 2;
    const request = {
      auth: { credentials: { userId } },
      payload: {
        data: {
          relationships: {
            organization: {
              data: {
                id: organizationId,
                type: 'organizations'
              }
            }
          }
        }
      }
    };

    const serializedUseOrgaSettings = {
      data: {
        type: 'user-orga-settings',
        id: 1,
        attributes: {},
        relationships: {
          organization: {
            data: {
              type: 'organizations',
              id: organizationId,
            },
          },
          user: {
            data: {
              type: 'users',
              id: userId,
            },
          },
        },
      },
    };

    let expectedUserOrgaSettings;
    let response;

    beforeEach(async () => {
      sinon.stub(usecases, 'updateUserOrgaSettings');
      sinon.stub(userOrgaSettingsSerializer, 'serialize');

      expectedUserOrgaSettings = { id: 1, user: { id: userId }, organization: { id: organizationId } };
      usecases.updateUserOrgaSettings.resolves(expectedUserOrgaSettings);
      userOrgaSettingsSerializer.serialize.resolves(serializedUseOrgaSettings);

      response = await userOrgaSettingsController.update(request);
    });

    it('should call the usecase to update the userOrgaSetting', async () => {
      // then
      expect(usecases.updateUserOrgaSettings).to.have.been.calledWith({ userId, organizationId });
    });

    it('should serialize the userOrgaSettings', () => {
      // then
      expect(userOrgaSettingsSerializer.serialize).to.have.been.calledWith(expectedUserOrgaSettings);
    });

    it('should return the serialized userOrgaSettings', () => {
      // then
      expect(response).to.deep.equal(serializedUseOrgaSettings);
    });
  });

  describe('#createOrUpdate', () => {

    const userId = 7;
    const organizationId = 2;
    const request = {
      auth: { credentials: { userId } },
      params: {
        id: userId
      },
      payload: {
        data: {
          relationships: {
            organization: {
              data: {
                id: organizationId,
                type: 'organizations'
              }
            }
          }
        }
      }
    };

    const serializedUseOrgaSettings = {
      data: {
        type: 'user-orga-settings',
        id: 1,
        attributes: {},
        relationships: {
          organization: {
            data: {
              type: 'organizations',
              id: organizationId,
            },
          },
          user: {
            data: {
              type: 'users',
              id: userId,
            },
          },
        },
      },
    };

    let expectedUserOrgaSettings;
    let response;

    beforeEach(async () => {
      sinon.stub(usecases, 'createOrUpdateUserOrgaSettings');
      sinon.stub(userOrgaSettingsSerializer, 'serialize');

      expectedUserOrgaSettings = { id: 1, user: { id: userId }, organization: { id: organizationId } };
      usecases.createOrUpdateUserOrgaSettings.resolves(expectedUserOrgaSettings);
      userOrgaSettingsSerializer.serialize.resolves(serializedUseOrgaSettings);

      response = await userOrgaSettingsController.createOrUpdate(request);
    });

    it('should call the usecase to update the userOrgaSetting', async () => {
      // then
      expect(usecases.createOrUpdateUserOrgaSettings).to.have.been.calledWith({ userId, organizationId });
    });

    it('should serialize the userOrgaSettings', () => {
      // then
      expect(userOrgaSettingsSerializer.serialize).to.have.been.calledWith(expectedUserOrgaSettings);
    });

    it('should return the serialized userOrgaSettings', () => {
      // then
      expect(response).to.deep.equal(serializedUseOrgaSettings);
    });
  });
});
