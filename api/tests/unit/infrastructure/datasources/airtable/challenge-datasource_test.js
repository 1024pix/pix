const { expect, sinon, factory } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const AirtableError = require('airtable').Error;
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const challengeRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/challengeRawAirTableFixture');
const airTableDataModels = require('../../../../../lib/infrastructure/datasources/airtable/objects');
const _ = require('lodash');

describe('Unit | Infrastructure | Datasource | Airtable | ChallengeDatasource', () => {

  let sandbox;

  const competence1 = factory.buildCompetence(),
        competence2 = factory.buildCompetence();

  const challenge_competence1 = challengeRawAirTableFixture({
          id: 'challenge-competence1',
          fields: { competences: [ competence1.id ], acquis: [ '@web1' ] }
        }),
        challenge_competence1_noSkills = challengeRawAirTableFixture({
          id: 'challenge-competence1-noSkills',
          fields: { competences: [ competence1.id ], acquis: undefined }
        }),
        challenge_competence1_notValidated = challengeRawAirTableFixture({
          id: 'challenge-competence1-notValidated',
          fields: { competences: [ competence1.id ], acquis: [ '@web1' ], Statut: 'proposé' }
        }),
        challenge_competence2 = challengeRawAirTableFixture({
          id: 'challenge-competence2',
          fields: { competences: [ competence2.id ] }
        }),
        challenge_web1 = challengeRawAirTableFixture({
          id: 'challenge-web1',
          fields: { acquis: [ '@web1' ] }
        }),
        challenge_web2 = challengeRawAirTableFixture({
          id: 'challenge-web2',
          fields: { acquis: [ '@web2' ] }
        })
        ;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#list', () => {

    let promise;

    beforeEach(() => {
      // when
      sandbox.stub(airtable, 'findRecords').resolves([
        challenge_competence1,
        challenge_competence1_notValidated,
      ]);
      promise = challengeDatasource.list();
    });

    it('should query Airtable challenges with empty query', () => {
      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Epreuves', {});
      });
    });

    it('should resolve an array of Challenge from airTable', () => {
      // then
      return promise.then((result) => {
        expect(result).to.be.an('array').and.to.have.lengthOf(2);
        expect(result[0]).to.be.an.instanceOf(airTableDataModels.Challenge);
      });
    });
  });

  describe('#get', () => {

    it('should call airtable on Epreuves table with the id and return a datamodel Challenge object', () => {
      // given
      sandbox.stub(airtable, 'getRecord').resolves(challengeRawAirTableFixture());

      // when
      const promise = challengeDatasource.get('243');

      // then
      return promise.then((challenge) => {
        expect(airtable.getRecord).to.have.been.calledWith('Epreuves', '243');

        expect(challenge).to.be.an.instanceof(airTableDataModels.Challenge);
        expect(challenge.id).to.equal('recwWzTquPlvIl4So');
        expect(challenge.type).to.equal('QCM');
      });
    });

    context('when airtable client throw an error', () => {

      it('should reject with a specific error when resource not found', () => {
        // given
        sandbox.stub(airtable, 'getRecord').rejects(new AirtableError('NOT_FOUND'));

        // when
        const promise = challengeDatasource.get('243');

        // then
        return expect(promise).to.have.been.rejectedWith(airTableDataModels.AirtableResourceNotFound);
      });

      it('should reject with the original error in any other case', () => {
        // given
        sandbox.stub(airtable, 'getRecord').rejects(new AirtableError('SERVICE_UNAVAILABLE'));

        // when
        const promise = challengeDatasource.get('243');

        // then
        return expect(promise).to.have.been.rejectedWith(new AirtableError('SERVICE_UNAVAILABLE'));
      });
    });
  });

  describe('#findBySkillNames', () => {

    beforeEach(() => {
      sandbox.stub(airtable, 'findRecords').resolves([
        challenge_web1,
        challenge_web2,
      ]);
    });

    it('should query Airtable challenges with skill names', () => {
      // given
      const skillNames = ['@web1', '@web2'];

      // when
      const promise = challengeDatasource.findBySkillNames(skillNames);

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Epreuves', {
          filterByFormula: 'AND(' +
                           'OR(' +
                           'FIND("@web1", ARRAYJOIN({acquis}, ";")), ' +
                           'FIND("@web2", ARRAYJOIN({acquis}, ";"))' +
                           '), ' +
                           'OR(' +
                           '{Statut}="validé",' +
                           '{Statut}="validé sans test",' +
                           '{Statut}="pré-validé"' +
                           ')' +
                           ')',
        });
      });
    });

    it('should resolve an array of Challenge from airTable', () => {
      // given
      const skillNames = ['@web1', '@web2'];

      // when
      const promise = challengeDatasource.findBySkillNames(skillNames);

      // then
      return promise.then((result) => {
        expect(result[0]).to.be.an.instanceOf(airTableDataModels.Challenge);
        expect(_.map(result, 'id')).to.deep.equal([
          "challenge-web1",
          "challenge-web2",
        ]);
      });
    });
  });

  describe('#findByCompetence', () => {

    let promise;

    beforeEach(() => {
      // given
      sandbox.stub(airtable, 'findRecords').resolves([
        challenge_competence1,
        challenge_competence1_noSkills,
        challenge_competence1_notValidated,
        challenge_competence2,
      ]);

      // when
      promise = challengeDatasource.findByCompetence(competence1);
    });

    it('should resolve to an array of matching Challenges from airTable', () => {
      // then
      return promise.then((result) => {
        expect(result[0]).to.be.an.instanceOf(airTableDataModels.Challenge);
        expect(_.map(result, 'id')).to.deep.equal([ "challenge-competence1" ]);
      });
    });
  });
});
