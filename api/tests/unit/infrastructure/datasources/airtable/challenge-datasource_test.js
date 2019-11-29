const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const AirtableError = require('airtable').Error;
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const challengeAirtableDataObjectFixture = require('../../../../tooling/fixtures/infrastructure/challengeAirtableDataObjectFixture');
const challengeRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/challengeRawAirTableFixture');
const AirtableResourceNotFound = require('../../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');
const _ = require('lodash');

describe('Unit | Infrastructure | Datasource | Airtable | ChallengeDatasource', () => {

  const
    competence1 = { id: 'competence1' },
    competence2 = { id: 'competence2' },

    web1 = { id: 'skill-web1' },
    web2 = { id: 'skill-web2' },
    web3 = { id: 'skill-web3' },

    challenge_competence1 = challengeRawAirTableFixture({
      id: 'challenge-competence1',
      fields: { 'Compétences (via tube)': [ competence1.id ], Acquix: [ web1.id ] }
    }),
    challenge_competence1_noSkills = challengeRawAirTableFixture({
      id: 'challenge-competence1-noSkills',
      fields: { 'Compétences (via tube)': [ competence1.id ], Acquix: undefined }
    }),
    challenge_competence1_notValidated = challengeRawAirTableFixture({
      id: 'challenge-competence1-notValidated',
      fields: { 'Compétences (via tube)': [ competence1.id ], Acquix: [ web1.id ], Statut: 'proposé' }
    }),
    challenge_competence2 = challengeRawAirTableFixture({
      id: 'challenge-competence2',
      fields: { 'Compétences (via tube)': [ competence2.id ] }
    }),
    challenge_web1 = challengeRawAirTableFixture({
      id: 'challenge-web1',
      fields: { Acquix: [ web1.id ] }
    }),
    challenge_web1_notValidated = challengeRawAirTableFixture({
      id: 'challenge-web1',
      fields: { Acquix: [ web1.id ], Statut: 'proposé' }
    }),
    challenge_web2 = challengeRawAirTableFixture({
      id: 'challenge-web2',
      fields: { Acquix: [ web2.id ] }
    }),
    challenge_web3 = challengeRawAirTableFixture({
      id: 'challenge-web3',
      fields: { Acquix: [ web3.id ] }
    });

  describe('#list', () => {

    let promise;

    beforeEach(() => {
      // when
      sinon.stub(airtable, 'findRecords').resolves([
        challenge_competence1,
        challenge_competence1_notValidated,
      ]);
      promise = challengeDatasource.list();
    });

    it('should query Airtable challenges with empty query specifying used fields', () => {
      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Epreuves', challengeDatasource.usedFields);
      });
    });

    it('should resolve an array of Challenge from airTable', () => {
      // then
      return promise.then((result) => {
        expect(result).to.be.an('array').and.to.have.lengthOf(2);
      });
    });
  });

  describe('#get', () => {

    it('should call airtable on Epreuves table with the id and return a datamodel Challenge object', () => {
      // given
      sinon.stub(airtable, 'getRecord').resolves(challengeRawAirTableFixture());

      // when
      const promise = challengeDatasource.get('243');

      // then
      return promise.then((challenge) => {
        expect(airtable.getRecord).to.have.been.calledWith('Epreuves', '243');

        expect(challenge.id).to.equal('recwWzTquPlvIl4So');
        expect(challenge.type).to.equal('QCM');
      });
    });

    context('when airtable client throw an error', () => {

      it('should reject with a specific error when resource not found', () => {
        // given
        sinon.stub(airtable, 'getRecord').rejects(new AirtableError('NOT_FOUND'));

        // when
        const promise = challengeDatasource.get('243');

        // then
        return expect(promise).to.have.been.rejectedWith(AirtableResourceNotFound);
      });

      it('should reject with the original error in any other case', () => {
        // given
        sinon.stub(airtable, 'getRecord').rejects(new AirtableError('SERVICE_UNAVAILABLE'));

        // when
        const promise = challengeDatasource.get('243');

        // then
        return expect(promise).to.have.been.rejectedWith(new AirtableError('SERVICE_UNAVAILABLE'));
      });
    });
  });

  describe('#findBySkillIds', () => {

    beforeEach(() => {
      sinon.stub(airtable, 'findRecords').resolves([
        challenge_web1,
        challenge_web1_notValidated,
        challenge_web2,
        challenge_web3,
      ]);
    });

    it('should resolve an array of matching Challenges from airTable', () => {
      // given
      const skillIds = ['skill-web1', 'skill-web2'];

      // when
      const promise = challengeDatasource.findBySkillIds(skillIds);

      // then
      return promise.then((result) => {
        expect(airtable.findRecords).to.have.been.calledWith('Epreuves', challengeDatasource.usedFields);
        expect(_.map(result, 'id')).to.deep.equal([
          'challenge-web1',
          'challenge-web2',
        ]);
      });
    });
  });

  describe('#findByCompetenceId', () => {

    let promise;

    beforeEach(() => {
      // given
      sinon.stub(airtable, 'findRecords').resolves([
        challenge_competence1,
        challenge_competence1_noSkills,
        challenge_competence1_notValidated,
        challenge_competence2,
      ]);

      // when
      promise = challengeDatasource.findByCompetenceId(competence1.id);
    });

    it('should resolve to an array of matching Challenges from airTable', () => {
      // then
      return promise.then((result) => {
        expect(airtable.findRecords).to.have.been.calledWith('Epreuves', challengeDatasource.usedFields);
        expect(_.map(result, 'id')).to.deep.equal([ 'challenge-competence1' ]);
      });
    });
  });

  describe('#fromAirTableObject', () => {

    it('should create a Challenge from the AirtableRecord', () => {
      // given
      const expectedChallenge = challengeAirtableDataObjectFixture();

      // when
      const challenge = challengeDatasource.fromAirTableObject(challengeRawAirTableFixture());

      // then
      expect(challenge).to.deep.equal(expectedChallenge);
    });

    it('should deal with a missing illustration', () => {
      // given
      const airtableEpreuveObject = challengeRawAirTableFixture();
      airtableEpreuveObject.set('Illustration de la consigne', undefined);

      // when
      const challenge = challengeDatasource.fromAirTableObject(airtableEpreuveObject);

      // then
      expect(challenge.illustrationUrl).to.be.undefined;
    });

    it('should deal with a missing timer', () => {
      // given
      const airtableEpreuveObject = challengeRawAirTableFixture();
      airtableEpreuveObject.set('Timer', undefined);

      // when
      const challenge = challengeDatasource.fromAirTableObject(airtableEpreuveObject);

      // then
      expect(challenge.timer).to.be.undefined;
    });

    it('should deal with a missing Pièce jointe', () => {
      // given
      const airtableEpreuveObject = challengeRawAirTableFixture();
      airtableEpreuveObject.set('Pièce jointe', undefined);

      // when
      const challenge = challengeDatasource.fromAirTableObject(airtableEpreuveObject);

      // then
      expect(challenge.attachments).to.be.undefined;
    });

    it('should deal with a missing competences', () => {
      // given
      const airtableEpreuveObject = challengeRawAirTableFixture();
      airtableEpreuveObject.set('competences', undefined);
      airtableEpreuveObject.set('Compétences (via tube)', undefined);

      // when
      const challenge = challengeDatasource.fromAirTableObject(airtableEpreuveObject);

      // then
      expect(challenge.competenceId).to.be.undefined;
    });
  });
});
