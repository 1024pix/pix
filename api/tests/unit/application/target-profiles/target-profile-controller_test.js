import { targetProfileController } from '../../../../lib/application/target-profiles/target-profile-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { usecases as devcompUsecases } from '../../../../src/devcomp/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | target-profile-controller', function () {
  describe('#createTargetProfile', function () {
    it('should succeed', async function () {
      // given
      const domainTransaction = Symbol('domainTr');
      sinon.stub(usecases, 'createTargetProfile');
      const targetProfileCreationCommand = {
        name: 'targetProfileName',
        category: 'OTHER',
        description: 'coucou maman',
        comment: 'coucou papa',
        isPublic: false,
        imageUrl: 'http://some/image.ok',
        ownerOrganizationId: null,
        tubes: [{ id: 'recTube1', level: '5' }],
      };
      sinon.stub(DomainTransaction, 'execute').callsFake(() => {
        return usecases.createTargetProfile({
          targetProfileCreationCommand,
          domainTransaction,
        });
      });
      usecases.createTargetProfile.withArgs({ targetProfileCreationCommand, domainTransaction }).resolves(123);
      const request = {
        payload: {
          data: {
            attributes: {
              name: 'targetProfileName',
              category: 'OTHER',
              description: 'coucou maman',
              comment: 'coucou papa',
              'is-public': false,
              'image-url': 'http://some/image.ok',
              'owner-organization-id': null,
              tubes: [{ id: 'recTube1', level: '5' }],
            },
          },
        },
      };

      // when
      const response = await targetProfileController.createTargetProfile(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: {
          type: 'target-profiles',
          id: '123',
        },
      });
    });
  });

  describe('#updateTargetProfile', function () {
    context('successful case', function () {
      it('should succeed', async function () {
        // given
        const payload = Symbol('some payload');

        const request = {
          params: {
            id: 123,
          },
          payload,
        };

        const attributesToUpdate = Symbol('deserialized attributes to update');

        const dependencies = {
          usecases: {
            updateTargetProfile: sinon.stub(),
          },
          targetProfileSerializer: {
            deserialize: sinon.stub().returns(attributesToUpdate),
          },
        };

        const domainTransaction = Symbol('domain transaction');
        sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

        // when
        const response = await targetProfileController.updateTargetProfile(request, hFake, dependencies);

        // then
        expect(response.statusCode).to.equal(204);
        expect(dependencies.targetProfileSerializer.deserialize).to.have.been.calledOnceWith(payload);
        expect(dependencies.usecases.updateTargetProfile).to.have.been.calledOnceWithExactly({
          id: request.params.id,
          attributesToUpdate,
          domainTransaction,
        });
      });
    });
  });

  describe('#findPaginatedTrainings', function () {
    it('should return trainings summaries', async function () {
      // given
      const targetProfileId = 123;
      const expectedResult = Symbol('serialized-training-summaries');
      const trainingSummaries = Symbol('trainingSummaries');
      const meta = Symbol('meta');
      const useCaseParameters = {
        targetProfileId,
        page: { size: 2, number: 1 },
      };

      sinon.stub(devcompUsecases, 'findPaginatedTargetProfileTrainingSummaries').resolves({
        trainings: trainingSummaries,
        meta,
      });

      const trainingSummarySerializer = {
        serialize: sinon.stub(),
      };
      trainingSummarySerializer.serialize.withArgs(trainingSummaries, meta).returns(expectedResult);

      const queryParamsUtils = {
        extractParameters: sinon.stub().returns(useCaseParameters),
      };

      // when
      const response = await targetProfileController.findPaginatedTrainings(
        {
          params: {
            id: targetProfileId,
            page: { size: 2, number: 1 },
          },
        },
        hFake,
        { trainingSummarySerializer, queryParamsUtils },
      );

      // then
      expect(devcompUsecases.findPaginatedTargetProfileTrainingSummaries).to.have.been.calledWithExactly(
        useCaseParameters,
      );
      expect(queryParamsUtils.extractParameters).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });

  describe('#getTargetProfileForAdmin', function () {
    it('should return targetProfileForAdmin', async function () {
      // given
      const targetProfileId = 123;
      const expectedResult = Symbol('serialized-target-profile-for-admin');
      const targetProfile = Symbol('targetProfileForAdmin');

      const expectedFilter = Symbol('filter');
      const extractedParams = {
        filter: expectedFilter,
      };
      const request = {
        'filter[badges]': 'certifiable',
        params: {
          id: targetProfileId,
        },
      };

      const queryParamsUtils = { extractParameters: sinon.stub() };
      const targetProfileForAdminSerializer = {
        serialize: sinon.stub(),
      };
      const dependencies = {
        queryParamsUtils,
        targetProfileForAdminSerializer,
      };

      dependencies.queryParamsUtils.extractParameters.withArgs(request.query).returns(extractedParams);

      sinon.stub(usecases, 'getTargetProfileForAdmin');
      usecases.getTargetProfileForAdmin.withArgs({ targetProfileId }).resolves(targetProfile);
      targetProfileForAdminSerializer.serialize
        .withArgs({ targetProfile, filter: expectedFilter })
        .returns(expectedResult);

      // when
      const response = await targetProfileController.getTargetProfileForAdmin(request, hFake, dependencies);

      // then
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
