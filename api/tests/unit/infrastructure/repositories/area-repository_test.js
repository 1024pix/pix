const {describe, it, beforeEach, afterEach, expect, sinon} = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');

const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');
const areaSerializer = require('../../../../lib/infrastructure/serializers/airtable/area-serializer');

describe('Unit | Repository | area-repository', function() {

  let getRecordsStub;

  beforeEach(function() {
    cache.flushAll();
    getRecordsStub = sinon.stub(airtable, 'getRecords');
  });

  afterEach(function() {
    cache.flushAll();
    getRecordsStub.restore();
  });

  describe('#list', function() {

    const cacheKey = 'area-repository_list';
    const areas = [
      {
        id: 1,
        name: 'Domaine 1'
      },
      {
        id: 2,
        name: 'Domaine 2'
      }
    ];

    it('should be a method', () => {
      expect(areaRepository.list).to.be.a('function');
    });

    it('should query Airtable correctly', () => {
      // Given
      getRecordsStub.resolves({});
      // When
      const fetchedAreas = areaRepository.list();

      return fetchedAreas.then(() => {
        // Then
        expect(getRecordsStub.calledWith('Domaines', {}, areaSerializer)).to.be.true;
      });
    });

    describe('When a record haven’t been cached', () => {

      beforeEach(() => {
        getRecordsStub.resolves(areas);
      });

      it('should fetch areas from Airtable', () => {
        // When
        const fetchedAreas = areaRepository.list();

        // then
        expect(fetchedAreas).to.eventually.equal(areas);
      });

      it('should cached previously fetched areas', () => {
        // When
        const promiseFetched = areaRepository.list();

        return promiseFetched.then(() => {
          // then
          cache.get(cacheKey, (err, cachedValue) => {
            expect(cachedValue).to.exist;
          });
        });

      });

    });

    describe('When a record is already cached', () => {

      it('should retrieve record directly from cache', () => {
        // Given
        cache.set('area-repository_list', areas);
        const cacheSpy = sinon.spy(cache, 'get');
        getRecordsStub.resolves(true);

        // When
        const cachedAreas = areaRepository.list();

        // Then
        return cachedAreas.then((result) => {
          expect(result).to.deep.equal(areas);
          sinon.assert.calledOnce(cacheSpy);
          sinon.assert.calledWith(cacheSpy, 'area-repository_list');
          cacheSpy.restore();
        });

      });

    });

    describe('Error occured cases: ', () => {

      beforeEach(() => {
        sinon.stub(cache, 'get');
      });
      afterEach(() => {
        cache.get.restore();
      });

      it('should throw an error, when something going wrong from cache', () => {
        // Given
        cache.get.callsArgWith(1, new Error('Error on cache recuperation'));

        // When
        const cachedPromise = areaRepository.list();

        return cachedPromise.catch((err) => {
          expect(cachedPromise).to.be.rejectedWith(Error);
          expect(err.message).to.be.equal('Error on cache recuperation');
        });

      });

      it('should throw an error, when something going wrong from airtable', () => {
        // Given
        cache.get.callsArgWith(1, null, null);

        getRecordsStub.rejects(new Error('Error on Airtable recuperation'));

        // When
        const cachedPromise = areaRepository.list();

        return cachedPromise.catch((err) => {
          // Then
          expect(cachedPromise).to.be.rejectedWith(Error);
          expect(err.message).to.be.equal('Error on Airtable recuperation');
        });
      });

    });
  });

});
