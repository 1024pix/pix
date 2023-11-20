import { expect, hFake, sinon } from '../../../test-helper.js';
import { targetProfileController } from '../../../../lib/application/target-profiles/target-profile-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';

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
    let request;

    beforeEach(function () {
      sinon.stub(usecases, 'updateTargetProfile');

      request = {
        params: {
          id: 123,
        },
        payload: {
          data: {
            attributes: {
              name: 'Pixer123',
              'are-knowledge-elements-resettable': false,
              description: 'description changée',
              comment: 'commentaire changée',
              'image-url': 'image changée',
            },
          },
        },
      };
    });

    context('successful case', function () {
      it('should succeed', async function () {
        // when
        const response = await targetProfileController.updateTargetProfile(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
        expect(usecases.updateTargetProfile).to.have.been.calledOnce;
        expect(usecases.updateTargetProfile).to.have.been.calledWithMatch({
          id: 123,
          name: 'Pixer123',
          description: 'description changée',
          comment: 'commentaire changée',
          imageUrl: 'image changée',
          areKnowledgeElementsResettable: false,
        });
      });
    });
  });

  describe('#attachOrganizations', function () {
    let request;
    let targetProfileAttachOrganizationSerializer;

    beforeEach(function () {
      sinon.stub(usecases, 'attachOrganizationsToTargetProfile');
      targetProfileAttachOrganizationSerializer = { serialize: sinon.stub() };

      request = {
        params: {
          id: 123,
        },
        payload: {
          'organization-ids': 1,
        },
      };
    });

    context('successful case', function () {
      it('should succeed', async function () {
        // when
        const serializer = Symbol('targetProfileAttachOrganizationsSerializer');
        usecases.attachOrganizationsToTargetProfile.resolves();
        targetProfileAttachOrganizationSerializer.serialize.returns(serializer);

        const response = await targetProfileController.attachOrganizations(request, hFake, {
          targetProfileAttachOrganizationSerializer,
        });
        // then
        expect(targetProfileAttachOrganizationSerializer.serialize).to.have.been.called;
        expect(response.statusCode).to.equal(200);
        expect(response.source).to.equal(serializer);
      });

      it('should call usecase', async function () {
        // when
        await targetProfileController.attachOrganizations(request, hFake, {
          targetProfileAttachOrganizationSerializer,
        });

        // then
        expect(usecases.attachOrganizationsToTargetProfile).to.have.been.calledOnce;
        expect(usecases.attachOrganizationsToTargetProfile).to.have.been.calledWithMatch({
          targetProfileId: 123,
          organizationIds: 1,
        });
      });
    });
  });

  describe('#attachOrganizationsFromExistingTargetProfile', function () {
    let request;

    beforeEach(function () {
      sinon.stub(usecases, 'attachOrganizationsFromExistingTargetProfile');

      request = {
        params: {
          id: 123,
        },
        payload: {
          'target-profile-id': 1,
        },
      };
    });

    context('successful case', function () {
      it('should succeed', async function () {
        // when
        const response = await targetProfileController.attachOrganizationsFromExistingTargetProfile(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should call usecase', async function () {
        // when
        await targetProfileController.attachOrganizationsFromExistingTargetProfile(request, hFake);

        // then
        expect(usecases.attachOrganizationsFromExistingTargetProfile).to.have.been.calledOnce;
        expect(usecases.attachOrganizationsFromExistingTargetProfile).to.have.been.calledWithMatch({
          targetProfileId: 123,
          existingTargetProfileId: 1,
        });
      });
    });
  });

  describe('#outdateTargetProfile', function () {
    let request;

    beforeEach(function () {
      sinon.stub(usecases, 'outdateTargetProfile');

      request = {
        params: {
          id: 123,
        },
      };
    });

    context('successful case', function () {
      it('should succeed', async function () {
        // when
        const response = await targetProfileController.outdateTargetProfile(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should outdate target profile', async function () {
        // when
        await targetProfileController.outdateTargetProfile(request, hFake);

        // then
        expect(usecases.outdateTargetProfile).to.have.been.calledWithMatch({ id: 123 });
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

      sinon.stub(usecases, 'findPaginatedTargetProfileTrainingSummaries').resolves({
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
      expect(usecases.findPaginatedTargetProfileTrainingSummaries).to.have.been.calledWithExactly(useCaseParameters);
      expect(queryParamsUtils.extractParameters).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });

  describe('#getTargetProfileForAdmin', function () {
    it('should return targetProfileForAdmin', async function () {
      // given
      const targetProfileId = 123;
      const expectedResult = Symbol('serialized-target-profile-for-admin');
      const targetProfileForAdmin = Symbol('targetProfileForAdmin');
      const useCaseParameters = {
        targetProfileId,
      };

      sinon.stub(usecases, 'getTargetProfileForAdmin').withArgs(useCaseParameters).resolves(targetProfileForAdmin);

      const targetProfileForAdminSerializer = {
        serialize: sinon.stub(),
      };
      targetProfileForAdminSerializer.serialize.withArgs(targetProfileForAdmin).returns(expectedResult);

      // when
      const response = await targetProfileController.getTargetProfileForAdmin(
        {
          params: {
            id: targetProfileId,
          },
        },
        hFake,
        { targetProfileForAdminSerializer },
      );

      // then
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
