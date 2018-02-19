const { expect, sinon } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/cache');
const Bookshelf = require('../../../../lib/infrastructure/bookshelf');
const DomainSkill = require('../../../../lib/domain/models/Skill');
const airtable = require('../../../../lib/infrastructure/airtable');
const AirtableRecord = require('airtable').Record;

const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');

describe('Unit | Repository | skill-repository', function() {

  beforeEach(() => {
    sinon.stub(cache, 'get');
    sinon.stub(cache, 'set');
    sinon.stub(challengeRepository, 'findByCompetence');
  });

  afterEach(() => {
    cache.get.restore();
    cache.set.restore();
    challengeRepository.findByCompetence.restore();
  });

  describe('#findByCompetence', function() {

    const competence = {
      id: 'competence_id',
      reference: 'X.Y Titre de la compétence'
    };

    beforeEach(() => {
      const acquix1 = new AirtableRecord('Acquis', 'recAcquix1', { fields: { 'Nom': '@acquix1' } });
      const acquix2 = new AirtableRecord('Acquis', 'recAcquix2', { fields: { 'Nom': '@acquix2' } });
      sinon.stub(airtable, 'findRecords').resolves([acquix1, acquix2]);
    });

    afterEach(() => {
      airtable.findRecords.restore();
    });

    it('should resolve skills Domain Object', function() {
      // when
      const promise = skillRepository.findByCompetence(competence);

      // then
      return promise.then((skills) => {
        expect(skills[0]).to.be.instanceof(DomainSkill);
      });
    });

    it('should resolve all skills from Airtable for one competence', function() {
      //given

      // when
      const promise = skillRepository.findByCompetence(competence);

      // then
      return promise.then((skills) => {
        expect(skills).to.have.lengthOf(2);
        expect(skills[0]).to.be.deep.equal({ name: '@acquix1' });
        expect(skills[1]).to.be.deep.equal({ name: '@acquix2' });
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
