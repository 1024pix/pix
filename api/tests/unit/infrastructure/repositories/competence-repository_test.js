const { describe, it, beforeEach, afterEach, expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');

const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const competenceSerializer = require('../../../../lib/infrastructure/serializers/airtable/competence-serializer');

describe('Unit | Repository | competence-repository', function() {

  let getRecordsStub;
  let cacheStub;
  const cacheKey = 'competence-repository_list';
  const competenceRecords = [
    {
      id: 'recsvLDFHShyfDXXXXX',
      name: '1.1 Mener une recherche d’information',
      areaId: 'recvoGdo0z0z0pXWZ'
    },
    {
      id: 'recsvLDFHShyfDXXXXX',
      name: '1.1 Mener une recherche d’information',
      areaId: 'recvoGdo0z0z0pXWZ'
    }];

  beforeEach(function() {
    cache.flushAll();
    cacheStub = sinon.stub(cache, 'get');
    getRecordsStub = sinon.stub(airtable, 'getRecords');
  });

  afterEach(function() {
    cacheStub.restore();
    cache.flushAll();
    getRecordsStub.restore();
  });

  describe('#List', () => {

    it('should be a method', function() {
      // then
      expect(competenceRepository.list).to.be.a('function');
    });

    it('should correctly query Airtable', () => {
      // Given
      cacheStub.callsArgWith(1, null, null);
      getRecordsStub.resolves({});
      // When
      const competencesPromise = competenceRepository.list();
      // Then
      return competencesPromise.then(() => {
        expect(getRecordsStub.calledWith('Competences', {}, competenceSerializer)).to.be.true;
      });
    });

    describe('When record has not been cached', () => {

      beforeEach(() => {
        sinon.spy(cache, 'set');
        getRecordsStub.resolves(competenceRecords);
      });

      afterEach(() => {
        cache.set.restore();
      });

      it('should fetch Competences from Airtable', () => {
        // When
        cacheStub.callsArgWith(1, null, null);
        const competencesPromise = competenceRepository.list();
        // Then
        return competencesPromise.then((competencesFetched) => {
          expect(competencesFetched).to.be.equal(competenceRecords);
        });
      });

      it('should cached previously fetched Competences', () => {
        // When
        cacheStub.callsArgWith(1, null, null);
        const competencesPromise = competenceRepository.list();
        // Then
        return competencesPromise.then((competencesFetched) => {
          expect(cache.set.getCall(0).args[0]).to.be.equal('competence-repository_list');
          expect(cache.set.getCall(0).args[1]).to.be.equal(competencesFetched);
        });
      });

    });

    describe('When record have been cached', () => {

      it('should retrieve records directly from cache', () => {
        // Given
        cacheStub.callsArgWith(1, null, competenceRecords);
        getRecordsStub.resolves(true);
        // When
        const promise = competenceRepository.list();

        return promise.then((competencesFetched) => {
          // Then
          expect(competencesFetched).to.be.equal(competenceRecords);
          sinon.assert.calledOnce(cacheStub);
          sinon.assert.calledWith(cacheStub, cacheKey);
        });
      });

    });

    describe('Error occured cases: ', () => {

      it('should throw an error, when something going wrong from cache', () => {
        // Given
        cacheStub.callsArgWith(1, new Error('Error on cache recuperation'));

        // When
        const cachedPromise = competenceRepository.list();

        return cachedPromise.catch((err) => {
          // Then
          expect(cachedPromise).to.be.rejectedWith(Error);
          expect(err.message).to.be.equal('Error on cache recuperation');
        });

      });

      it('should throw an error, when something going wrong from airtable', () => {
        // Given
        cacheStub.callsArgWith(1, null, null);

        getRecordsStub.rejects(new Error('Error on Airtable recuperation'));

        // When
        const cachedPromise = competenceRepository.list();

        return cachedPromise.catch((err) => {
          // Then
          expect(cachedPromise).to.be.rejectedWith(Error);
          expect(err.message).to.be.equal('Error on Airtable recuperation');
        });
      });

    });
  });
})
;
