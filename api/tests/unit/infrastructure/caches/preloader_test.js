const { expect, sinon } = require('../../../test-helper');
const AirtableRecord = require('airtable').Record;
const airtable = require('../../../../lib/infrastructure/airtable');
const cache = require('../../../../lib/infrastructure/caches/cache');
const preloader = require('../../../../lib/infrastructure/caches/preloader');

describe('Unit | Infrastructure | preloader', () => {

  const no_filter = {};
  const filterByCompetence_1 = { filterByFormula: 'FIND(\'1.1\', {Compétence})' };
  const filterByCompetence_2 = { filterByFormula: 'FIND(\'1.2\', {Compétence})' };

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

  beforeEach(() => {
    sinon.stub(airtable, 'findRecords');
    sinon.stub(cache, 'set').resolves();
  });

  afterEach(() => {
    airtable.findRecords.restore();
    cache.set.restore();
  });

  describe('#loadAreas', () => {
    it('should fetch all areas and cache them individually', () => {
      // given
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

      airtable.findRecords.resolves([ airtableArea_1, airtableArea_2 ]);

      // when
      const promise = preloader.loadAreas();

      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(airtable.findRecords).to.have.been.calledWith('Domaines', no_filter);
          expect(cache.set).to.have.been.calledWith('Domaines_recArea1', airtableArea_1._rawJson);
          expect(cache.set).to.have.been.calledWith('Domaines_recArea2', airtableArea_2._rawJson);
        });
    });
  });

  describe('#loadChallenges', () => {
    it('should fetch all challenges, challenges by competence and cache them individually', () => {
      // given
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

      const filterChallengeByCompetence_1 = { view: '1.1 Mener une recherche d’information' };
      const filterChallengeByCompetence_2 = { view: '1.2 Gérer des données' };

      airtable.findRecords
        .withArgs('Competences', no_filter).resolves([ airtableCompetence_1, airtableCompetence_2 ])
        .withArgs('Epreuves', no_filter).resolves([ airtableChallenge_1, airtableChallenge_2 ])
        .withArgs('Epreuves', filterChallengeByCompetence_1).resolves([ airtableChallenge_1 ])
        .withArgs('Epreuves', filterChallengeByCompetence_2).resolves([ airtableChallenge_2 ]);

      // when
      const promise = preloader.loadChallenges();

      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(airtable.findRecords).to.have.been.calledWith('Epreuves', filterChallengeByCompetence_1);
          expect(airtable.findRecords).to.have.been.calledWith('Epreuves', filterChallengeByCompetence_2);
          expect(cache.set).to.have.been.calledWith('Epreuves_recChallenge1', airtableChallenge_1._rawJson);
          expect(cache.set).to.have.been.calledWith('Epreuves_recChallenge2', airtableChallenge_2._rawJson);
        });
    });
  });

  describe('#loadCompetences', () => {
    it('should fetch all competences and cache them individually', () => {
      // given
      const sortBySubdomain = {
        sort: [{ field: 'Sous-domaine', direction: 'asc' }]
      };
      airtable.findRecords.resolves([ airtableCompetence_1, airtableCompetence_2 ]);

      // when
      const promise = preloader.loadCompetences();

      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(airtable.findRecords).to.have.been.calledWith('Competences', no_filter);
          expect(airtable.findRecords).to.have.been.calledWith('Competences', sortBySubdomain);
          expect(cache.set).to.have.been.calledWith('Competences_recCompetence1', airtableCompetence_1._rawJson);
          expect(cache.set).to.have.been.calledWith('Competences_recCompetence2', airtableCompetence_2._rawJson);
        });
    });
  });

  describe('#loadCourses', () => {
    it('should fetch courses by view and cache them individually', () => {
      // given
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

      const filterWithPublishedProgressionCourses = {
        filterByFormula: '{Statut} = "Publié"',
        view: 'Tests de progression'
      };
      const filterWithPublishedAdaptiveCourses = {
        filterByFormula: '{Statut} = "Publié"',
        view: 'Tests de positionnement'
      };
      const filterWithPublishedWeekCourses = {
        filterByFormula: '{Statut} = "Publié"',
        view: 'Défis de la semaine'
      };

      airtable.findRecords
        .withArgs('Tests', filterWithPublishedProgressionCourses).resolves([ airtableProgressionCourse ])
        .withArgs('Tests', filterWithPublishedAdaptiveCourses).resolves([ airtableAdaptiveCourse ])
        .withArgs('Tests', filterWithPublishedWeekCourses).resolves([ airtableWeekCourse ]);

      // when
      const promise = preloader.loadCourses();

      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(airtable.findRecords).to.have.been.calledWith('Tests', filterWithPublishedProgressionCourses);
          expect(airtable.findRecords).to.have.been.calledWith('Tests', filterWithPublishedAdaptiveCourses);
          expect(airtable.findRecords).to.have.been.calledWith('Tests', filterWithPublishedWeekCourses);
          expect(cache.set).to.have.been.calledWith('Tests_recProgressionCourse', airtableProgressionCourse._rawJson);
          expect(cache.set).to.have.been.calledWith('Tests_recAdaptiveCourse', airtableAdaptiveCourse._rawJson);
          expect(cache.set).to.have.been.calledWith('Tests_recWeekCourse', airtableWeekCourse._rawJson);
        });
    });
  });

  describe('#loadSkills', () => {
    it('should fetch skills by competence and cache them individually', () => {
      // given
      const airtableSkill_1 = new AirtableRecord('Acquis', 'recSkill1', { fields: { 'Nom': '@skill1' } });
      const airtableSkill_2 = new AirtableRecord('Acquis', 'recSkill2', { fields: { 'Nom': '@skill2' } });

      airtable.findRecords
        .withArgs('Competences', no_filter).resolves([ airtableCompetence_1, airtableCompetence_2 ])
        .withArgs('Acquis', filterByCompetence_1).resolves([ airtableSkill_1 ])
        .withArgs('Acquis', filterByCompetence_2).resolves([ airtableSkill_2 ]);

      // when
      const promise = preloader.loadSkills();

      // then
      return expect(promise).to.have.been.fulfilled
        .then(() => {
          expect(airtable.findRecords).to.have.been.calledWith('Acquis', filterByCompetence_1);
          expect(airtable.findRecords).to.have.been.calledWith('Acquis', filterByCompetence_2);
          expect(cache.set).to.have.been.calledWith('Acquis_recSkill1', airtableSkill_1._rawJson);
          expect(cache.set).to.have.been.calledWith('Acquis_recSkill2', airtableSkill_2._rawJson);
        });
    });
  });

});
