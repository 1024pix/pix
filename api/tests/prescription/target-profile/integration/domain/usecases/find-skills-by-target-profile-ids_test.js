import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { Skill } from '../../../../../../src/shared/domain/models/Skill.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Prescription | Target Profile | Domain | usecases | find-skills-by-target-profile-ids', function () {
  it('works', async function () {
    const firstTPId = databaseBuilder.factory.buildTargetProfile().id;
    const secondTPId = databaseBuilder.factory.buildTargetProfile().id;

    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: firstTPId, tubeId: 'firstTube', level: 5 });
    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: secondTPId, tubeId: 'firstTube', level: 1 });
    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: secondTPId, tubeId: 'secondTube', level: 3 });

    databaseBuilder.factory.learningContent.buildTube({
      id: 'firstTube',
    });
    databaseBuilder.factory.learningContent.buildTube({
      id: 'secondTube',
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'firstSkill_firstTube',
      tubeId: 'firstTube',
      status: 'actif',
      level: 1,
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'firstSkill_secondTube',
      tubeId: 'secondTube',
      status: 'actif',
      level: 3,
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'secondSkill_secondTube',
      tubeId: 'secondTube',
      status: 'actif',
      level: 5,
    });

    await databaseBuilder.commit();

    const result = await usecases.findSkillsByTargetProfileIds({ targetProfileIds: [firstTPId, secondTPId] });

    expect(result).lengthOf(2);
    expect(result[0]).instanceOf(Skill);
  });
});
