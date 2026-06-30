import _ from 'lodash';

import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | get-target-profiles', function () {
  it('should return a list of target profiles', async function () {
    // given
    const targetProfile1 = databaseBuilder.factory.buildTargetProfile({ name: 'first target profile' });
    const targetProfile2 = databaseBuilder.factory.buildTargetProfile({ name: 'second target profile' });
    const targetProfile3 = databaseBuilder.factory.buildTargetProfile({ name: 'third target profile' });
    await databaseBuilder.commit();

    const targetProfileIds = [targetProfile1.id, targetProfile2.id, targetProfile3.id];

    const expectedTargetProfilesAttributes = _.map([targetProfile1, targetProfile3, targetProfile2], (item) =>
      _.pick(item, ['id', 'name', 'organizationId', 'outdated']),
    );

    // when
    const foundTargetProfiles = await usecases.getTargetProfiles({ targetProfileIds });

    // then
    const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
      _.pick(item, ['id', 'name', 'organizationId', 'outdated']),
    );
    expect(foundTargetProfilesAttributes).to.deep.members(expectedTargetProfilesAttributes);
  });
});
