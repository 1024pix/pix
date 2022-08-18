const { expect, sinon, hFake } = require('../../../test-helper');
const targetProfileController = require('../../../../lib/application/target-profiles/target-profile-controller');
const usecases = require('../../../../lib/domain/usecases');
const targetProfileAttachOrganizationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/target-profile-attach-organization-serializer');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

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
              description: 'description changée',
              comment: 'commentaire changée',
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
        });
      });
    });
  });

  describe('#attachOrganizations', function () {
    let request;

    beforeEach(function () {
      sinon.stub(usecases, 'attachOrganizationsToTargetProfile');
      sinon.stub(targetProfileAttachOrganizationSerializer, 'serialize');

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

        const response = await targetProfileController.attachOrganizations(request, hFake);
        // then
        expect(targetProfileAttachOrganizationSerializer.serialize).to.have.been.called;
        expect(response.statusCode).to.equal(200);
        expect(response.source).to.equal(serializer);
      });

      it('should call usecase', async function () {
        // when
        await targetProfileController.attachOrganizations(request, hFake);

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
});
