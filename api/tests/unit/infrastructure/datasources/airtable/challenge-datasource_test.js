const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const challengeRawAirTableFixture = require('../../../../fixtures/infrastructure/challengeRawAirTableFixture');
const airTableDataModels = require('../../../../../lib/infrastructure/datasources/airtable/models');

describe('Unit | Infrastructure | Datasource | Airtable | ChallengeDatasource', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
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
  });
});
