const { describe, it, beforeEach, afterEach, expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const challengeSerializer = require('../../../../lib/infrastructure/serializers/airtable/challenge-serializer');
const Bookshelf = require('../../../../lib/infrastructure/bookshelf');

function _buildChallenge(id, instruction, proposals, competence, status, skills) {
  return { id, instruction, proposals, competence, status, skills };
}

describe('Unit | Repository | skill-repository', function() {

  let getRecord;
  let getRecords;

  beforeEach(function() {
    cache.flushAll();
    getRecord = sinon.stub(airtable, 'getRecord');
    getRecords = sinon.stub(airtable, 'getRecords');
  });

  afterEach(function() {
    cache.flushAll();
    getRecord.restore();
    getRecords.restore();
  });

  /*
   * #getFromCompetenceId
   */

  describe('#getFromCompetenceId', function() {

    const competenceId = 'competence_id';
    const cacheKey = `skill-repository_get_from_competence_${competenceId}`;
    const challenges = [
      _buildChallenge('challenge_id_1', 'Instruction #1', 'Proposals #1', 'competence_id', 'validé', ['web2', 'web3']),
      _buildChallenge('challenge_id_2', 'Instruction #2', 'Proposals #2', 'other_competence_id', 'validé', ['url1']),
      _buildChallenge('challenge_id_3', 'Instruction #3', 'Proposals #3', 'competence_id', 'validé', ['web1'])
    ];

    it('should reject with an error when the cache throws an error', function() {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get').callsFake((key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = skillRepository.cache.getFromCompetenceId(competenceId);

      // then
      cache.get.restore();
      return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
    });

    it('should resolve skills directly retrieved from the cache without calling Airtable when the challenge has been cached', function() {
      // given
      getRecords.resolves(true);
      const expectedSkills = new Set(['web1', 'web2', 'web3']);
      cache.set(cacheKey, expectedSkills);

      // when
      const result = skillRepository.cache.getFromCompetenceId(competenceId);

      // then
      expect(getRecords.notCalled).to.be.true;
      return expect(result).to.eventually.deep.equal(expectedSkills);
    });

    describe('when skills have not been previously cached', function() {

      beforeEach(function() {
        getRecords.resolves(challenges);
      });

      it('should resolve skills with the challenges fetched from Airtable', function() {
        // when
        const result = skillRepository.cache.getFromCompetenceId(competenceId);

        // then
        const expectedSkills = new Set(['web1', 'web2', 'web3']);
        return expect(result).to.eventually.deep.equal(expectedSkills);
      });

      it('should cache the challenges fetched from Airtable', function(done) {
        // when
        const result = skillRepository.cache.getFromCompetenceId(competenceId);

        // then
        result.then(() => {
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly Airtable', function() {
        // given
        const expectedQuery = {};

        // when
        const result = skillRepository.cache.getFromCompetenceId(competenceId);

        // then
        return result.then(() => {
          expect(getRecords.calledWith('Epreuves', expectedQuery, challengeSerializer)).to.be.true;
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
      const promise = skillRepository.db.save(skillsFormatted);

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
