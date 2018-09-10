const { expect, factory } = require('../../../test-helper');
const skillAdapter = require('../../../../lib/infrastructure/adapters/skill-adapter');
const Skill = require('../../../../lib/domain/models/Skill');

describe('Unit | Infrastructure | Adapter | skillAdapter', () => {

  it('should adapt skillAirtableDataObject to domain', () => {
    // given
    const skillDataObject = factory.buildSkillAirtableDataObject();
    const expectedSkill = factory.buildSkill({ id: skillDataObject.id, name: skillDataObject.name });

    // when
    const skill = skillAdapter.fromAirtableDataObject(skillDataObject);

    // then
    expect(skill).to.be.an.instanceOf(Skill);
    expect(skill).to.deep.equal(expectedSkill);
  });
});
