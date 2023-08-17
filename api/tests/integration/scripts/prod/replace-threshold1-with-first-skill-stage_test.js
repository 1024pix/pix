import { main } from '../../../../scripts/prod/target-profile-migrations/replace-threshold1-with-first-skill-stage.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Script | Prod | Replace Threshold with First Skill Stage', function () {
  it('should convert ', async function () {
    // given
    const stageToChange = databaseBuilder.factory.buildStage({
      id: 1,
      threshold: 1,
    });
    databaseBuilder.factory.buildStage({
      threshold: 2,
    });
    databaseBuilder.factory.buildStage({
      threshold: 0,
    });
    databaseBuilder.factory.buildStage({
      threshold: null,
    });
    await databaseBuilder.commit();
    const stagesBeforeWithoutFirstSkill = await knex('stages')
      .select('*')
      .where('threshold', '<>', 1)
      .orWhereNull('threshold')
      .orderBy('id');
    // when
    await main();

    // then
    const stagesAfterWithoutFirstSkill = await knex('stages').select('*').where('isFirstSkill', false).orderBy('id');
    const changedStages = await knex('stages').select('*').where('threshold', 1);
    const isFirstSkills = await knex('stages').select('*').where('isFirstSkill', true);
    // inchangés
    expect(stagesAfterWithoutFirstSkill).to.deep.equal(stagesBeforeWithoutFirstSkill);
    expect(changedStages).to.have.lengthOf(0);
    expect(isFirstSkills).to.have.lengthOf(1);
    expect(isFirstSkills).to.deep.equal([
      {
        ...stageToChange,
        isFirstSkill: true,
        threshold: null,
        createdAt: isFirstSkills[0].createdAt,
        updatedAt: isFirstSkills[0].updatedAt,
      },
    ]);
  });
});
