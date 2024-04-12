import * as organizationLearnersApi from '../../../../../../src/prescription/organization-learner/application/api/organization-learners-api.js';
import { OrganizationLearnerImported } from '../../../../../../src/prescription/organization-learner/domain/models/OrganizationLearnerImported.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { expect, sinon } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | API | Organization Learner', function () {
  describe('#findPaginatedOrganizationLearners', function () {
    it('should paginated learners', async function () {
      const organizationLearner = domainBuilder.prescription.organizationLearner.buildOrganizationLearnerImported({
        id: 1242,
        firstName: 'Paul',
        lastName: 'Henri',
        attributes: { classe: '3ème' },
      });

      const getPaginatedOrganizationLearnerStub = sinon.stub(usecases, 'findPaginatedOrganizationLearners');
      getPaginatedOrganizationLearnerStub
        .withArgs({
          organizationId: 3,
          page: { size: 18, number: 1 },
        })
        .resolves({
          learners: [organizationLearner],
          pagination: { pageSize: 18, pageNumber: 1, rowCount: 1, page: 1 },
        });

      // when
      const result = await organizationLearnersApi.findPaginatedOrganizationLearners({
        organizationId: 3,
        page: { size: 18, number: 1 },
      });

      // then
      expect(result.learners[0].id).to.equal(organizationLearner.id);
      expect(result.learners[0].classe).to.equal('3ème');
      expect(result.learners[0]).not.to.be.instanceOf(OrganizationLearnerImported);
    });
  });
});
