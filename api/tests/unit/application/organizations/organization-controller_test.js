const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');
const JSONAPIError = require('jsonapi-serializer').Error;

const BookshelfSnapshot = require('../../../../lib/infrastructure/data/snapshot');
const Organization = require('../../../../lib/domain/models/Organization');
const organizationController = require('../../../../lib/application/organizations/organization-controller');
const snapshotRepository = require('../../../../lib/infrastructure/repositories/snapshot-repository');
const organizationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');
const organizationService = require('../../../../lib/domain/services/organization-service');
const snapshotSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const bookshelfUtils = require('../../../../lib/infrastructure/utils/bookshelf-utils');
const { EntityValidationError, NotFoundError } = require('../../../../lib/domain/errors');
const { InfrastructureError } = require('../../../../lib/infrastructure/errors');
const logger = require('../../../../lib/infrastructure/logger');
const usecases = require('../../../../lib/domain/usecases');
const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const targetProfileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/target-profile-serializer');

describe('Unit | Application | Organizations | organization-controller', () => {

  let sandbox;
  let request;

  describe('#getOrganizationDetails', () => {

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(usecases, 'getOrganizationDetails');
      sandbox.stub(organizationSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call the usecase and serialize the response', async () => {
      // given
      const organizationId = 1234;
      request = { params: { id: organizationId } };

      usecases.getOrganizationDetails.resolves();
      organizationSerializer.serialize.returns();

      // when
      await organizationController.getOrganizationDetails(request, hFake);

      // then
      expect(usecases.getOrganizationDetails).to.have.been.calledOnce;
      expect(usecases.getOrganizationDetails).to.have.been.calledWith({ organizationId });
      expect(organizationSerializer.serialize).to.have.been.calledOnce;
    });
  });

  describe('#create', () => {

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      sandbox.stub(usecases, 'createOrganization');
      sandbox.stub(organizationSerializer, 'serialize');

      request = {
        payload: {
          data: {
            attributes: {
              name: 'Acme',
              type: 'PRO',
            }
          }
        }
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('successful case', () => {

      let savedOrganization;
      let serializedOrganization;

      beforeEach(() => {
        savedOrganization = domainBuilder.buildOrganization();
        serializedOrganization = { foo: 'bar' };

        usecases.createOrganization.resolves(savedOrganization);
        organizationSerializer.serialize.withArgs(savedOrganization).returns(serializedOrganization);
      });

      it('should create an organization', async () => {
        // when
        await organizationController.create(request, hFake);

        // then
        expect(usecases.createOrganization).to.have.been.calledOnce;
        expect(usecases.createOrganization).to.have.been.calledWith({ name: 'Acme', type: 'PRO' });
      });

      it('should serialized organization into JSON:API', async () => {
        // when
        await organizationController.create(request, hFake);

        // then
        expect(organizationSerializer.serialize).to.have.been.calledOnce;
        expect(organizationSerializer.serialize).to.have.been.calledWith(savedOrganization);
      });

      it('should return the serialized organization', async () => {
        // when
        const response = await organizationController.create(request, hFake);

        // then
        expect(response.source).to.deep.equal(serializedOrganization);
      });
    });

    context('error cases', () => {

      let error;

      context('when an input params validation error occurred', () => {

        beforeEach(() => {
          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [
              {
                attribute: 'name',
                message: 'Le nom n’est pas renseigné.',
              },
              {
                attribute: 'type',
                message: 'Le type n’est pas renseigné.',
              },
            ]
          });

          error = new EntityValidationError(expectedValidationError);
          usecases.createOrganization.rejects(error);
        });

        it('should return an error with HTTP status code 422 when a validation error occurred', async () => {
          // given
          const jsonApiValidationErrors = {
            errors: [
              {
                status: '422',
                source: { 'pointer': '/data/attributes/name' },
                title: 'Invalid data attribute "name"',
                detail: 'Le nom n’est pas renseigné.'
              },
              {
                status: '422',
                source: { 'pointer': '/data/attributes/type' },
                title: 'Invalid data attribute "type"',
                detail: 'Le type n’est pas renseigné.'
              }
            ]
          };

          // when
          const response = await organizationController.create(request, hFake);

          // then
          expect(response.statusCode).to.equal(422);
          expect(response.source).to.deep.equal(jsonApiValidationErrors);
        });
      });

      context('when a treatment error occurred (other than validation)', () => {

        beforeEach(() => {
          error = new InfrastructureError('Une erreur est survenue lors de la création de l’organisation');
          usecases.createOrganization.rejects(error);
        });

        it('should return an error with HTTP status code 500', async () => {
          // when
          const response = await organizationController.create(request, hFake);

          // then
          expect(response.statusCode).to.equal(500);
        });
      });
    });
  });

  describe('#search', () => {

    let sandbox;
    const arrayOfSerializedOrganization = [{ code: 'AAA111' }, { code: 'BBB222' }];
    const arrayOfOrganizations = [new Organization({ code: 'AAA111' }), new Organization({ code: 'BBB222' })];

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      sandbox.stub(logger, 'error');
      sandbox.stub(organizationService, 'search').resolves(arrayOfOrganizations);
      sandbox.stub(organizationSerializer, 'serialize').returns(arrayOfSerializedOrganization);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should retrieve organizations with one filter', async () => {
      // given
      const userId = 1234;
      const request = {
        auth: { credentials: { userId: 1234 } },
        query: { 'filter[query]': 'my search' }
      };

      // when
      await organizationController.search(request, hFake);

      // then
      sinon.assert.calledWith(organizationService.search, userId, { query: 'my search' });
    });

    it('should retrieve organizations with two different filters', async () => {
      // given
      const userId = 1234;
      const request = {
        auth: { credentials: { userId } },
        query: {
          'filter[query]': 'my search',
          'filter[code]': 'with params'
        }
      };

      // when
      await organizationController.search(request, hFake);

      // then
      sinon.assert.calledWith(organizationService.search, userId, { query: 'my search', code: 'with params' });
    });

    it('should reply 500 and log while getting data is on error', async () => {
      // given
      const error = new Error('Fail');
      organizationService.search.rejects(error);
      const request = {
        auth: { credentials: { userId: 1234 } },
        query: { 'filter[first]': 'with params' }
      };

      // when
      const promise = organizationController.search(request, hFake);

      // then
      await expect(promise).to.be.rejectedWith('Fail');
      sinon.assert.calledOnce(organizationService.search);
      sinon.assert.calledWith(logger.error, error);
    });

    it('should serialize results', async () => {
      // given
      const request = {
        auth: { credentials: { userId: 1234 } },
        query: { 'filter[first]': 'with params' }
      };

      // when
      const response = await organizationController.search(request, hFake);

      // then
      expect(response).to.deep.equal(arrayOfSerializedOrganization);
    });

  });

  describe('#getSharedProfiles', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(logger, 'error');
      sandbox.stub(snapshotRepository, 'getSnapshotsByOrganizationId');
      sandbox.stub(snapshotSerializer, 'serialize');
      sandbox.stub(validationErrorSerializer, 'serialize');
      sandbox.stub(bookshelfUtils, 'mergeModelWithRelationship');
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('Collaborations', () => {
      it('should call snapshot repository', async () => {
        // given
        snapshotRepository.getSnapshotsByOrganizationId.resolves();
        const request = {
          params: {
            id: 7
          }
        };

        // when
        await organizationController.getSharedProfiles(request, hFake);

        // then
        sinon.assert.calledOnce(snapshotRepository.getSnapshotsByOrganizationId);
        sinon.assert.calledWith(snapshotRepository.getSnapshotsByOrganizationId, 7);
      });

      it('should call snapshot serializer', async () => {
        // given
        const snapshots = [{
          toJSON: () => {
            return {};
          }
        }];
        snapshotRepository.getSnapshotsByOrganizationId.resolves({});
        bookshelfUtils.mergeModelWithRelationship.resolves(snapshots);
        const request = {
          params: {
            id: 7
          }
        };

        // when
        await organizationController.getSharedProfiles(request, hFake);

        // then
        sinon.assert.calledOnce(snapshotSerializer.serialize);
        sinon.assert.calledWith(snapshotSerializer.serialize, [{}]);
      });

      it('should return serialized snapshots', async () => {
        // then
        const snapshots = [];
        const serializedSnapshots = { data: [] };
        snapshotRepository.getSnapshotsByOrganizationId.resolves(snapshots);
        snapshotSerializer.serialize.returns(serializedSnapshots);
        bookshelfUtils.mergeModelWithRelationship.resolves(snapshots);
        const request = {
          params: {
            id: 7
          }
        };

        // when
        const response = await organizationController.getSharedProfiles(request, hFake);

        // then
        expect(response).to.deep.equal(serializedSnapshots);
      });

    });

    describe('Error cases', () => {

      it('should return an serialized NotFoundError, when no snapshot was found', async () => {
        // given
        const error = BookshelfSnapshot.NotFoundError;
        snapshotRepository.getSnapshotsByOrganizationId.rejects(error);
        const serializedError = { errors: [] };
        validationErrorSerializer.serialize.returns(serializedError);
        const request = {
          params: {
            id: 156778
          }
        };

        // when
        const response = await organizationController.getSharedProfiles(request, hFake);

        // then
        expect(response.source).to.deep.equal(serializedError);
        expect(response.statusCode).to.equal(500);
      });

      it('should log an error, when unknown error has occured', async () => {
        // given
        const error = new Error();
        snapshotRepository.getSnapshotsByOrganizationId.rejects(error);
        const serializedError = { errors: [] };
        validationErrorSerializer.serialize.returns(serializedError);
        const request = {
          params: {
            id: 156778
          }
        };

        // when
        await organizationController.getSharedProfiles(request, hFake);

        // then
        sinon.assert.calledOnce(logger.error);
      });

    });

  });

  describe('#exportSharedSnapshotsAsCsv', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'writeOrganizationSharedProfilesAsCsvToStream').resolves();
      sinon.stub(validationErrorSerializer, 'serialize');
    });

    afterEach(() => {
      usecases.writeOrganizationSharedProfilesAsCsvToStream.restore();
      validationErrorSerializer.serialize.restore();
    });

    it('should call the use case service that exports shared profile of an organization as CSV (and reply an HTTP response)', async () => {
      // given
      const request = {
        params: {
          id: 7
        }
      };

      // when
      const response = await organizationController.exportSharedSnapshotsAsCsv(request, hFake);

      // then
      expect(response.headers).to.deep.equal({
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': 'attachment; filename="Pix - Export donnees partagees.csv"'
      });
    });

    describe('Error cases', () => {

      it('should return a JSONAPI serialized NotFoundError, when expected organization does not exist', async () => {
        // given
        usecases.writeOrganizationSharedProfilesAsCsvToStream.rejects(NotFoundError);
        const serializedError = { errors: [] };
        validationErrorSerializer.serialize.returns(serializedError);
        const request = {
          params: {
            id: 'unexisting id'
          }
        };

        // when
        const response = await organizationController.exportSharedSnapshotsAsCsv(request, hFake);

        // then
        expect(response.source).to.deep.equal(serializedError);
        expect(response.statusCode).to.equal(500);
      });

      it('should log an error, when unknown error has occured', async () => {
        // given
        const error = new NotFoundError();
        usecases.writeOrganizationSharedProfilesAsCsvToStream.rejects(error);
        const serializedError = { errors: [] };
        validationErrorSerializer.serialize.returns(serializedError);
        const request = {
          params: {
            id: 'unexisting id'
          }
        };

        // when
        const response = await organizationController.exportSharedSnapshotsAsCsv(request, hFake);

        // then
        expect(response.source).to.deep.equal(serializedError);
        expect(response.statusCode).to.equal(500);
      });

    });

  });

  describe('#getCampaigns', () => {

    let sandbox;
    let organizationId;
    let request;
    let campaign;
    let serializedCampaigns;

    beforeEach(() => {
      organizationId = 1;
      request = {
        params: { id: organizationId },
        auth: {
          credentials: {
            userId: 1
          }
        }
      };
      campaign = domainBuilder.buildCampaign();
      serializedCampaigns = { data: [{ name: campaign.name, code: campaign.code }] };

      sandbox = sinon.createSandbox();
      sandbox.stub(usecases, 'getOrganizationCampaigns');
      sandbox.stub(campaignSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call the usecase to get the campaigns', async () => {
      // given
      usecases.getOrganizationCampaigns.resolves([campaign]);
      campaignSerializer.serialize.returns(serializedCampaigns);

      // when
      await organizationController.getCampaigns(request, hFake);

      // then
      expect(usecases.getOrganizationCampaigns).to.have.been.calledWith({ organizationId });
    });

    it('should return the serialized campaigns belonging to the organization', async () => {
      // given
      usecases.getOrganizationCampaigns.resolves([campaign]);
      campaignSerializer.serialize.returns(serializedCampaigns);

      // when
      const response = await organizationController.getCampaigns(request, hFake);

      // then
      expect(response.source).to.deep.equal(serializedCampaigns);
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 500 error when an error occurs', async () => {
      // given
      const errorMessage = 'Unexpected error';
      const expectedError = new JSONAPIError({
        code: '500',
        title: 'Internal Server Error',
        detail: errorMessage
      });

      usecases.getOrganizationCampaigns.rejects(new Error(errorMessage));

      // when
      const response = await organizationController.getCampaigns(request, hFake);

      // then
      expect(response.source).to.deep.equal(expectedError);
      expect(response.statusCode).to.equal(500);
    });
  });

  describe('#findTargetProfiles', () => {

    const connectedUserId = 1;
    const organizationId = '145';

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId }
      };
      sandbox.stub(organizationService, 'findAllTargetProfilesAvailableForOrganization').resolves();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call usecases with appropriated arguments', async () => {
      // when
      await organizationController.findTargetProfiles(request, hFake);

      // then
      expect(organizationService.findAllTargetProfilesAvailableForOrganization).to.have.been.calledOnce;
      expect(organizationService.findAllTargetProfilesAvailableForOrganization).to.have.been.calledWith(145);
    });

    context('success cases', () => {

      let foundTargetProfiles;

      beforeEach(() => {
        // given
        foundTargetProfiles = [domainBuilder.buildTargetProfile()];
        organizationService.findAllTargetProfilesAvailableForOrganization.resolves(foundTargetProfiles);
        sandbox.stub(targetProfileSerializer, 'serialize');
      });

      it('should serialize the array of target profile', async () => {
        // when
        await organizationController.findTargetProfiles(request, hFake);

        // then
        expect(targetProfileSerializer.serialize).to.have.been.calledWith(foundTargetProfiles);
      });

      it('should reply 200 with serialized target profiles', async () => {
        // given
        const serializedTargetProfiles = {};
        targetProfileSerializer.serialize.returns(serializedTargetProfiles);

        // when
        const response = await organizationController.findTargetProfiles(request, hFake);

        // then
        expect(response.source).to.deep.equal(serializedTargetProfiles);
        expect(response.statusCode).to.equal(200);
      });

    });

    context('error cases', () => {

      beforeEach(() => {
        sandbox.stub(logger, 'error');
      });

      it('should log the error and reply with 500 error', async () => {
        // given
        const error = new Error();
        organizationService.findAllTargetProfilesAvailableForOrganization.rejects(error);

        // when
        const response = await organizationController.findTargetProfiles(request, hFake);

        // then
        expect(logger.error).to.have.been.called;
        expect(response.statusCode).to.equal(500);
      });
    });
  });

});
