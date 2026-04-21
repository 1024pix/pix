import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { OrganizationLearnerType } from '../../../../../src/organizational-entities/domain/models/OrganizationLearnerType.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | findChildrenOrganizations', function () {
  it('returns a list of children organizations', async function () {
    // given
    const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType();
    const {
      organization: parentOrganization,
      structure: parentStructure,
      network,
    } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
      headOrganization: {
        name: 'Parent Org',
        type: 'SCO',
        externalId: '1234567A',
        organizationLearnerTypeId: organizationLearnerType.id,
      },
    });

    const { organization: childOrganization } = databaseBuilder.factory.buildOrganizationInNetwork({
      networkId: network.id,
      parentStructureId: parentStructure.id,
      organizationData: {
        name: 'First Child',
        type: 'SCO',
        organizationLearnerTypeId: organizationLearnerType.id,
      },
    });

    await databaseBuilder.commit();

    const expectedChildOrganization = new OrganizationForAdmin({
      ...childOrganization,
      organizationLearnerType: new OrganizationLearnerType({
        id: organizationLearnerType.id,
        name: undefined,
      }),
    });

    // when
    const childOrganizations = await usecases.findChildrenOrganizations({
      parentOrganizationId: parentOrganization.id,
    });

    // then
    expect(childOrganizations).to.deep.include.members([expectedChildOrganization]);
  });

  context('when parent organization does not exist', function () {
    it('throws a NotFound error', async function () {
      // given
      const parentOrganizationId = 654654;

      // when
      const error = await catchErr(usecases.findChildrenOrganizations)({
        parentOrganizationId,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Organization with ID (${parentOrganizationId}) not found`);
    });
  });
});
