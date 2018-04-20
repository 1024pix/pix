const dataModels = require('../../../../../../lib/infrastructure/datasources/airtable/models/index');
const skillRawAirTableFixture = require('../../../../../fixtures/infrastructure/skillRawAirTableFixture');
const SkillAirtableDataModelFixture = require('../../../../../fixtures/infrastructure/SkillAirtableDataModelFixture');
const { expect } = require('../../../../../test-helper');

describe('Unit | Infrastructure | Datasource | Airtable | Model | Skill', () => {

  context('#fromAirTableObject', () => {

    it('should create a Skill from the AirtableRecord', () => {
      // given
      const expectedSkill = SkillAirtableDataModelFixture();

      // when
      const skill = dataModels.Skill.fromAirTableObject(skillRawAirTableFixture());

      // then
      expect(skill).to.be.an.instanceof(dataModels.Skill);
      expect(skill).to.deep.equal(expectedSkill);
    });
  });
});
