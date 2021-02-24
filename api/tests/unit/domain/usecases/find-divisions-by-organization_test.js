const { expect, sinon } = require('../../../test-helper');

const findDivisionsByOrganization = require('../../../../lib/domain/usecases/find-divisions-by-organization');

describe('Unit | UseCase | find-divisions-by-organization', () => {

  describe('when user has access to organization', () => {

    it('should return all divisions', async () => {
      // given
      const schoolingRegistrationRepository = {
        findDivisionsByOrganizationId: sinon.stub(),
      };
      const organizationId = 1234;
      schoolingRegistrationRepository.findDivisionsByOrganizationId
        .withArgs({ organizationId })
        .resolves([{ id: '3a', name: '3a' }, { id: '3b', name: '3b' }, { id: '5c', name: '5c' }]);

      // when
      const divisions = await findDivisionsByOrganization({
        organizationId,
        schoolingRegistrationRepository,
      });

      // then
      expect(divisions).to.be.deep.equal([
        { id: '3a', name: '3a' }, { id: '3b', name: '3b' }, { id: '5c', name: '5c' },
      ]);
    });
  });
});
