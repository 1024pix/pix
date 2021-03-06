const { expect, sinon } = require('../../../test-helper');

const findDivisionsByOrganization = require('../../../../lib/domain/usecases/find-divisions-by-organization');

describe('Unit | UseCase | find-divisions-by-organization', () => {

  describe('when user has access to organization', () => {

    it('should return all divisions', async () => {
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
