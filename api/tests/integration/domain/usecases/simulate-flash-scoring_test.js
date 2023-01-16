const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
const ScoringSimulation = require('../../../../lib/domain/models/ScoringSimulation');
const SimulationResult = require('../../../../lib/domain/models/SimulationResult');
const usecases = require('../../../../lib/domain/usecases/');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

describe('Integration | UseCases | simulateFlashScoring', function () {
  beforeEach(function () {
    const learningContent = {
      competences: [
        {
          id: 'rec1',
          name_i18n: {
            fr: 'comp1Fr',
            en: 'comp1En',
          },
          index: '1.1',
          color: 'rec1Color',
          skillIds: ['skill1', 'skill2'],
        },
        {
          id: 'rec2',
          name_i18n: {
            fr: 'comp2Fr',
            en: 'comp2En',
          },
          index: '2.1',
          color: 'rec2Color',
          skillIds: ['skill3', 'skill4', 'skill5'],
        },
      ],
      tubes: [
        { id: 'recTube1', competenceId: 'rec1' },
        { id: 'recTube2', competenceId: 'rec2' },
      ],
      skills: [
        // tube 1
        { id: 'skill1', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1', pixValue: 1 },
        { id: 'skill2', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1', pixValue: 10 },
        // tube 2
        { id: 'skill3', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 100 },
        { id: 'skill4', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 1000 },
        { id: 'skill5', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 10000 },
        { id: 'skill6', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 100000 },
        { id: 'skill7', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 1000000 },
      ],
      challenges: [
        { id: 'challenge1', skillId: 'skill1', status: 'validé', alpha: 0.16, delta: -2, locales: ['fr'] },
        { id: 'challenge2', skillId: 'skill2', status: 'validé', alpha: 3, delta: 6, locales: ['fr'] },
        { id: 'challenge3', skillId: 'skill3', status: 'validé', alpha: 1.587, delta: 8.5, locales: ['fr'] },
        { id: 'challenge4', skillId: 'skill4', status: 'validé', alpha: 2.86789, delta: 0.145, locales: ['fr'] },
        { id: 'challenge5', skillId: 'skill5', status: 'validé', alpha: 3, delta: 1, locales: ['fr'] },
        { id: 'challenge6', skillId: 'skill6', status: 'validé', alpha: 1.7, delta: -1, locales: ['fr'] },
        { id: 'challenge7', skillId: 'skill7', status: 'validé', alpha: 2.5, delta: 5, locales: ['fr'] },
        { id: 'challenge8', skillId: 'skill7', status: 'validé', locales: ['fr'] },
      ],
    };

    mockLearningContent(learningContent);
  });

  describe('when there are answers', function () {
    it('should return a total score that combines inferred and direct challenges values', async function () {
      // given
      const answers = [
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge1' }),
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge2' }),
        domainBuilder.buildAnswer({ result: AnswerStatus.KO, challengeId: 'challenge3' }),
        domainBuilder.buildAnswer({ result: AnswerStatus.SKIPPED, challengeId: 'challenge4' }),
      ];

      const estimatedLevel = 2;

      const simulation = new ScoringSimulation({ id: 'simulation1', answers, estimatedLevel });

      // when
      const simulationResults = await usecases.simulateFlashScoring({ simulations: [simulation] });

      // then
      expect(simulationResults).to.have.lengthOf(1);
      expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
      expect(simulationResults[0]).to.have.property('id', 'simulation1');
      expect(simulationResults[0]).to.have.property('pixScore', 110011);
    });

    describe('when an answer on an unknown challenge is received', function () {
      it('should return an error', async function () {
        // given
        const answers = [domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'unknownChallenge' })];

        const estimatedLevel = 2;

        const simulation = new ScoringSimulation({ id: 'simulation1', answers, estimatedLevel });

        // when
        const simulationResults = await usecases.simulateFlashScoring({ simulations: [simulation] });

        // then
        expect(simulationResults).to.have.lengthOf(1);
        expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
        expect(simulationResults[0]).to.have.property('id', 'simulation1');
        expect(simulationResults[0]).to.have.property(
          'error',
          'Challenge ID unknownChallenge is unknown or not compatible with flash algorithm'
        );
      });
    });

    describe('when an answer on a non flash compatible challenge is received', function () {
      it('should return an error', async function () {
        // given
        const answers = [domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge8' })];

        const estimatedLevel = 2;

        const simulation = new ScoringSimulation({ answers, estimatedLevel });

        // when
        const simulationResults = await usecases.simulateFlashScoring({ simulations: [simulation] });

        // then
        expect(simulationResults).to.have.lengthOf(1);
        expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
        expect(simulationResults[0]).to.have.property(
          'error',
          'Challenge ID challenge8 is unknown or not compatible with flash algorithm'
        );
      });
    });
  });

  describe('when a simulation does NOT have any simulated level', function() {
    it('should return an error', async function () {
      // given
      const answers = [
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge1' }),
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge2' }),
        domainBuilder.buildAnswer({ result: AnswerStatus.KO, challengeId: 'challenge3' }),
        domainBuilder.buildAnswer({ result: AnswerStatus.SKIPPED, challengeId: 'challenge4' }),
      ];

      const simulation = new ScoringSimulation({ id: 'simulation1', answers });

      // when
      const simulationResults = await usecases.simulateFlashScoring({ simulations: [simulation] });

      // then
      expect(simulationResults).to.have.lengthOf(1);
      expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
      expect(simulationResults[0]).to.have.property('error', 'Simulation should have an estimated level');
    });
  });
});
