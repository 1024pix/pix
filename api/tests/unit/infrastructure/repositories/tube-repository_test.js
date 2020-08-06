const { expect, sinon } = require('../../../test-helper');
const AirtableRecord = require('airtable').Record;
const airtable = require('../../../../lib/infrastructure/airtable');
const Tube = require('../../../../lib/domain/models/Tube');
const tubeDatasource = require('../../../../lib/infrastructure/datasources/airtable/tube-datasource');
const tubeRepository = require('../../../../lib/infrastructure/repositories/tube-repository');

describe('Unit | Repository | tube-repository', () => {
  const rawTube1 = new AirtableRecord('Tubes', 'recTube1',{
    'id': 'recTube1',
    'fields': {
      'Nom': '@Moteur',
      'Titre': 'Moteur de recherche',
      'Description': 'Connaître le fonctionnement d\'un moteur de recherche',
      'Titre pratique': 'Outils d\'accès au web',
      'Description pratique': 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
      'Competences (id persistant)': [ 'recCompetence1' ],
    },
    'createdTime': '2018-01-31T12:41:07.000Z'
  });

  const rawTube2 = new AirtableRecord('Tubes', 'recTube2',{
    'id': 'recTube2',
    'fields': {
      'Nom': '@enregistrer',
      'Titre': 'Enregistrement',
      'Description': 'Enregistrer un document',
      'Titre pratique': 'Enregistrement',
      'Description pratique': 'Enregistrer un document',
      'Competences (id persistant)': [ 'recCompetence2' ],
    },
    'createdTime': '2018-01-31T12:48:07.000Z'
  });

  const tubeData1 = {
    id: 'recTube1',
    name: '@Moteur',
    title: 'Titre',
    description: 'Description',
    practicalTitleFrFr: 'Titre vulgarisé FR',
    practicalTitleEnUs: 'Titre vulgarisé EN',
    practicalDescriptionFrFr: 'Description vulgarisée 1 FR',
    practicalDescriptionEnUs: 'Description vulgarisée 1 EN',
    competenceId: 'recCompetence1',
  };

  const tubeData2 = {
    id: 'recTube2',
    name: '@enregistrer',
    title: 'Titre',
    description: 'Description',
    practicalTitleFrFr: 'Titre vulgarisé FR',
    practicalTitleEnUs: 'Titre vulgarisé EN',
    practicalDescriptionFrFr: 'Description vulgarisée 2 FR',
    practicalDescriptionEnUs: 'Description vulgarisée 2 EN',
    competenceId: 'recCompetence2',
  };

  beforeEach(() => {
    sinon.stub(tubeDatasource, 'findByNames');
    sinon.stub(tubeDatasource, 'list')
      .resolves([tubeData1, tubeData2]);
  });

  describe('#findByNames', function() {

    const tubeNames = ['name1', 'name2'];

    beforeEach(() => {
      const tube1 = {
        id: 'recTube1',
        name: tubeNames[0],
        title: 'Title 1',
        description: 'Description 1',
        practicalTitleFrFr: 'Practical Title 1 FR',
        practicalTitleEnUs: 'Practical Title 1 EN',
        practicalDescriptionFrFr: 'Description vulgarisée 1 FR',
        practicalDescriptionEnUs: 'Description vulgarisée 1 EN',
        competenceId: 'recCompetence1',
      };
      const tube2 = {
        id: 'recTube2',
        name: tubeNames[1],
        title: 'Title 2',
        description: 'Description 2',
        practicalTitleFrFr: 'Practical Title 2 FR',
        practicalTitleEnUs: 'Practical Title 2 EN',
        practicalDescriptionFrFr: 'Description vulgarisée 2 FR',
        practicalDescriptionEnUs: 'Description vulgarisée 2 EN',
        competenceId: 'recCompetence2',
      };

      tubeDatasource.findByNames.withArgs(tubeNames).resolves([tube1, tube2]);
    });

    it('should resolve tubes with matching tubeNames', async function() {
      //given
      const locale = 'fr';

      // when
      const foundTubes = await tubeRepository.findByNames({ tubeNames, locale });

      // then
      expect(foundTubes).to.have.lengthOf(2);
      expect(foundTubes[0]).to.be.instanceof(Tube);
      expect(foundTubes).to.be.deep.equal([
        {
          'description': 'Description 1',
          'id': 'recTube1',
          'name': 'name1',
          'practicalDescription': 'Description vulgarisée 1 FR',
          'practicalTitle': 'Practical Title 1 FR',
          'skills': [],
          'title': 'Title 1',
          'competenceId': 'recCompetence1',
        },
        {
          'description': 'Description 2',
          'id': 'recTube2',
          'name': 'name2',
          'practicalDescription': 'Description vulgarisée 2 FR',
          'practicalTitle': 'Practical Title 2 FR',
          'skills': [],
          'title': 'Title 2',
          'competenceId': 'recCompetence2',
        },
      ]);
    });
  });

  describe('#get', () => {
    beforeEach(() => {
      // given
      sinon.stub(tubeDatasource, 'get')
        .withArgs('recTube1')
        .resolves(tubeData1);
    });

    it('should return a domain Tube object', async () => {
      // given
      const expectedTube = new Tube({
        id: 'recTube1',
        name: '@Moteur',
        title: 'Titre',
        description: 'Description',
        practicalTitle: 'Titre vulgarisé FR',
        practicalDescription: 'Description vulgarisée 1 FR',
        competenceId: 'recCompetence1',
      });

      // when
      const fetchedTube = await tubeRepository.get('recTube1');

      // then
      expect(fetchedTube).to.be.an.instanceOf(Tube);
      expect(fetchedTube).to.deep.equal(expectedTube);
    });
  });

  describe('#list', () => {

    beforeEach(() => {
      sinon.stub(airtable, 'findRecords')
        .withArgs('Tubes')
        .resolves([rawTube2, rawTube1]);
    });

    it('should return domain Tube objects sorted by index', async () => {
      // when
      const tubes = await tubeRepository.list();

      // then
      expect(tubes).to.have.lengthOf(2);
      expect(tubes[0]).to.be.an.instanceOf(Tube);
      expect(tubes[0].name).to.equal('@enregistrer');
      expect(tubes[1].name).to.equal('@Moteur');
    });
  });

});
