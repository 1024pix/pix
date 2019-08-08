const { sinon, hFake, expect } = require('../../../test-helper');
const profileService = require('../../../../lib/domain/services/profile-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const snapshotService = require('../../../../lib/domain/services/snapshot-service');
const profileCompletionService = require('../../../../lib/domain/services/profile-completion-service');
const snapshotController = require('../../../../lib/application/snapshots/snapshot-controller');
const authorizationToken = require('../../../../lib/infrastructure/validators/jsonwebtoken-verify');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const profileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const snapshotSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const usecases = require('../../../../lib/domain/usecases');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');

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
          attributes: {
            'student-code': 'Code Etudiant',
            'campaign-code': 'Code Campagne'
          },
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

    const deserializedSnapshot = {
      studentCode: 'Code Etudiant',
      campaignCode: 'Code Campagne',
      organization: { id: ORGANIZATION_ID }
    };

    const serializedProfile = { profile: 'a_valid_profile' };

    beforeEach(() => {
      sinon.stub(authorizationToken, 'verify');
      sinon.stub(userRepository, 'findUserById');
      sinon.stub(snapshotSerializer, 'deserialize');
      sinon.stub(profileService, 'getByUserId');
      sinon.stub(organizationRepository, 'isOrganizationIdExist');
      sinon.stub(snapshotService, 'create');
      sinon.stub(profileSerializer, 'serialize');
      sinon.stub(profileCompletionService, 'getNumberOfFinishedTests');
      sinon.stub(snapshotSerializer, 'serialize');
    });

    it('should create the snapshot', async () => {
      // given
      authorizationToken.verify.resolves(USER_ID);
      userRepository.findUserById.resolves(user);
      snapshotSerializer.deserialize.resolves(deserializedSnapshot);
      organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });
      profileService.getByUserId.resolves(serializedProfile);
      profileSerializer.serialize.resolves(serializedProfile);
      profileCompletionService.getNumberOfFinishedTests.resolves();
      snapshotService.create.resolves(SNAPSHOT_ID);

      // when
      await snapshotController.create(request, hFake);

      // then
      sinon.assert.calledWith(authorizationToken.verify, 'valid_token');
      sinon.assert.calledWith(userRepository.findUserById, USER_ID);
      sinon.assert.calledWith(snapshotSerializer.deserialize, request.payload);
      sinon.assert.calledWith(organizationRepository.isOrganizationIdExist, 3);
      sinon.assert.calledWith(profileService.getByUserId, USER_ID);
      sinon.assert.calledWith(profileSerializer.serialize, { profile: 'a_valid_profile' });
      sinon.assert.calledWith(profileCompletionService.getNumberOfFinishedTests, { profile: 'a_valid_profile' });
      sinon.assert.calledWith(snapshotService.create, deserializedSnapshot, user, serializedProfile);
      sinon.assert.calledWith(snapshotSerializer.serialize, { id: SNAPSHOT_ID });
    });
  });

  describe('#find ', () => {
    let query, request, result, options, serialized;

    beforeEach(() => {
      query = {
        'filter[organizationId]': 1,
      };
      request = { query };
      options = { organizationId: 1 };
      result = {
        models: [{ id: 1 }, { id: 2 }],
        pagination: {},
      };
      serialized = {
        snapshots: [{ id: 1 }, { id: 2 }],
        meta: {},
      };

      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'findSnapshots');
      sinon.stub(snapshotSerializer, 'serialize');
    });

    it('should return the snapshots with pagination', async () => {
      // given
      queryParamsUtils.extractParameters.withArgs(query).returns(options);
      usecases.findSnapshots.withArgs({ options }).resolves(result);
      snapshotSerializer.serialize.withArgs(result.models, result.pagination).returns(serialized);

      // when
      const response = await snapshotController.find(request);

      // then
      expect(response).to.deep.equal(serialized);
    });

  });
});
