const { sinon, expect } = require('../../../test-helper');

const userOrgaSettingsController = require('../../../../lib/application/user-orga-settings/user-orga-settings-controller');

const usecases = require('../../../../lib/domain/usecases');

const userOrgaSettingsSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-orga-settings-serializer');

describe('Unit | Controller | user-orga-settings-controller', () => {

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
