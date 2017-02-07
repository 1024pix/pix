const { describe, it, before, after, beforeEach, afterEach, expect, sinon } = require('../../../test-helper');

const Airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');

const ChallengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../../../lib/infrastructure/serializers/airtable/challenge-serializer');

describe('Unit | Repository | challenge-repository', function () {

  let stub;

  beforeEach(function () {
    cache.flushAll();
    stub = sinon.stub(Airtable, 'base');
  });

  afterEach(function () {
    cache.flushAll();
    stub.restore();
  });

  /*
   * #list()
   */

  describe('#list()', function () {

    describe('when the challenges have been previously fetched and cached', function () {

      it('should return the challenges directly retrieved from the cache', function () {
        // given
        const cacheKey = 'challenge-repository_list';
        const cachedValue = [{ challenge: '1' }, { challenge: '2' }, { challenge: '3' }];
        cache.set(cacheKey, cachedValue);

        // when
        const result = ChallengeRepository.list();

        // then
        return expect(result).to.eventually.deep.equal(cachedValue);
      });

      it('should not make call to Airtable', function () {
        expect(stub.called).to.be.false;
      });

    });

    describe('when the cache throw an error', function () {

      const cacheErrorMessage = 'Cache error';

      before(function () {
        sinon.stub(cache, 'get', (key, callback) => {
          callback(new Error(cacheErrorMessage));
        });
      });

      after(function () {
        cache.get.restore();
      });

      it('should reject with thrown error', function () {
        // when
        const result = ChallengeRepository.list();

        // then
        return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      });

    });

    describe('when the challenges have not been previously cached', function () {

      const record_1 = { id: 'challenge_1' };
      const record_2 = { id: 'challenge_2' };
      const record_3 = { id: 'challenge_3' };
      const records = [record_1, record_2, record_3];

      beforeEach(function () {
        stub.returns({
          select() {
            return {
              eachPage(pageCallback, cb) {
                pageCallback(records, cb);
              }
            };
          }
        });
      });

      it('should return the challenges fetched from Airtable', function () {
        // given
        const challenges = [
          challengeSerializer.deserialize(record_1),
          challengeSerializer.deserialize(record_2),
          challengeSerializer.deserialize(record_3)
        ];

        // when
        const result = ChallengeRepository.list();

        // then
        return expect(result).to.eventually.deep.equal(challenges);
      });

      it('should store the challenge in the cache', function () {
        // given
        const cacheKey = 'challenge-repository_list';

        // when
        ChallengeRepository.list().then(() => {

          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
          });
        });
      });
    });

  });

  /*
   * #get(id)
   */

  describe('#get(id)', function () {

    describe('when the challenge has been previously fetched and cached', function () {

      it('should return the challenge directly retrieved from the cache', function () {
        // given
        const challengeId = 'challengeId';
        const cacheKey = `challenge-repository_get_${challengeId}`;
        const cachedValue = { foo: 'bar' };
        cache.set(cacheKey, cachedValue);

        // when
        const result = ChallengeRepository.get(challengeId);

        // then
        return expect(result).to.eventually.deep.equal(cachedValue);
      });

      it('should not make call to Airtable', function () {
        expect(stub.called).to.be.false;
      });

    });

    describe('when the cache throw an error', function () {

      const cacheErrorMessage = 'Cache error';

      before(function () {
        sinon.stub(cache, 'get', (key, callback) => {
          callback(new Error(cacheErrorMessage));
        });
      });

      after(function () {
        cache.get.restore();
      });

      it('should reject with thrown error', function () {
        // when
        const result = ChallengeRepository.get('challenge_id');

        // then
        return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      });

    });

    describe('when the challenge has not been previously cached', function () {

      const record = {
        id: 'challenge_id',
        fields: {
          'Consigne': 'Citez jusqu\'à 3 moteurs de recherche généralistes.',
          'Propositions': '${moteur 1}\n${moteur 2}\n${moteur 3}',
          'Type d\'épreuve': 'QROCM',
          'Bonnes réponses': '${moteur 1} ou ${moteur 2} ou ${moteur 3} = \nGoogle\nBing\nQwant\nDuckduckgo\nYahoo\nYahoo Search\nLycos\nAltavista\nHotbot'
        }
      };

      beforeEach(function () {
        stub.returns({
          find(id, callback) {
            if (record.id !== id) callback(new Error());
            return callback(null, record);
          }
        });
      });

      it('should return the challenge fetched from Airtable', function () {
        // given
        const challenge = challengeSerializer.deserialize(record);

        // when
        const result = ChallengeRepository.get(challenge.id);

        // then
        return expect(result).to.eventually.deep.equal(challenge);
      });

      it('should store the challenge in the cache', function () {
        // given
        const challengeId = 'challenge_id';

        // when
        ChallengeRepository.get(challengeId);

        cache.get(`challenge-repository_get_${challengeId}`, (err, cachedValue) => {
          expect(cachedValue).to.exist;
        });
      });
    });

  });

  /*
   * #refresh(id)
   */

  describe('#refresh(id)', function () {

    const record = {
      id: 'challenge_id',
      'fields': {
        'Consigne': 'Citez jusqu\'à 3 moteurs de recherche généralistes.',
        'Propositions': '${moteur 1}\n${moteur 2}\n${moteur 3}',
        'Type d\'épreuve': 'QROCM',
        'Bonnes réponses': '${moteur 1} ou ${moteur 2} ou ${moteur 3} = \nGoogle\nBing\nQwant\nDuckduckgo\nYahoo\nYahoo Search\nLycos\nAltavista\nHotbot'
      }
    };

    beforeEach(function () {
      stub.returns({
        find(id, callback) {
          if (record.id !== id) callback(new Error());
          return callback(null, record);
        }
      });
    });

    it('should return the challenge fetched from Airtable', function () {
      // given
      const challenge = challengeSerializer.deserialize(record);

      // when
      const result = ChallengeRepository.refresh(challenge.id);

      // then
      return expect(result).to.eventually.deep.equal(challenge);
    });

    it('should store the challenge in the cache', function () {
      // given
      const challengeId = 'challenge_id';

      // when
      ChallengeRepository.refresh(challengeId);

      // then
      cache.get(`challenge-repository_get_${challengeId}`, (err, cachedValue) => {
        expect(cachedValue).to.exist;
      });
    });

    describe('when the cache throw an error', function () {

      const cacheErrorMessage = 'Cache error';

      before(function () {
        sinon.stub(cache, 'del', (key, callback) => {
          callback(new Error(cacheErrorMessage));
        });
      });

      after(function () {
        cache.del.restore();
      });

      it('should reject with thrown error', function () {
        // when
        const result = ChallengeRepository.refresh('challenge_id');

        // then
        return expect(result).to.eventually.be.rejectedWith(cacheErrorMessage);
      });

    });

  });

})
;
