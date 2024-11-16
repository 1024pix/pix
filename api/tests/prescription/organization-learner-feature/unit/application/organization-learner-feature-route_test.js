import { organizationLearnerFeaturesController } from '../../../../../src/prescription/organization-learner-feature/application/organization-learner-features-controller.js';
import * as organizationLearnerFeatureRoute from '../../../../../src/prescription/organization-learner-feature/application/organization-learner-features-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | organization-learner-feature-router', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
    sinon
      .stub(securityPreHandlers, 'checkUserBelongsToLearnersOrganization')
      .callsFake((request, h) => h.response(true));
    sinon.stub(securityPreHandlers, 'checkOrganizationHasFeature').callsFake((request, h) => h.response(true));

    sinon.stub(organizationLearnerFeaturesController, 'create').resolves(true);

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(organizationLearnerFeatureRoute);
  });

  describe('POST /api/organizations/{organizationId}/features/{featureKey}', function () {
    it('should call checkUserBelongsToOrganization', async function () {
      await httpTestServer.request('POST', '/api/organizations/3234/organization-learners/123/features/tralalalal');

      expect(securityPreHandlers.checkUserBelongsToOrganization).to.have.been.calledOnce;
    });

    it('should call checkUserBelongsToLearnersOrganization', async function () {
      await httpTestServer.request('POST', '/api/organizations/3234/organization-learners/123/features/tralalalal');

      expect(securityPreHandlers.checkUserBelongsToLearnersOrganization).to.have.been.calledOnce;
    });

    it('should call checkOrganizationHasFeature', async function () {
      await httpTestServer.request('POST', '/api/organizations/3234/organization-learners/123/features/tralalalal');

      expect(securityPreHandlers.checkOrganizationHasFeature).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/organizations/{organizationId}/features/{featureKey}', function () {
    it('should call checkUserBelongsToOrganization', async function () {
      await httpTestServer.request('DELETE', '/api/organizations/3234/organization-learners/123/features/tralalalal');

      expect(securityPreHandlers.checkUserBelongsToOrganization).to.have.been.calledOnce;
    });

    it('should call checkUserBelongsToLearnersOrganization', async function () {
      await httpTestServer.request('DELETE', '/api/organizations/3234/organization-learners/123/features/tralalalal');

      expect(securityPreHandlers.checkUserBelongsToLearnersOrganization).to.have.been.calledOnce;
    });

    it('should call checkOrganizationHasFeature', async function () {
      await httpTestServer.request('DELETE', '/api/organizations/3234/organization-learners/123/features/tralalalal');

      expect(securityPreHandlers.checkOrganizationHasFeature).to.have.been.calledOnce;
    });
  });
});
