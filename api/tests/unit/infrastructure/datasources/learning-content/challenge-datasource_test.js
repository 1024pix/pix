const _ = require('lodash');
const { expect, sinon } = require('../../../../test-helper');
const lcms = require('../../../../../lib/infrastructure/lcms');
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/challenge-datasource');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | Learning Content | ChallengeDatasource', function() {

  const
    competence1 = { id: 'competence1' },
    competence2 = { id: 'competence2' },

    web1 = { id: 'skill-web1' },
    web2 = { id: 'skill-web2' },
    web3 = { id: 'skill-web3' },

    challenge_competence1 = {
      id: 'challenge-competence1',
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      competenceId: competence1.id,
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      skillIds: [web1.id],
      status: 'validé',
    },
    challenge_competence1_noSkills = {
      id: 'challenge-competence1-noSkills',
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      competenceId: competence1.id,
      skillIds: undefined,
      status: 'validé',
    },
    challenge_competence1_notValidated = {
      id: 'challenge-competence1-notValidated',
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      competenceId: competence1.id,
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      skillIds: [web1.id],
      status: 'proposé',
    },
    challenge_competence2 = {
      id: 'challenge-competence2',
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      competenceId: competence2.id,
      status: 'validé',
    },
    challenge_web1 = {
      id: 'challenge-web1',
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      skillIds: [web1.id],
      locales: ['fr', 'fr-fr'],
      status: 'validé',
    },
    challenge_web1_notValidated = {
      id: 'challenge-web1-notValidated',
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      skillIds: [web1.id],
      status: 'proposé',
      locales: ['fr', 'fr-fr'],
    },
    challenge_web2 = {
      id: 'challenge-web2',
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      skillIds: [web2.id],
      locales: ['en'],
      status: 'validé',
    },
    challenge_web3 = {
      id: 'challenge-web3',
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      skillIds: [web3.id],
      status: 'validé',
    },
    challenge_web3_archived = {
      id: 'challenge-web3-archived',
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      skillIds: [web3.id],
      status: 'archivé',
      locales: ['fr-fr'],
    };

  beforeEach(function() {
    sinon.stub(cache, 'get').callsFake((generator) => generator());
  });

  describe('#findOperativeBySkillIds', function() {

    beforeEach(function() {
      sinon.stub(lcms, 'getLatestRelease').resolves({ 'challenges': [
        challenge_web1,
        challenge_web1_notValidated,
        challenge_web2,
        challenge_web3,
      ] });
    });

    it('should resolve an array of matching Challenges from learning content', async function() {
      // given
      const skillIds = ['skill-web1', 'skill-web2'];

      // when
      const result = await challengeDatasource.findOperativeBySkillIds(skillIds);

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal([
        'challenge-web1',
        'challenge-web2',
      ]);
    });
  });

  describe('#findValidatedByCompetenceId', function() {

    let result;

    beforeEach(async function() {
      // given
      sinon.stub(lcms, 'getLatestRelease').resolves({ 'challenges': [
        challenge_competence1,
        challenge_competence1_noSkills,
        challenge_competence1_notValidated,
        challenge_competence2,
      ] });

      // when
      result = await challengeDatasource.findValidatedByCompetenceId(competence1.id);
    });

    it('should resolve to an array of matching Challenges from learning content', function() {
      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal(['challenge-competence1']);
    });
  });

  describe('#findOperative', function() {

    beforeEach(function() {
      sinon.stub(lcms, 'getLatestRelease').resolves({ 'challenges': [
        challenge_web1,
        challenge_web1_notValidated,
        challenge_web2,
        challenge_web3_archived,
      ] });
    });

    it('should resolve an array of matching Challenges from learning content', async function() {
      // when
      const result = await challengeDatasource.findOperative();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal([
        'challenge-web1',
        'challenge-web2',
        'challenge-web3-archived',
      ]);
    });
  });

  describe('#findOperativeHavingLocale', function() {

    it('should retrieve the operative Challenges of given locale only', async function() {
      // given
      const locale = 'fr-fr';
      sinon.stub(lcms, 'getLatestRelease').resolves({ 'challenges': [
        challenge_web1,
        challenge_web1_notValidated,
        challenge_web2,
        challenge_web3_archived,
      ] });

      // when
      const result = await challengeDatasource.findOperativeHavingLocale(locale);

      // then
      expect(_.map(result, 'id')).to.deep.equal([
        'challenge-web1',
        'challenge-web3-archived',
      ]);
    });
  });

  describe('#findValidated', function() {

    beforeEach(function() {
      sinon.stub(lcms, 'getLatestRelease').resolves({ 'challenges': [
        challenge_web1,
        challenge_web1_notValidated,
        challenge_web2,
        challenge_web3_archived,
      ] });
    });

    it('should resolve an array of matching Challenges from learning content', async function() {
      // when
      const result = await challengeDatasource.findValidated();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal([
        'challenge-web1',
        'challenge-web2',
      ]);
    });
  });

});
