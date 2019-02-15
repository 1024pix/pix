const { expect, sinon } = require('../../../test-helper');
const DomainSkill = require('../../../../lib/domain/models/Skill');
const airTableDataObjects = require('../../../../lib/infrastructure/datasources/airtable/objects');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');

describe('Unit | Repository | skill-repository', function() {

  beforeEach(() => {
    sinon.stub(skillDatasource, 'findByCompetenceId');
  });

  describe('#findByCompetenceId', function() {

    const competenceID = 'competence_id';

    beforeEach(() => {
      skillDatasource.findByCompetenceId
        .withArgs('competence_id')
        .resolves([
          new airTableDataObjects.Skill({ id: 'recAcquix1', name: '@acquix1' }),
          new airTableDataObjects.Skill({ id: 'recAcquix2', name: '@acquix2' }),
        ]);
    });

    it('should resolve all skills for one competence', function() {
      //given

      // when
      const promise = skillRepository.findByCompetenceId(competenceID);

      // then
      return promise.then((skills) => {
        expect(skills).to.have.lengthOf(2);
        expect(skills[0]).to.be.instanceof(DomainSkill);
        expect(skills).to.be.deep.equal([
          { id: 'recAcquix1', name: '@acquix1' },
          { id: 'recAcquix2', name: '@acquix2' },
        ]);
      });
    });
  });
});
