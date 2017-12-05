const { describe, it, beforeEach, afterEach, expect, sinon } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/cache');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const Bookshelf = require('../../../../lib/infrastructure/bookshelf');
const DomainSkill = require('../../../../lib/domain/models/Skill');

function _buildChallenge(id, instruction, proposals, competence, status, skillNames) {

  const skills = skillNames.map((skillName) => new DomainSkill(skillName));

  return { id, instruction, proposals, competence, status, skills };
}

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

  /*
   * #findByCompetence
   */

  describe('#findByCompetence', function() {

    const competence = {
      id: 'competence_id',
      reference: 'X.Y Titre de la compétence'
    };

    describe('when the skills has been cached', () => {

      it('should resolve skills directly retrieved from the cache without calling Airtable when the challenge has been cached', () => {
        // given
        const cachedSkills = new Set(['web1', 'web2', 'web3']);
        cache.get.returns(cachedSkills);

        // when
        const promise = skillRepository.findByCompetence(competence);

        // then
        return promise.then((skills) => {
          expect(cache.get).to.have.been.calledWith(`skill-repository_find_by_competence_${competence.id}`);
          expect(skills).to.deep.equal(cachedSkills);
        });
      });

    });

    context('when skills have not been cached', function() {

      const challenges = [
        _buildChallenge('challenge_id_1', 'Instruction #1', 'Proposals #1', 'competence_id', 'validé', ['web2', 'web3']),
        _buildChallenge('challenge_id_2', 'Instruction #2', 'Proposals #2', 'competence_id', 'validé', ['url1']),
        _buildChallenge('challenge_id_3', 'Instruction #3', 'Proposals #3', 'competence_id', 'validé', ['web1'])
      ];

      beforeEach(() => {
        cache.get.returns();
        cache.set.returns();
        challengeRepository.findByCompetence.resolves(challenges);
      });

      it('should resolve skills with the challenges fetched from Airtable', () => {
        // when
        const promise = skillRepository.findByCompetence(competence);

        // then
        return promise.then((skills) => {
          const expectedSkills = [
            new DomainSkill('web2'),
            new DomainSkill('web3'),
            new DomainSkill('url1'),
            new DomainSkill('web1'),
          ];

          expect([...skills]).to.deep.equal(expectedSkills);
        });
      });

      it('should cache the skills fetched from Airtable', () => {
        // when
        const promise = skillRepository.findByCompetence(competence);

        // then
        return promise.then((skills) => {
          expect(cache.set).to.have.been.calledWith(`skill-repository_find_by_competence_${competence.id}`, skills);
        });
      });

      it('should not return twice the same skill', () => {
        // given
        const challenges = [
          _buildChallenge('challenge_id_1', 'Instruction #1', 'Proposals #1', 'competence_id', 'validé', ['web2', 'web3']),
          _buildChallenge('challenge_id_3', 'Instruction #3', 'Proposals #3', 'competence_id', 'validé', ['web2']),
        ];
        challengeRepository.findByCompetence.resolves(challenges);

        // when
        const promise = skillRepository.findByCompetence(competence);

        // then
        return promise.then((skills) => {
          const expectedSkills = [
            new DomainSkill('web2'),
            new DomainSkill('web3'),
          ];

          expect([...skills]).to.deep.equal(expectedSkills);
        });
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
