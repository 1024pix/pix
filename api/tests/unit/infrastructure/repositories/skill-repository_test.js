const { expect, sinon } = require('../../../test-helper');
const Bookshelf = require('../../../../lib/infrastructure/bookshelf');
const DomainSkill = require('../../../../lib/domain/models/Skill');
const airTableDataObjects = require('../../../../lib/infrastructure/datasources/airtable/objects');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');

describe('Unit | Repository | skill-repository', function() {

  beforeEach(() => {
    sinon.stub(skillDatasource, 'findByCompetenceId');
  });

  afterEach(() => {
    skillDatasource.findByCompetenceId.restore();
  });

  describe('#findByCompetence', function() {

    const competence = {
      id: 'competence_id',
      index: 'X.Y',
      reference: 'X.Y Titre de la compétence'
    };

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
      const promise = skillRepository.findByCompetence(competence);

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

  describe('#save', () => {
    let sandbox;
    let forgeStub;
    let invokeStub;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      invokeStub = sandbox.stub().resolves();
      forgeStub = sandbox.stub().returns({
        invokeThen: invokeStub
      });

      sandbox.stub(Bookshelf.Collection, 'extend').returns({
        forge: forgeStub
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should save assessment skills', () => {
      // given
      const skillsFormatted = [
        { assessmentId: '1', name: '@url2', status: 'ok' },
        { assessmentId: '2', name: '@web3', status: 'ok' },
        { assessmentId: '3', name: '@recherch2', status: 'ko' },
        { assessmentId: '4', name: '@securite3', status: 'ko' },
      ];

      // when
      const promise = skillRepository.save(skillsFormatted);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(forgeStub);
        sinon.assert.calledWith(forgeStub, skillsFormatted);
        sinon.assert.calledOnce(invokeStub);
        sinon.assert.calledWith(invokeStub, 'save');
      });
    });
  });
});
