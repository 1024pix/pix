const { expect, sinon } = require('../../../test-helper');
const DomainSkill = require('../../../../lib/domain/models/Skill');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');

describe('Unit | Repository | skill-repository', function() {

  beforeEach(() => {
    sinon.stub(skillDatasource, 'findByCompetenceId');
    sinon.stub(skillDatasource, 'findActiveSkills');
  });

  describe('#findByCompetenceId', function() {

    const competenceID = 'competence_id';

    beforeEach(() => {
      skillDatasource.findByCompetenceId
        .withArgs('competence_id')
        .resolves([{
          id: 'recAcquix1',
          name: '@acquix1',
          pixValue: 2.4,
          competenceId: 'rec1',
          tutorialIds: [1, 2, 3],
          tubeId: 'tubeRec1',
        }, {
          id: 'recAcquix2',
          name: '@acquix2',
          pixValue: 2.4,
          competenceId: 'rec2',
          tubeId: 'tubeRec2',
        },
        ]);
    });

    it('should resolve all skills for one competence', async function() {
      //given

      // when
      const skills = await skillRepository.findByCompetenceId(competenceID);

      // then
      expect(skills).to.have.lengthOf(2);
      expect(skills[0]).to.be.instanceof(DomainSkill);
      expect(skills).to.be.deep.equal([
        { id: 'recAcquix1', name: '@acquix1', pixValue: 2.4, competenceId: 'rec1', tutorialIds: [1, 2, 3], tubeId: 'tubeRec1' },
        { id: 'recAcquix2', name: '@acquix2', pixValue: 2.4, competenceId: 'rec2', tutorialIds: [], tubeId: 'tubeRec2' },
      ]);
    });
  });

});
