const { expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/cache');

const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

describe('Unit | Repository | competence-repository', function() {

  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    sandbox.stub(cache, 'get');
    sandbox.stub(cache, 'set');
    sandbox.stub(airtable, 'getRecord');
    sandbox.stub(airtable, 'getRecords');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#list', () => {

    const competenceRecords = [{
      id: 'recsvLDFHShyfDXXXXX',
      name: '1.1 Mener une recherche d’information',
      areaId: 'recvoGdo0z0z0pXWZ',
      courseId: 'Test de positionnement 1.1'
    }, {
      id: 'recsvLDFHShyfDXXXXX',
      name: '1.1 Mener une recherche d’information',
      areaId: 'recvoGdo0z0z0pXWZ',
      courseId: 'Test de positionnement 1.2'
    }];

    context('when records have not been cached', () => {

      beforeEach(() => {
        cache.get.returns();
        cache.set.returns();
      });

      it('should fetch Competences from Airtable', () => {
        // given
        airtable.getRecords.resolves(competenceRecords);

        // when
        const promise = competenceRepository.list();

        // then
        return promise.then((competencesFetched) => {
          expect(competencesFetched).to.deep.equal(competenceRecords);
        });
      });

      it('should set in cache the fetched Competences', () => {
        // given
        airtable.getRecords.resolves(competenceRecords);

        // when
        const promise = competenceRepository.list();

        // then
        return promise.then(() => {
          expect(cache.set).to.have.been.calledWith('competence-repository_list', competenceRecords);
        });
      });

      it('should throw an error when Airtable call fails', (done) => {
        // given
        airtable.getRecords.rejects(new Error('some error'));

        // when
        const promise = competenceRepository.list();

        // then
        promise.catch(err => {
          expect(err).to.exist;
          done();
        });
      });

    });

    context('when records have been cached', () => {

      it('should retrieve records directly from the cache', () => {
        // given
        cache.get.returns(competenceRecords);

        // when
        const promise = competenceRepository.list();

        return promise.then((competencesFetched) => {
          // then
          expect(competencesFetched).to.equal(competenceRecords);
          expect(cache.get).to.have.been.calledWith('competence-repository_list');
        });
      });

    });

  });

  describe('#get', () => {

    const competence = {
      id: 'recsvLz0W2ShyfD63',
      name: '1.1 Mener une recherche d’information',
      areaId: 'recvoGdo0z0z0pXWZ',
      courseId: 'Test de positionnement 1.1'
    };

    context('when record has not been cached', () => {

      beforeEach(() => {
        cache.get.returns();
        cache.set.returns();
      });

      it('should fetch Competence from Airtable filtered by its Record ID', () => {
        // given
        airtable.getRecord.resolves(competence);

        // when
        const promise = competenceRepository.get(competence.id);

        // then
        return promise.then((fetchedCompetence) => {
          expect(airtable.getRecord).to.have.been.calledWith('Competences', competence.id);
          expect(fetchedCompetence).to.deep.equal(competence);
        });
      });

      it('should set in cache the fetched Competence', () => {
        // given
        airtable.getRecord.resolves(competence);

        // when
        const promise = competenceRepository.get(competence.id);

        // then
        return promise.then((fetchedCompetence) => {
          expect(cache.set).to.have.been.calledWith(`competence-repository_get_${competence.id}`, fetchedCompetence);
        });
      });

      it('should throw an error when Airtable call fails', (done) => {
        // given
        airtable.getRecord.rejects(new Error('some error'));

        // when
        const promise = competenceRepository.get(competence.id);

        // then
        promise.catch(err => {
          expect(err).to.exist;
          done();
        });
      });

    });

    context('when record has been cached', () => {

      it('should retrieve records directly from the cache', () => {
        // given
        cache.get.returns(competence);

        // when
        const promise = competenceRepository.get(competence.id);

        // then
        return promise.then((fetchedCompetence) => {
          expect(fetchedCompetence).to.deep.equal(competence);
        });
      });

    });

  });

});
