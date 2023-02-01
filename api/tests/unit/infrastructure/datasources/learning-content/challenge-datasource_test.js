const _ = require('lodash');
const { expect, sinon } = require('../../../../test-helper');
const lcms = require('../../../../../lib/infrastructure/lcms');
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/challenge-datasource');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | Learning Content | ChallengeDatasource', function () {
  let competence1,
    competence2,
    web1,
    web2,
    web3,
    challenge_competence1,
    challenge_competence1_noSkills,
    challenge_competence1_notValidated,
    challenge_competence2,
    challenge_web1,
    challenge_web1_notValidated,
    challenge_web1_archived,
    challenge_web2_en,
    challenge_web3,
    challenge_web3_archived;

  beforeEach(function () {
    competence1 = { id: 'competence1' };
    competence2 = { id: 'competence2' };
    web1 = { id: 'skill-web1' };
    web2 = { id: 'skill-web2' };
    web3 = { id: 'skill-web3' };
    challenge_competence1 = {
      id: 'challenge-competence1',
      competenceId: competence1.id,
      skillId: web1.id,
      status: 'validé',
      locales: ['fr', 'fr-fr'],
      alpha: 2.11,
      delta: -3.56,
    };
    challenge_competence1_noSkills = {
      id: 'challenge-competence1-noSkills',
      competenceId: competence1.id,
      skillId: undefined,
      status: 'validé',
      locales: ['fr', 'fr-fr'],
      alpha: 8.11,
      delta: 0.95,
    };
    challenge_competence1_notValidated = {
      id: 'challenge-competence1-notValidated',
      competenceId: competence1.id,
      skillId: web1.id,
      locales: ['fr', 'fr-fr'],
      status: 'proposé',
      alpha: -0,
      delta: 0,
    };
    challenge_competence2 = {
      id: 'challenge-competence2',
      competenceId: competence2.id,
      skillId: web1.id,
      status: 'validé',
      locales: ['fr', 'fr-fr'],
      alpha: 8.21,
      delta: -4.23,
    };
    challenge_web1 = {
      id: 'challenge-web1',
      skillId: web1.id,
      locales: ['fr', 'fr-fr'],
      status: 'validé',
    };
    challenge_web1_notValidated = {
      id: 'challenge-web1-notValidated',
      skillId: web1.id,
      status: 'proposé',
      locales: ['fr', 'fr-fr'],
    };
    challenge_web1_archived = {
      id: 'challenge_web1_archived',
      skillId: web1.id,
      status: 'archivé',
      locales: ['fr', 'fr-fr'],
    };
    challenge_web2_en = {
      id: 'challenge-web2',
      skillId: web2.id,
      locales: ['en'],
      status: 'validé',
      alpha: 1,
      delta: -2,
    };
    challenge_web3 = {
      id: 'challenge-web3',
      skillId: web3.id,
      status: 'validé',
      locales: ['fr', 'fr-fr'],
      alpha: 1.83,
      delta: 0.27,
    };
    challenge_web3_archived = {
      id: 'challenge-web3-archived',
      skillId: web3.id,
      status: 'archivé',
      locales: ['fr-fr'],
      alpha: -8.1,
      delta: 0,
    };

    sinon.stub(cache, 'get').callsFake((generator) => generator());
  });

  describe('#findOperativeBySkillIds', function () {
    beforeEach(function () {
      sinon
        .stub(lcms, 'getLatestRelease')
        .resolves({ challenges: [challenge_web1, challenge_web1_notValidated, challenge_web2_en, challenge_web3] });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // given
      const skillIds = ['skill-web1', 'skill-web2'];

      // when
      const result = await challengeDatasource.findOperativeBySkillIds(skillIds);

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal(['challenge-web1', 'challenge-web2']);
    });
  });

  describe('#findValidatedByCompetenceId', function () {
    let result;

    beforeEach(async function () {
      // given
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [
          challenge_competence1,
          challenge_competence1_noSkills,
          challenge_competence1_notValidated,
          challenge_competence2,
        ],
      });

      // when
      result = await challengeDatasource.findValidatedByCompetenceId(competence1.id);
    });

    it('should resolve to an array of matching Challenges from learning content', function () {
      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal(['challenge-competence1']);
    });
  });

  describe('#findOperative', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [challenge_web1, challenge_web1_notValidated, challenge_web2_en, challenge_web3_archived],
      });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // when
      const result = await challengeDatasource.findOperative();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal(['challenge-web1', 'challenge-web2', 'challenge-web3-archived']);
    });
  });

  describe('#findOperativeHavingLocale', function () {
    it('should retrieve the operative Challenges of given locale only', async function () {
      // given
      const locale = 'fr-fr';
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [challenge_web1, challenge_web1_notValidated, challenge_web2_en, challenge_web3_archived],
      });

      // when
      const result = await challengeDatasource.findOperativeHavingLocale(locale);

      // then
      expect(_.map(result, 'id')).to.deep.equal(['challenge-web1', 'challenge-web3-archived']);
    });
  });

  describe('#findValidated', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [challenge_web1, challenge_web1_notValidated, challenge_web2_en, challenge_web3_archived],
      });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // when
      const result = await challengeDatasource.findValidated();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal(['challenge-web1', 'challenge-web2']);
    });
  });

  describe('#findActiveFlashCompatible', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [
          challenge_competence1,
          challenge_competence1_noSkills,
          challenge_competence2,
          challenge_web1,
          challenge_web1_notValidated,
          challenge_web2_en,
          challenge_web3,
          challenge_web3_archived,
        ],
      });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // when
      const locale = 'fr-fr';
      const result = await challengeDatasource.findActiveFlashCompatible(locale);

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal([
        challenge_competence1.id,
        challenge_competence2.id,
        challenge_web3.id,
      ]);
    });
  });

  describe('#findOperativeFlashCompatible', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [
          challenge_competence1,
          challenge_competence1_noSkills,
          challenge_competence2,
          challenge_web1,
          challenge_web1_notValidated,
          challenge_web2_en,
          challenge_web3,
          challenge_web3_archived,
        ],
      });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // when
      const locale = 'fr-fr';
      const result = await challengeDatasource.findOperativeFlashCompatible(locale);

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal([
        challenge_competence1.id,
        challenge_competence2.id,
        challenge_web3.id,
        challenge_web3_archived.id,
      ]);
    });
  });

  describe('#findValidatedBySkillId', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [challenge_web1, challenge_web1_notValidated, challenge_web1_archived, challenge_competence2],
      });
    });
    it('should resolve an array of validated challenge of a skill from learning content ', async function () {
      // when
      const result = await challengeDatasource.findValidatedBySkillId('skill-web1');

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(result).to.deep.equal([challenge_web1, challenge_competence2]);
    });
  });
});
