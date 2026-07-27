import sinon from 'sinon';

import { campaignSecurityPreHandlers } from '../../../../../src/prescription/campaign/application/security-pre-handlers.js';
import { CampaignBelongsToCombinedCourseError } from '../../../../../src/prescription/campaign/domain/errors.js';
import { expect } from '../../../../test-helper.js';
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
});
