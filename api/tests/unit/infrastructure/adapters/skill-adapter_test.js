const { expect, domainBuilder } = require('../../../test-helper');
const skillAdapter = require('../../../../lib/infrastructure/adapters/skill-adapter');
const Skill = require('../../../../lib/domain/models/Skill');
const { DEFAULT_TUTORIAL_ID }  = require('../../../tooling/fixtures/infrastructure/skillRawAirTableFixture');

describe('Unit | Infrastructure | Adapter | skillAdapter', () => {

  it('should adapt skillAirtableDataObject to domain', () => {
    // given
    const skillDataObject = domainBuilder.buildSkillAirtableDataObject();
    const expectedSkill = domainBuilder.buildSkill({
      id: skillDataObject.id,
      name: skillDataObject.name,
      pixValue: skillDataObject.pixValue,
      competenceId: skillDataObject.competenceId,
      tutorialIds: [DEFAULT_TUTORIAL_ID],
      tubeId: skillDataObject.tubeId,
    });

    // when
    const skill = skillAdapter.fromAirtableDataObject(skillDataObject);

    // then
    expect(skill).to.be.an.instanceOf(Skill);
    expect(skill).to.deep.equal(expectedSkill);
  });
});
