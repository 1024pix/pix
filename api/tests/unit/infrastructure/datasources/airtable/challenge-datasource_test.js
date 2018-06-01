const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const AirtableError = require('airtable').Error;
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const challengeRawAirTableFixture = require('../../../../fixtures/infrastructure/challengeRawAirTableFixture');

const airTableDataModels = require('../../../../../lib/infrastructure/datasources/airtable/objects');

describe('Unit | Infrastructure | Datasource | Airtable | ChallengeDatasource', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(airtable, 'findRecords').resolves([challengeRawAirTableFixture(), challengeRawAirTableFixture()]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#get', () => {

    it('should call airtable on Epreuves table with the id and return a datamodel Challenge object', () => {
      // given
      sandbox.stub(airtable, 'newGetRecord').resolves(challengeRawAirTableFixture());

      // when
      const promise = challengeDatasource.get('243');

      // then
      return promise.then((challenge) => {
        expect(airtable.newGetRecord).to.have.been.calledWith('Epreuves', '243');

        expect(challenge).to.be.an.instanceof(airTableDataModels.Challenge);
        expect(challenge.id).to.equal('recwWzTquPlvIl4So');
        expect(challenge.type).to.equal('QCM');
      });
    });

    context('when airtable client throw an error', () => {

      it('should reject with a specific error when resource not found', () => {
        // given
        sandbox.stub(airtable, 'newGetRecord').rejects(new AirtableError('NOT_FOUND'));

        // when
        const promise = challengeDatasource.get('243');

        // then
        return expect(promise).to.have.been.rejectedWith(airTableDataModels.AirtableResourceNotFound);
      });

      it('should reject with the original error in any other case', () => {
        // given
        sandbox.stub(airtable, 'newGetRecord').rejects(new AirtableError('SERVICE_UNAVAILABLE'));

        // when
        const promise = challengeDatasource.get('243');

        // then
        return expect(promise).to.have.been.rejectedWith(new AirtableError('SERVICE_UNAVAILABLE'));
      });

    });

  });

  describe('#findBySkills', () => {

    it('should query Airtable challenges with skills', () => {
      // given
      const skills = ['@web1', '@web2'];

      // when
      const promise = challengeDatasource.findBySkills(skills);

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Epreuves', {
          filterByFormula: 'AND(OR(FIND("@web1", {acquis}), FIND("@web2", {acquis})), ' +
          'OR({Statut}="validé",{Statut}="validé sans test",{Statut}="pré-validé"))'
        });
      });

    });

    it('should resolve an array of Challenge from airTable', () => {
      // given
      const skills = ['@web1', '@web2'];

      // when
      const promise = challengeDatasource.findBySkills(skills);

      // then
      return promise.then((result) => {
        expect(result).to.be.an('array').and.to.have.lengthOf(2);
        expect(result[0]).to.be.an.instanceOf(airTableDataModels.Challenge);
      });

    });

  });
});
