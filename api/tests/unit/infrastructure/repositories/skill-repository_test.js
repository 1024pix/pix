const { describe, it, beforeEach, afterEach, expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const challengeSerializer = require('../../../../lib/infrastructure/serializers/airtable/challenge-serializer');

function _buildChallenge(id, instruction, proposals, competence, status, knowledgeTags) {
  return { id, instruction, proposals, competence, status, knowledgeTags };
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

    it('should reject with an error when the cache throws an error', function(done) {
      // given
      const cacheErrorMessage = 'Cache error';
      sinon.stub(cache, 'get').callsFake((key, callback) => {
        callback(new Error(cacheErrorMessage));
      });

      // when
      const result = skillRepository.getFromCompetenceId(competenceId);

      // then
      cache.get.restore();
      expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      done();
    });

    it('should resolve skills directly retrieved from the cache without calling Airtable when the challenge has been cached', function(done) {
      // given
      getRecords.resolves(true);
      const expectedSkills = new Set(['web1', 'web2', 'web3']);
      cache.set(cacheKey, expectedSkills);

      // when
      const result = skillRepository.getFromCompetenceId(competenceId);

      // then
      expect(getRecords.notCalled).to.be.true;
      expect(result).to.eventually.deep.equal(expectedSkills);
      done();
    });

    describe('when skills have not been previously cached', function() {

      beforeEach(function() {
        getRecords.resolves(challenges);
      });

      it('should resolve skills with the challenges fetched from Airtable', function(done) {
        // when
        const result = skillRepository.getFromCompetenceId(competenceId);

        // then
        const expectedSkills = new Set(['web1', 'web2', 'web3']);
        expect(result).to.eventually.deep.equal(expectedSkills);
        done();
      });

      it('should cache the challenges fetched from Airtable', function(done) {
        // when
        skillRepository.getFromCompetenceId(competenceId).then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
            done();
          });
        });
      });

      it('should query correctly Airtable', function(done) {
        // given
        const expectedQuery = {};

        // when
        skillRepository.getFromCompetenceId(competenceId).then(() => {

          // then
          expect(getRecords.calledWith('Epreuves', expectedQuery, challengeSerializer)).to.be.true;
          done();
        });
      });
    });

  });

});
