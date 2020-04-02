const { expect, domainBuilder, sinon } = require('../../../test-helper');

const AirtableResourceNotFound = require(
  '../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');
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
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const solutionAdapter = require('../../../../lib/infrastructure/adapters/solution-adapter');

describe('Unit | Repository | challenge-repository', () => {

  describe('#get', () => {

    beforeEach(() => {
      sinon.stub(challengeDatasource, 'get');
      sinon.stub(skillDatasource, 'get').resolves();
      sinon.stub(solutionAdapter, 'fromChallengeAirtableDataObject');
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
          challengeDataObject = domainBuilder.buildChallengeAirtableDataObject({
            id: challengeRecordId,
            skillIds: ['skillId_1', 'skillId_2'],
            type: challengeType,
          });
          solution = domainBuilder.buildSolution();
          challengeDatasource.get.withArgs(challengeRecordId).resolves(challengeDataObject);
          skillDatasource.get.withArgs('skillId_1').resolves(domainBuilder.buildSkillAirtableDataObject({
            name: '@web1',
            competenceId: 'rec1',
            tubeId: 'recTube1',
          }));
          skillDatasource.get.withArgs('skillId_2').resolves(domainBuilder.buildSkillAirtableDataObject({
            name: '@url2',
            competenceId: 'rec1',
            tubeId: 'recTube2',
          }));
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
            expect(challenge.competenceId).to.equal('recsvLz0W2ShyfD63');
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
            expect(challenge.skills[0]).to.deep.equal(new Skill({
              id: 'recTIddrkopID28Ep',
              name: '@web1',
              pixValue: 2.4,
              competenceId: 'rec1',
              tutorialIds: ['receomyzL0AmpMFGw'],
              tubeId: 'recTube1',
            }));
            expect(challenge.skills[1]).to.deep.equal(new Skill({
              id: 'recTIddrkopID28Ep',
              name: '@url2',
              pixValue: 2.4,
              competenceId: 'rec1',
              tutorialIds: ['receomyzL0AmpMFGw'],
              tubeId: 'recTube2',
            }));
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
        challengeDatasource.get.rejects(error);

        // when
        const promise = challengeRepository.get(challengeRecordId);

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError);
      });

      it('should transfer the error', () => {
        // given
        const challengeRecordId = 'rec_challenge_id';
        const error = new Error();
        challengeDatasource.get.rejects(error);

        // when
        const promise = challengeRepository.get(challengeRecordId);

        // then
        return expect(promise).to.have.been.rejectedWith(error);
      });
    });
  });

  context('when requesting multiple challenges', () => {

    let skillWeb1;
    let skillURL2;
    let skillURL3;
    let skills;

    beforeEach(() => {

      skillWeb1 = domainBuilder.buildSkillAirtableDataObject({
        id: 'recSkillWeb1',
        name: '@web1',
        pixValue: 2,
        competenceId: 'rec1',
        tubeId: 'recTube1',
      });
      skillURL2 = domainBuilder.buildSkillAirtableDataObject({
        id: 'recSkillURL2',
        name: '@url2',
        pixValue: 3,
        competenceId: 'rec1',
        tubeId: 'recTube2',
      });
      skillURL3 = domainBuilder.buildSkillAirtableDataObject({
        id: 'recSkillURL3',
        name: '@url3',
        pixValue: 3,
        competenceId: 'rec1',
        tubeId: 'recTube3',
      });
      skills = [skillWeb1, skillURL2, skillURL3];
      sinon.stub(skillDatasource, 'get');
      sinon.stub(skillDatasource, 'findActiveSkills');
      skillDatasource.findActiveSkills.resolves(skills);
    });

    describe('#list', () => {

      beforeEach(() => {
        sinon.stub(challengeDatasource, 'list');
        sinon.stub(solutionAdapter, 'fromChallengeAirtableDataObject');
      });

      context('when query happens with no error', () => {

        let promise;

        beforeEach(() => {
          // given
          challengeDatasource.list.resolves([
            domainBuilder.buildChallengeAirtableDataObject({
              id: 'rec_challenge_1',
              skillIds: [skillWeb1.id],
            }),
            domainBuilder.buildChallengeAirtableDataObject({
              id: 'rec_challenge_2',
              skillIds: [skillURL2.id, skillURL3.id, 'not_existing_skill_id'],
            }),
          ]);

          solutionAdapter.fromChallengeAirtableDataObject.returns(domainBuilder.buildSolution());

          // when
          promise = challengeRepository.list();
        });

        it('should succeed', () => {
          // then
          return expect(promise).to.be.fulfilled;
        });

        it('should call challengeDataObjects with competence', () => {
          // then
          return promise.then(() => {
            expect(challengeDatasource.list).to.have.been.calledWithExactly();
          });
        });

        it('should resolve an array of 2 Challenge domain objects', () => {
          // then
          return promise.then((challenges) => {
            expect(challenges).to.be.an('array');
            expect(challenges).to.have.lengthOf(2);
            challenges.map((challenge) => expect(challenge).to.be.an.instanceOf(Challenge));
          });
        });

        it('should load skills in the challenges', () => {
          // then
          return promise.then((challenges) => {
            expect(challenges[0].skills).to.deep.equal([
              {
                'id': 'recSkillWeb1',
                'name': '@web1',
                'pixValue': 2,
                'competenceId': 'rec1',
                'tutorialIds': ['receomyzL0AmpMFGw'],
                'tubeId': 'recTube1',
              }
            ]);
            expect(challenges[1].skills).to.deep.equal([
              {
                'id': 'recSkillURL2',
                'name': '@url2',
                'pixValue': 3,
                'competenceId': 'rec1',
                'tutorialIds': ['receomyzL0AmpMFGw'],
                'tubeId': 'recTube2',
              },
              {
                'id': 'recSkillURL3',
                'name': '@url3',
                'pixValue': 3,
                'competenceId': 'rec1',
                'tutorialIds': ['receomyzL0AmpMFGw'],
                'tubeId': 'recTube3',
              }
            ]);
          });
        });

        it('should not retrieve skills individually', () => {
          // then
          return promise.then(() => {
            expect(skillDatasource.get).not.to.have.been.called;
          });
        });
      });

      context('when the datasource is on error', () => {

        it('should transfer the error', () => {
          // given
          const error = new Error();
          challengeDatasource.list.rejects(error);

          // when
          const promise = challengeRepository.list();

          // then
          return expect(promise).to.have.been.rejectedWith(error);
        });
      });
    });

    describe('#findByCompetenceId', () => {

      let competence;

      beforeEach(() => {
        competence = domainBuilder.buildCompetence();

        sinon.stub(challengeDatasource, 'findByCompetenceId');
        sinon.stub(solutionAdapter, 'fromChallengeAirtableDataObject');
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
          challengeDataObject1 = domainBuilder.buildChallengeAirtableDataObject({
            id: challengeRecordId,
            skillIds: [skillWeb1.id],
          });
          challengeDataObject2 = domainBuilder.buildChallengeAirtableDataObject({
            id: challengeRecordId,
            skillIds: [skillURL2.id, skillURL3.id],
          });
          solution = domainBuilder.buildSolution();
          challengeDatasource.findByCompetenceId
            .withArgs(competence.id)
            .resolves([challengeDataObject1, challengeDataObject2]);
          solutionAdapter.fromChallengeAirtableDataObject.returns(solution);

          // when
          promise = challengeRepository.findByCompetenceId(competence.id);
        });

        it('should succeed', () => {
          // then
          return expect(promise).to.be.fulfilled;
        });
        it('should call challengeDataObjects with competence', () => {
          // then
          return promise.then(() => {
            expect(challengeDatasource.findByCompetenceId).to.have.been.calledWith(competence.id);
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
      });

      context('when the datasource is on error', () => {

        it('should transfer the error', () => {
          // given
          const error = new Error();
          challengeDatasource.findByCompetenceId.rejects(error);

          // when
          const promise = challengeRepository.findByCompetenceId(competence.id);

          // then
          return expect(promise).to.have.been.rejectedWith(error);
        });
      });
    });

    describe('#findBySkills', () => {

      beforeEach(() => {

        sinon.stub(challengeDatasource, 'findBySkillIds');
        sinon.stub(solutionAdapter, 'fromChallengeAirtableDataObject');
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
          challengeDataObject1 = domainBuilder.buildChallengeAirtableDataObject({
            id: challengeRecordId,
            skillIds: [skillWeb1.id],
          });
          challengeDataObject2 = domainBuilder.buildChallengeAirtableDataObject({
            id: challengeRecordId,
            skillIds: [skillURL2.id, skillURL3.id],
          });
          solution = domainBuilder.buildSolution();

          challengeDatasource.findBySkillIds.resolves([
            challengeDataObject1,
            challengeDataObject2,
          ]);

          solutionAdapter.fromChallengeAirtableDataObject.returns(solution);

          // when
          promise = challengeRepository.findBySkills(skills);
        });

        it('should succeed', () => {
          // then
          return expect(promise).to.be.fulfilled;
        });
        it('should call challengeDataObjects with competence', () => {
          // then
          return promise.then(() => {
            expect(challengeDatasource.findBySkillIds).to.have.been.calledWith(skills.map((skill) => skill.id));
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
      });

      context('when the datasource is on error', () => {

        it('should transfer the error', () => {
          // given
          const error = new Error();
          challengeDatasource.findBySkillIds.rejects(error);

          // when
          const promise = challengeRepository.findBySkills(skills);

          // then
          return expect(promise).to.have.been.rejectedWith(error);
        });
      });
    });

  });

});
