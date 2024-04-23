import { campaignAdministrationController } from '../../../../../src/prescription/campaign/application/campaign-adminstration-controller.js';
import { usecases } from '../../../../../src/prescription/campaign/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Controller | Campaign administration', function () {
  describe('#save', function () {
    let campaignReportSerializerStub;
    let requestResponseUtils;

    beforeEach(function () {
      sinon.stub(usecases, 'createCampaign');
      campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };

      requestResponseUtils = {
        extractUserIdFromRequest: sinon.stub(),
      };
    });

    it('should return a serialized campaign when the campaign has been successfully created', async function () {
      // given
      const connectedUserId = 1;
      const ownerId = 4;
      const request = {
        auth: { credentials: { userId: connectedUserId } },
        payload: {
          data: {
            attributes: {
              name: 'name',
              type: 'ASSESSMENT',
              title: 'title',
              'id-pix-label': 'idPixLabel',
              'custom-landing-page-text': 'customLandingPageText',
              'multiple-sendings': true,
              'owner-id': ownerId,
            },
            relationships: {
              'target-profile': { data: { id: '123' } },
              organization: { data: { id: '456' } },
            },
          },
        },
        i18n: {
          __: sinon.stub(),
        },
      };
      const campaign = {
        name: 'name',
        type: 'ASSESSMENT',
        title: 'title',
        idPixLabel: 'idPixLabel',
        customLandingPageText: 'customLandingPageText',
        organizationId: 456,
        targetProfileId: 123,
        creatorId: 1,
        ownerId: 4,
        multipleSendings: true,
      };
      requestResponseUtils.extractUserIdFromRequest.withArgs(request).returns(connectedUserId);
      const expectedResult = Symbol('result');
      const createdCampaign = Symbol('created campaign');
      usecases.createCampaign.withArgs({ campaign }).resolves(createdCampaign);
      campaignReportSerializerStub.serialize.withArgs(createdCampaign).returns(expectedResult);
      const dependencies = { requestResponseUtils, campaignReportSerializer: campaignReportSerializerStub };

      // when
      const response = await campaignAdministrationController.save(request, hFake, dependencies);

      // then
      expect(response.source).to.equal(expectedResult);
      expect(response.statusCode).to.equal(201);
    });

    it('should set the creator as the owner when no owner is provided', async function () {
      // given
      const connectedUserId = 1;
      const request = {
        auth: { credentials: { userId: connectedUserId } },
        payload: {
          data: {
            attributes: {
              name: 'name',
              type: 'ASSESSMENT',
              title: 'title',
              'id-pix-label': 'idPixLabel',
              'custom-landing-page-text': 'customLandingPageText',
              'multiple-sendings': true,
            },
            relationships: {
              'target-profile': { data: { id: '123' } },
              organization: { data: { id: '456' } },
            },
          },
        },
        i18n: {
          __: sinon.stub(),
        },
      };
      const campaign = {
        name: 'name',
        type: 'ASSESSMENT',
        title: 'title',
        idPixLabel: 'idPixLabel',
        customLandingPageText: 'customLandingPageText',
        organizationId: 456,
        targetProfileId: 123,
        creatorId: 1,
        ownerId: 1,
        multipleSendings: true,
      };

      requestResponseUtils.extractUserIdFromRequest.withArgs(request).returns(connectedUserId);
      const expectedResult = Symbol('result');
      const createdCampaign = Symbol('created campaign');
      usecases.createCampaign.withArgs({ campaign }).resolves(createdCampaign);
      campaignReportSerializerStub.serialize.withArgs(createdCampaign).returns(expectedResult);
      const dependencies = { requestResponseUtils, campaignReportSerializer: campaignReportSerializerStub };

      // when
      const response = await campaignAdministrationController.save(request, hFake, dependencies);

      // then
      expect(response.source).to.equal(expectedResult);
    });
  });

  describe('#createCampaigns', function () {
    it('should return a 204', async function () {
      // given
      const userId = Symbol('userId');
      const path = Symbol('path');
      const csvSerializerStub = { deserializeForCampaignsImport: sinon.stub() };
      const request = { auth: { credentials: { userId } }, payload: { path } };
      sinon.stub(usecases, 'createCampaigns');
      const deserializedCampaignsToCreate = Symbol('deserializedCampaignsToCreate');
      csvSerializerStub.deserializeForCampaignsImport.withArgs(path).resolves(deserializedCampaignsToCreate);

      // when
      const response = await campaignAdministrationController.createCampaigns(request, hFake, {
        csvSerializer: csvSerializerStub,
      });

      // then
      expect(response.statusCode).to.be.equal(204);
      expect(usecases.createCampaigns).to.have.been.calledWithExactly({
        campaignsToCreate: deserializedCampaignsToCreate,
      });
      expect(csvSerializerStub.deserializeForCampaignsImport).to.have.been.called;
    });
  });

  describe('#update', function () {
    it('should return the updated campaign', async function () {
      // given
      const request = {
        auth: { credentials: { userId: 1 } },
        params: { id: 1 },
        deserializedPayload: {
          name: 'New name',
          title: 'New title',
          customLandingPageText: 'New text',
          ownerId: 5,
        },
      };

      const updatedCampaign = Symbol('campaign');
      const updatedCampaignSerialized = Symbol('campaign serialized');

      sinon
        .stub(usecases, 'updateCampaign')
        .withArgs({ campaignId: 1, ...request.deserializedPayload })
        .resolves(updatedCampaign);
      const campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      campaignReportSerializerStub.serialize.withArgs(updatedCampaign).returns(updatedCampaignSerialized);
      // when
      const response = await campaignAdministrationController.update(request, hFake, {
        campaignReportSerializer: campaignReportSerializerStub,
      });

      // then
      expect(response).to.deep.equal(updatedCampaignSerialized);
    });
  });

  describe('#swapCampaignCodes', function () {
    it('should return a 204', async function () {
      // given
      const firstCampaignId = Symbol('First_Campaign_Id');
      const secondCampaignId = Symbol('Second_Campaign_Id');
      const request = { payload: { firstCampaignId, secondCampaignId } };
      sinon.stub(usecases, 'swapCampaignCodes');

      // when
      const response = await campaignAdministrationController.swapCampaignCodes(request, hFake);

      // then
      expect(response.statusCode).to.be.equal(204);
      expect(usecases.swapCampaignCodes).to.have.been.calledWithExactly({
        firstCampaignId,
        secondCampaignId,
      });
    });
  });

  describe('#updateCampaignCode', function () {
    it('should return a 204', async function () {
      // given
      const campaignId = Symbol('campaign-id');
      const campaignCode = Symbol('campaign-code');
      const request = { params: { campaignId }, payload: { campaignCode: campaignCode } };

      sinon.stub(usecases, 'updateCampaignCode');

      // when
      const response = await campaignAdministrationController.updateCampaignCode(request, hFake);

      // then
      expect(response.statusCode).to.be.equal(204);
      expect(usecases.updateCampaignCode).to.have.been.calledWithExactly({ campaignId, campaignCode });
    });
  });

  describe('#archiveCampaign', function () {
    let updatedCampaign;
    let serializedCampaign;

    const campaignId = 1;
    const userId = 1;
    let campaignReportSerializerStub;

    beforeEach(function () {
      sinon.stub(usecases, 'archiveCampaign');
      campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async function () {
      // given
      usecases.archiveCampaign.withArgs({ userId, campaignId }).resolves(updatedCampaign);
      campaignReportSerializerStub.serialize.withArgs(updatedCampaign).returns(serializedCampaign);

      // when
      const response = await campaignAdministrationController.archiveCampaign(
        {
          params: { id: campaignId },
          auth: {
            credentials: { userId },
          },
        },
        hFake,
        { campaignReportSerializer: campaignReportSerializerStub },
      );

      // then

      expect(response).to.be.equal(serializedCampaign);
    });
  });

  describe('#unarchiveCampaign', function () {
    let updatedCampaign;
    let serializedCampaign;

    const campaignId = 1;
    const userId = 1;
    let campaignReportSerializerStub;

    beforeEach(function () {
      sinon.stub(usecases, 'unarchiveCampaign');

      campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async function () {
      // given
      usecases.unarchiveCampaign.withArgs({ userId, campaignId }).resolves(updatedCampaign);
      campaignReportSerializerStub.serialize.withArgs(updatedCampaign).returns(serializedCampaign);

      // when
      const response = await campaignAdministrationController.unarchiveCampaign(
        {
          params: { id: campaignId },
          auth: {
            credentials: { userId },
          },
        },
        hFake,
        { campaignReportSerializer: campaignReportSerializerStub },
      );

      // then
      expect(response).to.be.equal(serializedCampaign);
    });
  });

  describe('#archiveCampaigns', function () {
    let csvCampaignsIdsParserStub;

    beforeEach(function () {
      sinon.stub(usecases, 'archiveCampaigns');
      csvCampaignsIdsParserStub = { extractCampaignsIds: sinon.stub() };
    });

    it('should return a 204', async function () {
      // given
      const userId = 12;
      const path = Symbol('path');
      const ids = [1, 2];
      const request = { auth: { credentials: { userId } }, payload: path };

      csvCampaignsIdsParserStub.extractCampaignsIds.withArgs(path).returns(ids);
      usecases.archiveCampaigns.withArgs({ userId, ids });

      // when
      const response = await campaignAdministrationController.archiveCampaigns(request, hFake, {
        csvCampaignsIdsParser: csvCampaignsIdsParserStub,
      });

      // then
      expect(response.statusCode).to.be.equal(204);
    });
  });
});
