const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const airTableDataModels = require('../../../../../lib/infrastructure/datasources/airtable/objects');
const tutorialDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const tutorialRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/tutorialRawAirtableFixture');
const AirtableRecord = require('airtable').Record;
const { Tutorial } = require('../../../../../lib/infrastructure/datasources/airtable/objects');
const _ = require('lodash');

function makeAirtableFake(records) {
  return async (tableName, fieldList) => {
    return records.map((record) => new AirtableRecord(tableName, record.id,
      {
        id: record.id,
        fields: _.pick(record._rawJson.fields, fieldList)
      }));
  };
}

describe('Unit | Infrastructure | Datasource | Airtable | TutorialDatasource', () => {

  describe('#findByRecordIds', () => {

    it('should return an array of airtable tutorial data objects', function() {
      // given
      const rawTutorial1 = tutorialRawAirTableFixture();
      rawTutorial1.id = 'FAKE_REC_ID_RAW_TUTORIAL_1' ;

      const rawTutorial2 = tutorialRawAirTableFixture();
      rawTutorial2.id = 'FAKE_REC_ID_RAW_TUTORIAL_2' ;

      const rawTutorial3 = tutorialRawAirTableFixture();
      rawTutorial3.id = 'FAKE_REC_ID_RAW_TUTORIAL_3' ;

      const records = [rawTutorial1, rawTutorial2, rawTutorial3];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));

      // when
      const promise = tutorialDatasource.findByRecordIds([rawTutorial1.id, rawTutorial3.id]);

      // then
      return promise.then((foundTutorials) => {
        expect(foundTutorials).to.be.an('array');
        expect(foundTutorials[0]).to.be.an.instanceOf(Tutorial);
        expect(foundTutorials[1]).to.be.an.instanceOf(Tutorial);
        expect(_.map(foundTutorials, 'id')).to.deep.equal([rawTutorial1.id, rawTutorial3.id]);
        expect(airtable.findRecords).to.have.been.calledWith('Tutoriels');

      });
    });
  });
  
  describe('#get', () => {

    it('should call airtable on Tutoriels table with the id and return a datamodel Tutorial object', () => {
      // given
      const givenAirtableTutorial = tutorialRawAirTableFixture();
      sinon.stub(airtable, 'getRecord').resolves(givenAirtableTutorial);

      // when
      const promise = tutorialDatasource.get(givenAirtableTutorial.getId());

      // then
      return promise.then((tuto) => {
        expect(airtable.getRecord).to.have.been.calledWith('Tutoriels', givenAirtableTutorial.getId());

        expect(tuto).to.be.an.instanceof(airTableDataModels.Tutorial);
        expect(tuto.title).to.equal(givenAirtableTutorial.fields['Titre']);
        expect(tuto.source).to.equal(givenAirtableTutorial.fields['Source']);
      });
    });
  });
});
