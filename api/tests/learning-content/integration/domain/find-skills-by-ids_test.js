import { usecases } from '../../../../src/learning-content/domain/usecases/index.js';
import { Skill } from '../../../../src/shared/domain/models/Skill.js';
import { databaseBuilder } from '../../../tooling/databases.js';

describe('Learning Content | Integration | Domain | Usecase | Find skills by ids', function () {
  beforeEach(async function () {
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'acquisC',
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'acquisA',
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'acquisB',
    });
    await databaseBuilder.commit();
  });

  it('should return the skills given by IDS', async function () {
    // when
    const skills = await usecases.findSkillsByIds({
      ids: ['acquisC', 'acquisB', 'acquisQuiNexistePas'],
    });

    // then
    expect(skills.length).to.equal(2);
    expect(skills[0].id).to.equal('acquisB');
    expect(skills[0]).to.be.instanceOf(Skill);
    expect(skills[1].id).to.equal('acquisC');
    expect(skills[1]).to.be.instanceOf(Skill);
  });
});
