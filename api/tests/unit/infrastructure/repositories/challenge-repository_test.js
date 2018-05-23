const { expect, sinon } = require('../../../test-helper');
const AirtableRecord = require('airtable').Record;
const airtable = require('../../../../lib/infrastructure/airtable');

const ChallengeAirtableDataObjectFixture = require('../../../../tests/fixtures/infrastructure/ChallengeAirtableDataObjectFixture');
const ChallengeAirtableDataObject = require('../../../../lib/infrastructure/datasources/airtable/objects/Challenge');
const SkillAirtableDataObject = require('../../../../lib/infrastructure/datasources/airtable/objects/Skill');
const AirtableResourceNotFound = require('../../../../lib/infrastructure/datasources/airtable/objects/AirtableResourceNotFound');
const { NotFoundError } = require('../../../../lib/domain/errors');

const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const Skill = require('../../../../lib/domain/models/Skill');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const challengeDataSource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');

describe('Unit | Repository | challenge-repository', () => {

  const sandbox = sinon.sandbox.create();

  const challenge1 = new AirtableRecord('Epreuves', 'recChallenge1', {
    fields: {
      'Consigne': 'Instruction #1',
      'Propositions': 'Proposal #1',
      'Statut': 'validé'
    }
  });

  const challenge2 = new AirtableRecord('Epreuves', 'recChallenge2', {
    fields: {
      'Consigne': 'Instruction #2',
      'Propositions': 'Proposal #2',
      'Statut': 'pré-validé'
    }
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#list', () => {

    beforeEach(() => {
      sandbox.stub(airtable, 'findRecords').resolves([challenge1, challenge2]);
    });

    it('should fetch all challenge records from Airtable "Epreuves" table', () => {
      // when
      const fetchedChallenges = challengeRepository.list();

      // then
      return fetchedChallenges.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Epreuves', {});
      });
    });

    it('should return domain Challenge objects', () => {
      // when
      const fetchedChallenges = challengeRepository.list();

      // then
      return fetchedChallenges.then((challenges) => {
        expect(challenges).to.have.lengthOf(2);
        expect(challenges[0]).to.be.an.instanceOf(Challenge);
      });
    });
  });

  describe('#findByCompetence', () => {

    beforeEach(() => {
      sandbox.stub(airtable, 'findRecords').resolves([challenge1, challenge2]);
    });

    it('should fetch all challenge records from Airtable "Epreuves" table with given competence', () => {
      // given
      const competence = new Competence({
        index: '1.1',
        name: 'Mener une recherche et une veille d’informations'
      });
      const expectedQuery = { view: competence.reference };

      // when
      const fetchedChallenges = challengeRepository.findByCompetence(competence);

      // then
      return fetchedChallenges.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Epreuves', expectedQuery);
      });
    });

    it('should return domain Challenge objects', () => {
      // when
      const fetchedChallenges = challengeRepository.list();

      // then
      return fetchedChallenges.then((challenges) => {
        expect(challenges).to.have.lengthOf(2);
        expect(challenges[0]).to.be.an.instanceOf(Challenge);
      });
    });
  });

  describe('#get', () => {
    // afterEach(() => {
    //   skillDatasource.get.restore();
    // });

    beforeEach(() => {
      sandbox.stub(airtable, 'newGetRecord').resolves(challenge1);
      sandbox.stub(challengeDataSource, 'get');
      sandbox.stub(skillDatasource, 'get').resolves();
    });

    // TODO Move in Datasource

    // it('should fetch a challenge record from Airtable "Epreuves" table', () => {
    //   // given
    //   const recordId = 'recChallenge1';
    //
    //   // when
    //   const fetchedChallenge = challengeRepository.get(recordId);
    //
    //   // then
    //   return fetchedChallenge.then(() => {
    //     expect(airtable.newGetRecord).to.have.been.calledWith('Epreuves', recordId);
    //   });
    // });
    //
    // it('should return a domain Challenge object', () => {
    //   // given
    //   const recordId = 'recChallenge1';
    //
    //   // when
    //   const fetchedChallenge = challengeRepository.get(recordId);
    //
    //   // then
    //   return fetchedChallenge.then((challenge) => {
    //     expect(challenge).to.exist;
    //     expect(challenge).to.be.an.instanceOf(Challenge);
    //   });
    // });

    it('should resolve a Challenge domain object when the challenge exists', () => {
      // given
      const challengeRecordId = 'rec_challenge_id';
      challengeDataSource.get.withArgs(challengeRecordId).resolves(new ChallengeAirtableDataObject({
        id: challengeRecordId,
        type: 'QCU'
      }));

      // when
      const promise = challengeRepository.get(challengeRecordId);

      // then
      return promise.then((challenge) => {
        expect(challenge).to.be.an.instanceOf(Challenge);
        expect(challenge.id).to.equal(challengeRecordId);
        expect(challenge.type).to.equal('QCU');
      });
    });

    it('should have embed properties', () => {
      // given
      const challengeRecordId = 'rec_challenge_id';
      challengeDataSource.get.withArgs(challengeRecordId).resolves(ChallengeAirtableDataObjectFixture());

      // when
      const promise = challengeRepository.get(challengeRecordId);

      // then
      return promise.then((challenge) => {
        expect(challenge).to.be.an.instanceOf(Challenge);
        expect(challenge.embedUrl).to.equal('https://github.io/page/epreuve.html');
        expect(challenge.embedTitle).to.equal('Epreuve de selection de dossier');
        expect(challenge.embedHeight).to.equal(500);
      });
    });

    it('should load skills', () => {
      // given
      const challengeRecordId = 'rec_challenge_id';
      challengeDataSource.get.resolves(new ChallengeAirtableDataObject({
        skillIds: ['skillId_1', 'skillId_2']
      }));

      // when
      const promise = challengeRepository.get(challengeRecordId);

      // then
      return promise.then(() => {
        expect(skillDatasource.get).to.have.been.calledWith('skillId_1');
        expect(skillDatasource.get).to.have.been.calledWith('skillId_2');
      });
    });

    it('should load skills in the challenge', () => {
      // given
      const challengeRecordId = 'rec_challenge_id';
      challengeDataSource.get.resolves(new ChallengeAirtableDataObject({
        skillIds: ['123', '456']
      }));
      skillDatasource.get.withArgs('123').resolves(new SkillAirtableDataObject({ name: '@web1' }));
      skillDatasource.get.withArgs('456').resolves(new SkillAirtableDataObject({ name: '@url2' }));

      // when
      const promise = challengeRepository.get(challengeRecordId);

      // then
      return promise.then((challenge) => {
        expect(challenge.skills).to.have.lengthOf(2);
        expect(challenge.skills[0]).to.deep.equal(new Skill({ name: '@web1' }));
        expect(challenge.skills[1]).to.deep.equal(new Skill({ name: '@url2' }));
      });
    });

    context('when the datasource is on error', () => {
      it('should return a NotFoundError if the challenge is not found', () => {
        // given
        const challengeRecordId = 'rec_challenge_id';
        const error = new AirtableResourceNotFound();
        challengeDataSource.get.rejects(error);

        // when
        const promise = challengeRepository.get(challengeRecordId);

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError);
      });

      it('should transfer the error', () => {
        // given
        const challengeRecordId = 'rec_challenge_id';
        const error = new Error();
        challengeDataSource.get.rejects(error);

        // when
        const promise = challengeRepository.get(challengeRecordId);

        // then
        return expect(promise).to.have.been.rejectedWith(error);
      });
    });

  });

  describe('#findBySkills', () => {

    beforeEach(() => {
      sinon.stub(challengeDatasource, 'findBySkills').resolves([ChallengeAirtableDataObjectFixture(), ChallengeAirtableDataObjectFixture()]);
    });

    afterEach(() => {
      challengeDatasource.findBySkills.restore();
    });

    it('should call challengeDatasource with list of skills name and return challenges', () => {
      // given
      const skills = [new Skill({ name: '@element1' }), new Skill({ name: '@element2' })];

      // when
      const promise = challengeRepository.findBySkills(skills);

      // then
      return promise.then((challenges) => {
        expect(challengeDatasource.findBySkills).to.have.been.calledWith(['@element1', '@element2']);
        expect(challenges).to.be.an('array').and.to.have.lengthOf(2);
        expect(challenges[0]).to.be.an.instanceOf(Challenge);
      });
    });

    it('should return Challenge with skills', () => {
      // given
      const skills = [new Skill({ name: '@modèleEco3' })];

      // when
      const promise = challengeRepository.findBySkills(skills);

      // then
      return promise.then((challenges) => {
        expect(challenges[0]).to.be.an.instanceOf(Challenge);
        expect(challenges[0].skills).to.be.an('array').and.to.have.lengthOf(1);
        expect(challenges[0].skills[0].name).to.be.equal('@modèleEco3');
      });
    });

  });

});
