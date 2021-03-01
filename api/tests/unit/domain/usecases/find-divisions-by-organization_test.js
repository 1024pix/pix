const { expect, sinon } = require('../../../test-helper');

const findDivisionsByOrganization = require('../../../../lib/domain/usecases/find-divisions-by-organization');

describe('Unit | UseCase | find-divisions-by-organization', () => {

  describe('when user has access to organization', () => {

    it('should return all divisions', async () => {
      // given
      const divisionRepository = {
        findByOrganizationId: sinon.stub(),
      };
      const organizationId = 1234;
      divisionRepository.findByOrganizationId
        .withArgs({ organizationId })
        .resolves(['3a', '3b', '5c' ]);

      // when
      const divisions = await findDivisionsByOrganization({
        organizationId,
        divisionRepository,
      });

      // then
      expect(divisions).to.be.deep.equal([ '3a', '3b', '5c' ]);
    });
  });
});
