const { sinon, hFake, expect } = require('../../../test-helper');
const profileService = require('../../../../lib/domain/services/profile-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const snapshotService = require('../../../../lib/domain/services/snapshot-service');
const profileCompletionService = require('../../../../lib/domain/services/profile-completion-service');
const snapshotController = require('../../../../lib/application/snapshots/snapshot-controller');
const authorizationToken = require('../../../../lib/infrastructure/validators/jsonwebtoken-verify');
const JSONAPIError = require('jsonapi-serializer').Error;
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const profileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const snapshotSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const logger = require('../../../../lib/infrastructure/logger');
const usecases = require('../../../../lib/domain/usecases');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
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

    describe('Behavior', () => {

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
        sinon.stub(logger, 'error');
      });

      describe('Test collaboration', function() {

        it('should verify that user is well authenticated / authorized', async () => {
          // given
          authorizationToken.verify.resolves();

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledOnce(authorizationToken.verify);
          sinon.assert.calledWith(authorizationToken.verify, 'valid_token');
        });

        it('should fetch the user', async () => {
          // given
          authorizationToken.verify.resolves(USER_ID);
          userRepository.findUserById.resolves();

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledOnce(userRepository.findUserById);
          sinon.assert.calledWith(userRepository.findUserById, USER_ID);
        });

        it('should deserialize the request payload', async () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves();

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledOnce(snapshotSerializer.deserialize);
          sinon.assert.calledWith(snapshotSerializer.deserialize, request.payload);
        });

        it('should verify that the organization exists', async () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves();
          snapshotSerializer.deserialize.resolves(deserializedSnapshot);

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledOnce(organizationRepository.isOrganizationIdExist);
          sinon.assert.calledWith(organizationRepository.isOrganizationIdExist, 3);
        });

        it('should retrieve profile for user', async () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves(deserializedSnapshot);
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledOnce(profileService.getByUserId);
          sinon.assert.calledWith(profileService.getByUserId, USER_ID);
        });

        it('should serialize profile in JSON in order to be saved in DB', async () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves(deserializedSnapshot);
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });
          profileService.getByUserId.resolves({ profile: 'a_valid_profile' });

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledOnce(profileSerializer.serialize);
          sinon.assert.calledWith(profileSerializer.serialize, { profile: 'a_valid_profile' });
        });

        it('should calculate profile completion in percentage', async () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves(deserializedSnapshot);
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });
          profileService.getByUserId.resolves();
          profileSerializer.serialize.resolves({ profile: 'a_valid_profile' });

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledOnce(profileCompletionService.getNumberOfFinishedTests);
          sinon.assert.calledWith(profileCompletionService.getNumberOfFinishedTests, { profile: 'a_valid_profile' });
        });

        it('should create & save a Snapshot entity into the repository', async () => {
          // given
          const serializedProfile = { profile: 'a_valid_profile' };

          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves(deserializedSnapshot);
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });
          profileService.getByUserId.resolves();
          profileSerializer.serialize.resolves(serializedProfile);
          profileCompletionService.getNumberOfFinishedTests.resolves();

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledOnce(snapshotService.create);
          sinon.assert.calledWith(snapshotService.create, deserializedSnapshot, user, serializedProfile);
        });

        it('should serialize the response payload', async () => {
          // given
          const serializedProfile = { profile: 'a_valid_profile' };

          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves(user);
          snapshotSerializer.deserialize.resolves(deserializedSnapshot);
          organizationRepository.isOrganizationIdExist.resolves({ organization: 'a_valid_organization' });
          profileService.getByUserId.resolves();
          profileSerializer.serialize.resolves(serializedProfile);
          profileCompletionService.getNumberOfFinishedTests.resolves();
          snapshotService.create.resolves(SNAPSHOT_ID);

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledOnce(snapshotSerializer.serialize);
          sinon.assert.calledWith(snapshotSerializer.serialize, { id: SNAPSHOT_ID });
        });

      });

      describe('Errors cases', () => {

        it('should return a specific error JsonApi, when token is invalid', async () => {
          // given
          authorizationToken.verify.rejects(new InvalidTokenError());
          const exepectedErr = new JSONAPIError({
            code: '401',
            title: 'Unauthorized',
            detail: 'Le token n’est pas valide'
          });

          // when
          const response = await snapshotController.create(request, hFake);

          // then
          expect(response.source).to.deep.equal(exepectedErr);
        });

        it('should return a specific error JsonApi, when user is not found', async () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.rejects(new NotFoundError());
          const exepectedErr = new JSONAPIError({
            code: '422',
            title: 'Unprocessable entity',
            detail: 'Cet utilisateur est introuvable'
          });

          // when
          const response = await snapshotController.create(request, hFake);

          // then
          expect(response.source).to.deep.equal(exepectedErr);
        });

        it('should return a specific error JsonApi, when organisation is not found', async () => {
          // given
          deserializedSnapshot.organization = { id: 'unknnown_organization_id' };

          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves();
          snapshotSerializer.deserialize.resolves(deserializedSnapshot);
          organizationRepository.isOrganizationIdExist.resolves(false);

          const exepectedErr = new JSONAPIError({
            code: '422',
            title: 'Unprocessable entity',
            detail: 'Cette organisation n’existe pas'
          });

          // when
          const response = await snapshotController.create(request, hFake);

          // then
          expect(response.source).to.deep.equal(exepectedErr);
        });

        it('should return a specific error JsonApi, when snapshot saving fails', async () => {
          // given
          authorizationToken.verify.resolves();
          userRepository.findUserById.resolves();
          organizationRepository.isOrganizationIdExist.resolves();
          profileService.getByUserId.resolves();
          profileSerializer.serialize.resolves();
          snapshotService.create.rejects(new Error());

          const exepectedErr = new JSONAPIError({
            code: '500',
            title: 'Internal Server Error',
            detail: 'Une erreur est survenue lors de la création de l’instantané'
          });

          // when
          const response = await snapshotController.create(request, hFake);

          // then
          expect(response.source).to.deep.equal(exepectedErr);
        });

        it('should log an error, when unknown error has occured', async () => {
          // given
          const error = new Error('Another error');
          authorizationToken.verify.rejects(error);

          // when
          await snapshotController.create(request, hFake);

          // then
          sinon.assert.calledWith(logger.error, error);
        });

      });
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

    it('should returns the snapshots with pagination', async () => {
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
