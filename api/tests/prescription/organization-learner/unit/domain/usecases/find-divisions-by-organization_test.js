import { findDivisionsByOrganization } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-divisions-by-organization.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | find-divisions-by-organization', function () {
  describe('when user has access to organization', function () {
    it('should return all divisions', async function () {
      // given
      const divisionRepository = {
        findByOrganizationIdForCurrentSchoolYear: sinon.stub(),
      };
      const organizationId = 1234;
      divisionRepository.findByOrganizationIdForCurrentSchoolYear
        .withArgs({ organizationId })
        .resolves([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);

      // when
      const divisions = await findDivisionsByOrganization({
        organizationId,
        divisionRepository,
      });

      // then
      expect(divisions).to.be.deep.equal([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);
    });
  });
});
