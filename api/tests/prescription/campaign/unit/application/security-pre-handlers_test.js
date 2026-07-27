import sinon from 'sinon';

import { campaignSecurityPreHandlers } from '../../../../../src/prescription/campaign/application/security-pre-handlers.js';
import { CampaignBelongsToCombinedCourseError } from '../../../../../src/prescription/campaign/domain/errors.js';
import { tokenService } from '../../../../../src/shared/domain/services/token-service.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Prescription | Campaign | Unit | Application | SecurityPreHandlers', function () {
  describe('#checkCampaignBelongsToCombinedCourse', function () {
    context('Successful case', function () {
      it('should authorize access when campaign does not belongs to a combined course', async function () {
        // given
        const checkCampaignBelongsToCombinedCourseUsecaseStub = {
          execute: sinon.stub().resolves(),
        };

        // when
        const response = await campaignSecurityPreHandlers.checkCampaignBelongsToCombinedCourse(
          { params: { campaignId: '123' } },
          hFake,
          {
            checkCampaignBelongsToCombinedCourseUsecase: checkCampaignBelongsToCombinedCourseUsecaseStub,
          },
        );

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid access when the user is not the certificartion candidate', async function () {
        // given
        const checkCampaignBelongsToCombinedCourseUsecaseStub = {
          execute: sinon.stub().rejects(new CampaignBelongsToCombinedCourseError()),
        };

        // when
        const error = await catchErr(campaignSecurityPreHandlers.checkCampaignBelongsToCombinedCourse)(
          { params: { campaignId: '123' } },
          hFake,
          {
            checkCampaignBelongsToCombinedCourseUsecase: checkCampaignBelongsToCombinedCourseUsecaseStub,
          },
        );

        // then
        expect(error).instanceOf(CampaignBelongsToCombinedCourseError);
      });
    });
  });

  describe('#checkAuthorizationToManageCampaign', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and is admin in organization and owner of the campaign', async function () {
        // given
        const user = domainBuilder.buildUser();
        const organization = domainBuilder.buildOrganization();
        domainBuilder.buildMembership({ organization, user, organizationRole: 'ADMIN' });
        const campaign = domainBuilder.buildCampaign({ organizationId: organization.id, ownerId: user.id });

        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: user.id } },
          params: { id: campaign.id },
        };

        sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
        const checkAuthorizationToManageCampaignUsecaseStub = {
          execute: sinon.stub().resolves(true),
        };
        // when
        const response = await campaignSecurityPreHandlers.checkAuthorizationToManageCampaign(request, hFake, {
          checkAuthorizationToManageCampaignUsecase: checkAuthorizationToManageCampaignUsecaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user is member but does not own the campaign', async function () {
        // given
        const user = domainBuilder.buildUser();
        const otherUser = domainBuilder.buildUser();
        const organization = domainBuilder.buildOrganization();
        domainBuilder.buildMembership({ organization, user, organizationRole: 'MEMBER' });
        const campaign = domainBuilder.buildCampaign({ organizationId: organization.id, ownerId: otherUser.id });

        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: user.id } },
          params: { id: campaign.id },
        };

        sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
        const checkAuthorizationToManageCampaignUsecaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response = await campaignSecurityPreHandlers.checkAuthorizationToManageCampaign(request, hFake, {
          checkAuthorizationToManageCampaignUsecase: checkAuthorizationToManageCampaignUsecaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkAuthorizationToAccessCampaign', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and is admin in organization and owner of the campaign', async function () {
        // given
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: Symbol('UserId') } },
          params: { id: Symbol('campaignId') },
        };

        const checkAuthorizationToAccessCampaignUsecaseStub = {
          execute: sinon.stub(),
        };
        checkAuthorizationToAccessCampaignUsecaseStub.execute
          .withArgs({ campaignId: request.params.id, userId: request.auth.credentials.userId })
          .resolves(true);
        // when
        const response = await campaignSecurityPreHandlers.checkAuthorizationToAccessCampaign(request, hFake, {
          checkAuthorizationToAccessCampaignUsecase: checkAuthorizationToAccessCampaignUsecaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });

      it('should use campaignId param if id is not provided', async function () {
        // given
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: Symbol('UserId') } },
          params: { campaignId: Symbol('campaignId') },
        };

        const checkAuthorizationToAccessCampaignUsecaseStub = {
          execute: sinon.stub(),
        };
        checkAuthorizationToAccessCampaignUsecaseStub.execute
          .withArgs({ campaignId: request.params.campaignId, userId: request.auth.credentials.userId })
          .resolves(true);
        // when
        const response = await campaignSecurityPreHandlers.checkAuthorizationToAccessCampaign(request, hFake, {
          checkAuthorizationToAccessCampaignUsecase: checkAuthorizationToAccessCampaignUsecaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user is member but does not own the campaign', async function () {
        // given
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: Symbol('UserId') } },
          params: { id: Symbol('campaignId') },
        };

        const checkAuthorizationToAccessCampaignUsecaseStub = {
          execute: sinon.stub(),
        };
        checkAuthorizationToAccessCampaignUsecaseStub.execute
          .withArgs({ campaignId: request.params.id, userId: request.auth.userId })
          .resolves(false);
        // when
        const response = await campaignSecurityPreHandlers.checkAuthorizationToAccessCampaign(request, hFake, {
          checkAuthorizationToAccessCampaignUsecase: checkAuthorizationToAccessCampaignUsecaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
