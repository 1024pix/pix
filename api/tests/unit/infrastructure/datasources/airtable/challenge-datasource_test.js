const _ = require('lodash');
const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const challengeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const challengeAirtableDataObjectFixture = require('../../../../tooling/fixtures/infrastructure/challengeAirtableDataObjectFixture');
const challengeRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/challengeRawAirTableFixture');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');
const { FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../../../lib/domain/constants').LOCALE;

describe('Unit | Infrastructure | Datasource | Airtable | ChallengeDatasource', () => {

  const
    competence1 = { id: 'competence1' },
    competence2 = { id: 'competence2' },

    web1 = { id: 'skill-web1' },
    web2 = { id: 'skill-web2' },
    web3 = { id: 'skill-web3' },

    challenge_competence1 = challengeRawAirTableFixture({
      id: 'challenge-competence1',
      fields: { 'Compétences (via tube) (id persistant)': [competence1.id], 'Acquix (id persistant)': [web1.id] },
    }),
    challenge_competence1_noSkills = challengeRawAirTableFixture({
      id: 'challenge-competence1-noSkills',
      fields: { 'Compétences (via tube) (id persistant)': [competence1.id], 'Acquix (id persistant)': undefined },
    }),
    challenge_competence1_notValidated = challengeRawAirTableFixture({
      id: 'challenge-competence1-notValidated',
      fields: {
        'Compétences (via tube) (id persistant)': [competence1.id],
        'Acquix (id persistant)': [web1.id],
        Statut: 'proposé',
      },
    }),
    challenge_competence2 = challengeRawAirTableFixture({
      id: 'challenge-competence2',
      fields: { 'Compétences (via tube) (id persistant)': [competence2.id] },
    }),
    challenge_web1 = challengeRawAirTableFixture({
      id: 'challenge-web1',
      fields: {
        'Acquix (id persistant)': [web1.id],
        'Langues': ['Francophone', 'Franco Français'],
      },
    }),
    challenge_web1_notValidated = challengeRawAirTableFixture({
      id: 'challenge-web1',
      fields: {
        'Acquix (id persistant)': [web1.id], Statut: 'proposé',
        'Langues': ['Francophone', 'Franco Français'],
      },
    }),
    challenge_web2 = challengeRawAirTableFixture({
      id: 'challenge-web2',
      fields: {
        'Acquix (id persistant)': [web2.id],
        'Langues': ['Anglais'],
      },
    }),
    challenge_web3 = challengeRawAirTableFixture({
      id: 'challenge-web3',
      fields: { 'Acquix (id persistant)': [web3.id] },
    }),
    challenge_web3_archived = challengeRawAirTableFixture({
      id: 'challenge-web3-archived',
      fields: {
        'Acquix (id persistant)': [web3.id], Statut: 'archivé',
        'Langues': ['Franco Français'],
      },
    });

  beforeEach(() => {
    sinon.stub(cache, 'get').callsFake((key, generator) => generator());
  });

  describe('#findOperativeBySkillIds', () => {

    beforeEach(() => {
      sinon.stub(airtable, 'findRecords').resolves([
        challenge_web1,
        challenge_web1_notValidated,
        challenge_web2,
        challenge_web3,
      ]);
    });

    it('should resolve an array of matching Challenges from airTable', async () => {
      // given
      const skillIds = ['skill-web1', 'skill-web2'];

      // when
      const result = await challengeDatasource.findOperativeBySkillIds(skillIds);

      // then
      expect(airtable.findRecords).to.have.been.calledWith('Epreuves', challengeDatasource.usedFields);
      expect(_.map(result, 'id')).to.deep.equal([
        'challenge-web1',
        'challenge-web2',
      ]);
    });
  });

  describe('#findValidatedByCompetenceId', () => {

    let result;

    beforeEach(async () => {
      // given
      sinon.stub(airtable, 'findRecords').resolves([
        challenge_competence1,
        challenge_competence1_noSkills,
        challenge_competence1_notValidated,
        challenge_competence2,
      ]);

      // when
      result = await challengeDatasource.findValidatedByCompetenceId(competence1.id);
    });

    it('should resolve to an array of matching Challenges from airTable', () => {
      // then
      expect(airtable.findRecords).to.have.been.calledWith('Epreuves', challengeDatasource.usedFields);
      expect(_.map(result, 'id')).to.deep.equal(['challenge-competence1']);
    });
  });

  describe('#findOperative', () => {

    beforeEach(() => {
      sinon.stub(airtable, 'findRecords').resolves([
        challenge_web1,
        challenge_web1_notValidated,
        challenge_web2,
        challenge_web3_archived,
      ]);
    });

    it('should resolve an array of matching Challenges from airTable', async () => {
      // when
      const result = await challengeDatasource.findOperative();

      // then
      expect(airtable.findRecords).to.have.been.calledWith('Epreuves', challengeDatasource.usedFields);
      expect(_.map(result, 'id')).to.deep.equal([
        'challenge-web1',
        'challenge-web2',
        'challenge-web3-archived',
      ]);
    });
  });

  describe('#findFrenchFranceOperative', () => {

    it('should retrieve the operative Challenges of given locale only', async () => {
      // given
      sinon.stub(airtable, 'findRecords').resolves([
        challenge_web1,
        challenge_web1_notValidated,
        challenge_web2,
        challenge_web3_archived,
      ]);

      // when
      const result = await challengeDatasource.findFrenchFranceOperative();

      // then
      expect(_.map(result, 'id')).to.deep.equal([
        'challenge-web1',
        'challenge-web3-archived',
      ]);
    });
  });

  describe('#findValidated', () => {

    beforeEach(() => {
      sinon.stub(airtable, 'findRecords').resolves([
        challenge_web1,
        challenge_web1_notValidated,
        challenge_web2,
        challenge_web3_archived,
      ]);
    });

    it('should resolve an array of matching Challenges from airTable', async () => {
      // when
      const result = await challengeDatasource.findValidated();

      // then
      expect(airtable.findRecords).to.have.been.calledWith('Epreuves', challengeDatasource.usedFields);
      expect(_.map(result, 'id')).to.deep.equal([
        'challenge-web1',
        'challenge-web2',
      ]);
    });
  });

  describe('#fromAirTableObject', () => {

    describe('when Languages is only Francophone', () => {
      it('should create a Challenge from the AirtableRecord with locales set to [\'fr\']', () => {
        // given
        const expectedChallenge = challengeAirtableDataObjectFixture({ locales: [FRENCH_SPOKEN] });
        const frenchSpokenChallenge = challengeRawAirTableFixture({ id: 'recwWzTquPlvIl4So', fields: { Langues: ['Francophone'] } });

        // when
        const challenge = challengeDatasource.fromAirTableObject(frenchSpokenChallenge);

        // then
        expect(challenge).to.deep.equal(expectedChallenge);
      });
    });

    describe('when Languages is only Franco Français', () => {
      it('should create a Challenge from the AirtableRecord with locales set to [\'fr-fr\']', () => {
        // given
        const expectedChallenge = challengeAirtableDataObjectFixture({ locales: [FRENCH_FRANCE] });
        const frenchChallenge = challengeRawAirTableFixture({ id: 'recwWzTquPlvIl4So', fields: { Langues: ['Franco Français'] } });

        // when
        const challenge = challengeDatasource.fromAirTableObject(frenchChallenge);

        // then
        expect(challenge).to.deep.equal(expectedChallenge);
      });
    });

    describe('when Languages is both Franco Français and Francophone', () => {
      it('should create a Challenge from the AirtableRecord with locales set to [\'fr-fr\', \'fr\']', () => {
        // given
        const expectedChallenge = challengeAirtableDataObjectFixture({ locales: [FRENCH_FRANCE, FRENCH_SPOKEN] });
        const frenchChallenge = challengeRawAirTableFixture({ id: 'recwWzTquPlvIl4So', fields: { Langues: ['Franco Français', 'Francophone'] } });

        // when
        const challenge = challengeDatasource.fromAirTableObject(frenchChallenge);

        // then
        expect(challenge).to.deep.equal(expectedChallenge);
      });
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
      airtableEpreuveObject.set('Compétences (via tube) (id persistant)', undefined);

      // when
      const challenge = challengeDatasource.fromAirTableObject(airtableEpreuveObject);

      // then
      expect(challenge.competenceId).to.be.undefined;
    });
  });

});
