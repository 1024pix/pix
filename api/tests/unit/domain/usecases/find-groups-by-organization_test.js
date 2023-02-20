import { expect, sinon } from '../../../test-helper';
import findDivisionsByOrganization from '../../../../lib/domain/usecases/find-groups-by-organization';

describe('Unit | UseCase | find-groups-by-organization', function () {
  it('should return all groups', async function () {
    // given
    const groupRepository = {
      findByOrganizationId: sinon.stub(),
    };
    const organizationId = 1234;
    groupRepository.findByOrganizationId
      .withArgs({ organizationId })
      .resolves([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);

    // when
    const groups = await findDivisionsByOrganization({
      organizationId,
      groupRepository,
    });

    // then
    expect(groups).to.be.deep.equal([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);
  });
});
