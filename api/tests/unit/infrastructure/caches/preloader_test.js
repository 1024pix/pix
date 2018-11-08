const { expect, sinon } = require('../../../test-helper');
const AirtableRecord = require('airtable').Record;
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/caches/cache');
const preloader = require('../../../../lib/infrastructure/caches/preloader');

describe('Unit | Infrastructure | preloader', () => {

  const airtableSkill_1 = new AirtableRecord('Acquis', 'recSkill1', { fields: { 'Nom': '@skill1' } });
  const airtableSkill_2 = new AirtableRecord('Acquis', 'recSkill2', { fields: { 'Nom': '@skill2' } });

  const airtableArea_1 = new AirtableRecord('Domaines', 'recArea1', {
    fields: {
      'Nom': '1. Information et données',
      'Code': '1',
      'Titre': 'Information et données'
    }
  });
  const airtableArea_2 = new AirtableRecord('Domaines', 'recArea2', {
    fields: {
      'Nom': '2. Communication et collaboration',
      'Code': '2',
      'Titre': 'Communication et collaboration'
    }
  });

  const airtableCompetence_1 = new AirtableRecord('Competences', 'recCompetence1', {
    fields: {
      'Titre': 'Mener une recherche d’information',
      'Sous-domaine': '1.1',
      'Tests Record ID': ['recAY0W7x9urA11OLZJJ'],
      'Acquis': ['@url2', '@url5', '@utiliserserv6'],
      'Domaine': ['recArea'],
      'Domaine Code': ['1'],
      'Domaine Titre': ['Information et données'],
    }
  });
  const airtableCompetence_2 = new AirtableRecord('Competences', 'recCompetence2', {
    fields: {
      'Titre': 'Gérer des données',
      'Sous-domaine': '1.2',
      'Tests Record ID': ['recAY0W7x9urA11OLZJJ'],
      'Acquis': ['@url2', '@url5', '@utiliserserv6'],
      'Domaine': ['recArea'],
      'Domaine Code': ['1'],
      'Domaine Titre': ['Information et données'],
    }
  });

  const airtableProgressionCourse = new AirtableRecord('Tests', 'recProgressionCourse', {
    fields: {
      'Nom': 'Test de positionnement 1.1',
      'Description': 'A single line of text.',
      'Adaptatif ?': true,
      'Competence': ['recCompetence1'],
      'Image': ['https://dl.airtable.com/foo.jpg'],
      'Épreuves': ['recChallenge1']
    }
  });
  const airtableAdaptiveCourse = new AirtableRecord('Tests', 'recAdaptiveCourse', {
    fields: {
      'Nom': 'Gérer des données 1.2',
      'Description': 'A single line of text.',
      'Adaptatif ?': false,
      'Competence': ['recCompetence2'],
      'Image': ['https://dl.airtable.com/foo.jpg'],
      'Épreuves': ['recChallenge2']
    }
  });
  const airtableWeekCourse = new AirtableRecord('Tests', 'recWeekCourse', {
    fields: {
      'Nom': 'Création de contenu 1.3',
      'Description': 'A single line of text.',
      'Adaptatif ?': false,
      'Competence': ['recCompetence3'],
      'Image': ['https://dl.airtable.com/foo.jpg'],
      'Épreuves': ['recChallenge3']
    }
  });

  const airtableChallenge_1 = new AirtableRecord('Epreuves', 'recChallenge1', {
    fields: {
      'Consigne': 'Instruction #1',
      'Propositions': 'Proposal #1',
      'Statut': 'validé'
    }
  });
  const airtableChallenge_2 = new AirtableRecord('Epreuves', 'recChallenge2', {
    fields: {
      'Consigne': 'Instruction #2',
      'Propositions': 'Proposal #2',
      'Statut': 'pré-validé'
    }
  });

  const airtableTutorial = new AirtableRecord('Tutoriels', 'recTutorial', {
    fields: {
      'Titre': 'Les formats de cellule',
      'Format': 'page',
      'Durée': '00:02:00',
      'Source': '2i2l',
      'Lien': 'http://www.2i2l.fr/spip.php?article137',
    }
  });

  beforeEach(() => {
    sinon.stub(airtable, 'findRecordsSkipCache');
    sinon.stub(airtable, 'getRecordSkipCache');
    sinon.stub(cache, 'set').resolves();
  });

  afterEach(() => {
    airtable.findRecordsSkipCache.restore();
    airtable.getRecordSkipCache.restore();
    cache.set.restore();
  });

  describe('#loadAllTables', () => {
    let promise = null;

    beforeEach(() => {
      // given
      airtable.findRecordsSkipCache
        .withArgs('Acquis')
        .resolves([ airtableSkill_1, airtableSkill_2 ]);

      airtable.findRecordsSkipCache
        .withArgs('Domaines')
        .resolves([ airtableArea_1, airtableArea_2 ]);

      airtable.findRecordsSkipCache
        .withArgs('Epreuves')
        .resolves([ airtableChallenge_1, airtableChallenge_2 ]);

      airtable.findRecordsSkipCache
        .withArgs('Competences')
        .resolves([ airtableCompetence_1, airtableCompetence_2 ]);

      airtable.findRecordsSkipCache
        .withArgs('Tests')
        .resolves([ airtableProgressionCourse, airtableAdaptiveCourse, airtableWeekCourse ]);

      airtable.findRecordsSkipCache
        .withArgs('Tutoriels')
        .resolves([ airtableTutorial ]);

      promise = preloader.loadAllTables();
    });

    it('should fetch skills and cache them individually', () => {
      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(cache.set).to.have.been.calledWith('Acquis_recSkill1', airtableSkill_1._rawJson);
          expect(cache.set).to.have.been.calledWith('Acquis_recSkill2', airtableSkill_2._rawJson);
        });
    });

    it('should fetch all areas and cache them individually', () => {
      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(cache.set).to.have.been.calledWith('Domaines_recArea1', airtableArea_1._rawJson);
          expect(cache.set).to.have.been.calledWith('Domaines_recArea2', airtableArea_2._rawJson);
        });
    });

    it('should fetch all challenges and cache them individually', () => {
      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(cache.set).to.have.been.calledWith('Epreuves_recChallenge1', airtableChallenge_1._rawJson);
          expect(cache.set).to.have.been.calledWith('Epreuves_recChallenge2', airtableChallenge_2._rawJson);
        });
    });

    it('should fetch all competences and cache them individually', () => {
      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(cache.set).to.have.been.calledWith('Competences_recCompetence1', airtableCompetence_1._rawJson);
          expect(cache.set).to.have.been.calledWith('Competences_recCompetence2', airtableCompetence_2._rawJson);
        });
    });

    it('should fetch courses and cache them individually', () => {
      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(cache.set).to.have.been.calledWith('Tests_recProgressionCourse', airtableProgressionCourse._rawJson);
          expect(cache.set).to.have.been.calledWith('Tests_recAdaptiveCourse', airtableAdaptiveCourse._rawJson);
          expect(cache.set).to.have.been.calledWith('Tests_recWeekCourse', airtableWeekCourse._rawJson);
        });
    });

    it('should fetch tutorials and cache them individually', () => {
      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(cache.set).to.have.been.calledWith('Tutoriels_recTutorial', airtableTutorial._rawJson);
        });
    });
  });

  describe('#load', () => {
    let promise = null;

    context('When the key is a table',() => {
      beforeEach(() => {
        // given
        airtable.findRecordsSkipCache
          .withArgs('Epreuves')
          .resolves([ airtableChallenge_1, airtableChallenge_2 ]);

        return promise = preloader.load({ tableName: 'Epreuves' });
      });

      it('For table "Epreuves", should fetch all challenges and cache them individually', () => {
        // then
        return promise
          .then(() => {
            expect(cache.set).to.have.been.calledWith('Epreuves_recChallenge1', airtableChallenge_1._rawJson);
            expect(cache.set).to.have.been.calledWith('Epreuves_recChallenge2', airtableChallenge_2._rawJson);
          });
      });
    });

    context('When the key is a record',() => {
      beforeEach(() => {
        // given
        airtable.getRecordSkipCache
          .withArgs('Epreuves', 'recChallenge1')
          .resolves(airtableChallenge_1);

        return promise = preloader.load({ tableName: 'Epreuves', recordId: 'recChallenge1' });
      });

      it('For record "Epreuves_recChallenge1", should fetch only the challenge', () => {
        // then
        return promise
          .then(() => {
            expect(airtable.getRecordSkipCache).to.have.been.calledWith('Epreuves', 'recChallenge1');
            expect(airtable.getRecordSkipCache).to.not.have.been.calledWith('Epreuves', 'recChallenge2');
          });
      });

    });

  });

});
