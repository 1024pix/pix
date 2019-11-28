const { expect, sinon, domainBuilder } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const competenceDatasource = require('../../../../../lib/infrastructure/datasources/airtable/competence-datasource');
const competenceRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/competenceRawAirTableFixture');
const { Competence } = require('../../../../../lib/infrastructure/datasources/airtable/objects');

describe('Unit | Infrastructure | Datasource | Airtable | CompetenceDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Competence from the AirtableRecord', () => {
      // given
      const expectedCompetence = domainBuilder.buildCompetenceAirtableDataObject();

      // when
      const area = competenceDatasource.fromAirTableObject(competenceRawAirTableFixture());

      // then
      expect(area).to.be.an.instanceof(Competence);
      expect(area).to.deep.equal(expectedCompetence);
    });
  });

  describe('#get', () => {

    it('should call airtable on Competences table with the id and return a Competence data object', async () => {
      // given
      sinon.stub(airtable, 'getRecord')
        .withArgs('Competences', 'recsvLz0W2ShyfD63')
        .resolves(competenceRawAirTableFixture());

      // when
      const competence = await competenceDatasource.get('recsvLz0W2ShyfD63');

      // then
      expect(competence).to.be.an.instanceof(Competence);
      expect(competence.id).to.equal('recsvLz0W2ShyfD63');
      expect(competence.name).to.equal('Mener une recherche et une veille d’information');
    });
  });

  describe('#list', () => {

    it('should call airtable on Competences table to retrieve all Competences', async () => {
      // given
      sinon.stub(airtable, 'findRecords')
        .withArgs('Competences', competenceDatasource.usedFields)
        .resolves([ competenceRawAirTableFixture() ]);

      // when
      const competences = await competenceDatasource.list();

      // then
      expect(competences[0]).to.be.an.instanceof(Competence);
      expect(competences[0].id).to.equal('recsvLz0W2ShyfD63');
      expect(competences[0].name).to.equal('Mener une recherche et une veille d’information');
    });
  });
});
