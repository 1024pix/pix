const { expect, factory, sinon } = require('../../../test-helper');
const AirtableRecord = require('airtable').Record;
const airtable = require('../../../../lib/infrastructure/airtable');

const ChallengeAirtableDataObjectFixture = require(
  '../../../tooling/fixtures/infrastructure/challengeAirtableDataObjectFixture');
const AirtableResourceNotFound = require(
  '../../../../lib/infrastructure/datasources/airtable/objects/AirtableResourceNotFound');
const { NotFoundError } = require('../../../../lib/domain/errors');

const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');
const Solution = require('../../../../lib/domain/models/Solution');
const Validator = require('../../../../lib/domain/models/Validator');
const ValidatorQCM = require('../../../../lib/domain/models/ValidatorQCM');
const ValidatorQCU = require('../../../../lib/domain/models/ValidatorQCU');
const ValidatorQROC = require('../../../../lib/domain/models/ValidatorQROC');
const ValidatorQROCMDep = require('../../../../lib/domain/models/ValidatorQROCMDep');
const ValidatorQROCMInd = require('../../../../lib/domain/models/ValidatorQROCMInd');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const challengeDataSource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const solutionAdapter = require('../../../../lib/infrastructure/adapters/solution-adapter');

describe('Unit | Repository | challenge-repository', () => {

  const sandbox = sinon.sandbox.create();

  const challenge1 = new AirtableRecord('Epreuves', 'recChallenge1', {
    fields: {
      'Consigne': 'Instruction #1',
      'Propositions': 'Proposal #1',
      'Statut': 'validé',
    },
  });

  const challenge2 = new AirtableRecord('Epreuves', 'recChallenge2', {
    fields: {
      'Consigne': 'Instruction #2',
      'Propositions': 'Proposal #2',
      'Statut': 'pré-validé',
    },
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

  describe('#get', () => {

    beforeEach(() => {
      sandbox.stub(challengeDataSource, 'get');
      sandbox.stub(skillDatasource, 'get').resolves();
      sandbox.stub(solutionAdapter, 'fromChallengeAirtableDataObject');
    });

    const challengeTypeAndValidators = {
      'QCM': ValidatorQCM,
      'QCU': ValidatorQCU,
      'QROC': ValidatorQROC,
      'QROCM-dep': ValidatorQROCMDep,
      'QROCM-ind': ValidatorQROCMInd,
      'other': Validator,
    };

    Object.entries(challengeTypeAndValidators).forEach(([challengeType, associatedValidatorClass]) => {

      context(`when challenge of type: ${challengeType} exists and no error arise`, () => {

        let challengeDataObject;
        let challengeRecordId;
        let promise;
        let solution;

        beforeEach(() => {
          // given
          challengeRecordId = 'rec_challenge_id';
          challengeDataObject = factory.buildChallengeAirtableDataObject({
            id: challengeRecordId,
            skillIds: ['skillId_1', 'skillId_2'],
            type: challengeType,
          });
          solution = factory.buildSolution();
          challengeDataSource.get.withArgs(challengeRecordId).resolves(challengeDataObject);
          skillDatasource.get.withArgs('skillId_1').resolves(factory.buildSkillAirtableDataObject({ name: '@web1' }));
          skillDatasource.get.withArgs('skillId_2').resolves(factory.buildSkillAirtableDataObject({ name: '@url2' }));
          solutionAdapter.fromChallengeAirtableDataObject.returns(solution);

          // when
          promise = challengeRepository.get(challengeRecordId);
        });

        it('should succeed', () => {
          // then
          return expect(promise).to.be.fulfilled;
        });
        it('should resolve a Challenge domain object when the challenge exists', () => {
          // then
          return promise.then((challenge) => {
            expect(challenge).to.be.an.instanceOf(Challenge);
            expect(challenge.id).to.equal(challengeRecordId);
            expect(challenge.type).to.equal(challengeType);
          });
        });
        it('should have basic properties', () => {
          // then
          return promise.then((challenge) => {
            expect(challenge.instruction)
              .to
              .equal(
                'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?');
            expect(challenge.proposals).to.equal('- 1\n- 2\n- 3\n- 4\n- 5');
            expect(challenge.timer).to.equal(1234);
            expect(challenge.status).to.equal('validé');
            expect(challenge.illustrationUrl).to.equal('https://dl.airtable.com/2MGErxGTQl2g2KiqlYgV_venise4.png');
            expect(challenge.attachments).to.deep.equal([
              'https://dl.airtable.com/nHWKNZZ7SQeOKsOvVykV_navigationdiaporama5.pptx',
              'https://dl.airtable.com/rsXNJrSPuepuJQDByFVA_navigationdiaporama5.odp',
            ]);
          });
        });
        it('should have embed properties', () => {
          // then
          return promise.then((challenge) => {
            expect(challenge).to.be.an.instanceOf(Challenge);
            expect(challenge.embedUrl).to.equal('https://github.io/page/epreuve.html');
            expect(challenge.embedTitle).to.equal('Epreuve de selection de dossier');
            expect(challenge.embedHeight).to.equal(500);
          });
        });
        it('should load skills', () => {
          // then
          return promise.then(() => {
            expect(skillDatasource.get).to.have.been.calledWith('skillId_1');
            expect(skillDatasource.get).to.have.been.calledWith('skillId_2');
          });
        });
        it('should load skills in the challenge', () => {
          // then
          return promise.then((challenge) => {
            expect(challenge.skills).to.have.lengthOf(2);
            expect(challenge.skills[0]).to.deep.equal(new Skill({ id: 'recTIddrkopID28Ep', name: '@web1' }));
            expect(challenge.skills[1]).to.deep.equal(new Skill({ id: 'recTIddrkopID28Ep', name: '@url2' }));
          });
        });
        it('should call the solution-adapter to create the solution', () => {
          // then
          return promise.then(() => {
            expect(solutionAdapter.fromChallengeAirtableDataObject).to.have.been.calledWith(challengeDataObject);
          });
        });
        it('should include a validator with the challenge solution', () => {
          const expectedValidator = new Validator({ solution });
          // then
          return promise.then((challenge) => {
            expect(challenge.validator).to.be.an.instanceOf(associatedValidatorClass);
            expect(challenge.validator.solution).to.be.an.instanceOf(Solution);
            expect(challenge.validator).to.deep.equal(expectedValidator);
          });
        });
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

  describe('#findByCompetence', () => {

    let competence;

    beforeEach(() => {
      competence = factory.buildCompetence();

      sandbox.stub(airtable, 'findRecords').resolves([challenge1, challenge2]);

      sandbox.stub(challengeDataSource, 'findByCompetence');
      sandbox.stub(skillDatasource, 'get').resolves();
      sandbox.stub(solutionAdapter, 'fromChallengeAirtableDataObject');
    });

    context('when query happens with no error', () => {

      let challengeDataObject1;
      let challengeDataObject2;
      let challengeRecordId;
      let promise;
      let solution;

      beforeEach(() => {
        // given
        challengeRecordId = 'rec_challenge_id';
        challengeDataObject1 = factory.buildChallengeAirtableDataObject({
          id: challengeRecordId,
          skillIds: ['skillId_1'],
        });
        challengeDataObject2 = factory.buildChallengeAirtableDataObject({
          id: challengeRecordId,
          skillIds: ['skillId_2', 'skillId_3'],
        });
        solution = factory.buildSolution();
        challengeDataSource.findByCompetence
          .withArgs(competence)
          .resolves([challengeDataObject1, challengeDataObject2]);
        skillDatasource.get.withArgs('skillId_1').resolves(factory.buildSkillAirtableDataObject({ name: '@web1' }));
        skillDatasource.get.withArgs('skillId_2').resolves(factory.buildSkillAirtableDataObject({ name: '@url2' }));
        skillDatasource.get.withArgs('skillId_3').resolves(factory.buildSkillAirtableDataObject({ name: '@url3' }));
        solutionAdapter.fromChallengeAirtableDataObject.returns(solution);

        // when
        promise = challengeRepository.findByCompetence(competence);
      });

      it('should succeed', () => {
        // then
        return expect(promise).to.be.fulfilled;
      });
      it('should call challengeDataObjects with competence', () => {
        // then
        return promise.then(() => {
          expect(challengeDataSource.findByCompetence).to.have.been.calledWith(competence);
        });
      });
      it('should resolve an array of 2 Challenge domain objects', () => {
        // then
        // exact composition and construction of the Challenge object is tested in repository 'get' function.
        return promise.then((challenges) => {
          expect(challenges).to.be.an('array');
          expect(challenges).to.have.lengthOf(2);
          challenges.map((challenge) => expect(challenge).to.be.an.instanceOf(Challenge));
        });
      });
      it('should load skills', () => {
        // then
        return promise.then(() => {
          expect(skillDatasource.get).to.have.been.calledWith('skillId_1');
          expect(skillDatasource.get).to.have.been.calledWith('skillId_2');
          expect(skillDatasource.get).to.have.been.calledWith('skillId_3');
        });
      });
    });

    context('when the datasource is on error', () => {

      it('should transfer the error', () => {
        // given
        const error = new Error();
        challengeDataSource.findByCompetence.rejects(error);

        // when
        const promise = challengeRepository.findByCompetence(competence);

        // then
        return expect(promise).to.have.been.rejectedWith(error);
      });
    });
  });

  describe('#findBySkills', () => {

    beforeEach(() => {
      sinon.stub(challengeDatasource, 'findBySkills')
        .resolves([ChallengeAirtableDataObjectFixture(), ChallengeAirtableDataObjectFixture()]);
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
