const _ = require('lodash');
const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const tutorialDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const tutorialAirtableDataObjectFixture = require('../../../../tooling/fixtures/infrastructure/tutorialAirtableDataObjectFixture');
const tutorialRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/tutorialRawAirtableFixture');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');
const makeAirtableFake = require('../../../../tooling/airtable-builder/make-airtable-fake');

describe('Unit | Infrastructure | Datasource | Airtable | TutorialDatasource', () => {

  beforeEach(() => {
    sinon.stub(cache, 'get').callsFake((key, generator) => generator());
  });

  describe('#fromAirTableObject', () => {

    it('should create a Tutorial from the AirtableRecord', () => {
      // given
      const expectedTuto = tutorialAirtableDataObjectFixture();

      // when
      const tuto = tutorialDatasource.fromAirTableObject(tutorialRawAirTableFixture());

      // then
      expect(tuto).to.deep.equal(expectedTuto);
    });
  });

  describe('#findByRecordIds', () => {

    it('should return an array of airtable tutorial data objects', function() {
      // given
      const rawTutorial1 = tutorialRawAirTableFixture();
      rawTutorial1.id = 'FAKE_REC_ID_RAW_TUTORIAL_1';
      rawTutorial1.fields.id = rawTutorial1.id;

      const rawTutorial2 = tutorialRawAirTableFixture();
      rawTutorial2.id = 'FAKE_REC_ID_RAW_TUTORIAL_2';
      rawTutorial2.fields.id = rawTutorial2.id;

      const rawTutorial3 = tutorialRawAirTableFixture();
      rawTutorial3.id = 'FAKE_REC_ID_RAW_TUTORIAL_3';
      rawTutorial3.fields.id = rawTutorial3.id;

      const records = [rawTutorial1, rawTutorial2, rawTutorial3];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));

      // when
      const promise = tutorialDatasource.findByRecordIds([rawTutorial1.id, rawTutorial3.id]);

      // then
      return promise.then((foundTutorials) => {
        expect(foundTutorials).to.be.an('array');
        expect(_.map(foundTutorials, 'id')).to.deep.equal([rawTutorial1.id, rawTutorial3.id]);
        expect(airtable.findRecords).to.have.been.calledWith('Tutoriels');
      });
    });
  });

});
