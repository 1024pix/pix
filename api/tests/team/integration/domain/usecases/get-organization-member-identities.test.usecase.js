import { usecases } from '../../../../../src/team/domain/usecases/index.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Team | Integration | Domain | Usecases | get-organization-members', function () {
  it('returns active organization members', async function () {
    // given
    const date = new Date(2024, 1, 13);
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

    const firstMemberId = databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Némard' }).id;
    databaseBuilder.factory.buildMembership({ organizationId, userId: firstMemberId });

    const secondMemberId = databaseBuilder.factory.buildUser({ firstName: 'Daisy', lastName: 'Niey' }).id;
    databaseBuilder.factory.buildMembership({ organizationId, userId: secondMemberId });

    const disabledMemberId = databaseBuilder.factory.buildUser({ firstName: 'Martin', lastName: 'Parti' }).id;
    databaseBuilder.factory.buildMembership({ organizationId, userId: disabledMemberId, disabledAt: date });

    const otherMemberId = databaseBuilder.factory.buildUser({ firstName: 'Marie-Laure', lastName: 'Delabas' }).id;
    databaseBuilder.factory.buildMembership({ organizationId: otherOrganizationId, userId: otherMemberId });

    await databaseBuilder.commit();

    // when
    const foundMembers = await usecases.getOrganizationMemberIdentities({
      organizationId,
    });

    // then
    expect(foundMembers).to.have.lengthOf(2);
    expect(foundMembers[0]).to.deep.include({
      id: secondMemberId,
      firstName: 'Daisy',
      lastName: 'Niey',
    });
    expect(foundMembers[1]).to.deep.include({
      id: firstMemberId,
      firstName: 'Jean',
      lastName: 'Némard',
    });
  });
});
