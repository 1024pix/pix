const { expect, hFake, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const supOrganizationLearnerController = require('../../../../lib/application/sup-organization-learners/sup-organization-learner-controller');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Unit | Application | Controller | sup-organization-learner', function () {
  describe('#updateStudentNumber', function () {
    const userId = 2;
    const request = {
      auth: { credentials: { userId } },
      params: { id: 1, schoolingRegistrationId: 2, organizationLearnerId: 2 },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'updateStudentNumber');
      usecases.updateStudentNumber.resolves();
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInSUPOrganizationManagingStudents');
      securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/organizations/1/schooling-registration-user-associations/2',
      };
      const response = await supOrganizationLearnerController.updateStudentNumber(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal(
        '/api/organizations/1/sup-organization-learners/2; rel="successor-version"'
      );
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/organizations/1/sup-organization-learners/2',
      };
      const response = await supOrganizationLearnerController.updateStudentNumber(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });
});
