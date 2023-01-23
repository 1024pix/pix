const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
const ScoringSimulationContext = require('../../../../lib/domain/models/ScoringSimulationContext');
const ScoringSimulation = require('../../../../lib/domain/models/ScoringSimulation');
const SimulationResult = require('../../../../lib/domain/models/SimulationResult');
const usecases = require('../../../../lib/domain/usecases/');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

describe('Integration | UseCases | simulateFlashScoring', function () {
  const locale = 'fr-fr';

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
        { id: 'challenge1', skillId: 'skill1', status: 'validé', alpha: 0.16, delta: -2, locales: [locale] },
        { id: 'challenge2', skillId: 'skill2', status: 'validé', alpha: 3, delta: 6, locales: [locale] },
        { id: 'challenge3', skillId: 'skill3', status: 'validé', alpha: 1.587, delta: 8.5, locales: [locale] },
        { id: 'challenge4', skillId: 'skill4', status: 'validé', alpha: 2.86789, delta: 0.145, locales: [locale] },
        { id: 'challenge5', skillId: 'skill5', status: 'validé', alpha: 3, delta: 1, locales: [locale] },
        { id: 'challenge6', skillId: 'skill6', status: 'validé', alpha: 1.7, delta: -1, locales: [locale] },
        { id: 'challenge7', skillId: 'skill7', status: 'validé', alpha: 2.5, delta: 5, locales: [locale] },
        { id: 'challenge8', skillId: 'skill7', status: 'validé', locales: [locale] },
      ],
    };

    mockLearningContent(learningContent);
  });

  describe('when calculating estimated level', function () {
    const calculateEstimatedLevel = true;

    describe('when there are NO answers', function () {
      it('should return an error', async function () {
        // given
        const estimatedLevel = 2;

        const simulation = new ScoringSimulation({ id: 'simulation1', estimatedLevel });

        // when
        const simulationResults = await usecases.simulateFlashScoring({
          simulations: [simulation],
          context: new ScoringSimulationContext({ calculateEstimatedLevel }),
          locale,
        });

        // then
        expect(simulationResults).to.have.lengthOf(1);
        expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
        expect(simulationResults[0]).to.have.property(
          'error',
          'Simulation should have answers in order to calculate estimated level'
        );
      });
    });

    describe('when there are answers AND there is NO estimated level', function () {
      it('should calculate estimated level AND total score', async function () {
        // given
        const answers = [
          domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge1' }),
          domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge2' }),
          domainBuilder.buildAnswer({ result: AnswerStatus.KO, challengeId: 'challenge3' }),
          domainBuilder.buildAnswer({ result: AnswerStatus.SKIPPED, challengeId: 'challenge4' }),
        ];

        const simulation = new ScoringSimulation({ id: 'simulation1', answers });

        // when
        const simulationResults = await usecases.simulateFlashScoring({
          simulations: [simulation],
          context: new ScoringSimulationContext({ calculateEstimatedLevel }),
          locale,
        });

        // then
        expect(simulationResults).to.have.lengthOf(1);
        expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
        expect(simulationResults[0]).to.have.property('id', 'simulation1');
        expect(simulationResults[0]).to.have.property('estimatedLevel', 5.309899756825917);
        expect(simulationResults[0]).to.have.property('pixScore', 110011);
      });
    });

    describe('when there are answers and an estimated level', function () {
      describe('when the calculated and given estimated levels are the same', function () {
        it('should calculate estimated level AND total score', async function () {
          // given
          const answers = [
            domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge1' }),
            domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge2' }),
            domainBuilder.buildAnswer({ result: AnswerStatus.KO, challengeId: 'challenge3' }),
            domainBuilder.buildAnswer({ result: AnswerStatus.SKIPPED, challengeId: 'challenge4' }),
          ];

          const simulation = new ScoringSimulation({ id: 'simulation1', answers, estimatedLevel: 5.309899756825917 });

          // when
          const simulationResults = await usecases.simulateFlashScoring({
            simulations: [simulation],
            context: new ScoringSimulationContext({ calculateEstimatedLevel }),
            locale,
          });

          // then
          expect(simulationResults).to.have.lengthOf(1);
          expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
          expect(simulationResults[0]).to.have.property('id', 'simulation1');
          expect(simulationResults[0]).to.have.property('estimatedLevel', 5.309899756825917);
          expect(simulationResults[0]).to.have.property('pixScore', 110011);
        });
      });

      describe('when the calculated and given estimated levels are different', function () {
        it('should return an error', async function () {
          // given
          const answers = [
            domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge1' }),
            domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'challenge2' }),
            domainBuilder.buildAnswer({ result: AnswerStatus.KO, challengeId: 'challenge3' }),
            domainBuilder.buildAnswer({ result: AnswerStatus.SKIPPED, challengeId: 'challenge4' }),
          ];

          const simulation = new ScoringSimulation({ id: 'simulation1', answers, estimatedLevel: 1 });

          // when
          const simulationResults = await usecases.simulateFlashScoring({
            simulations: [simulation],
            context: new ScoringSimulationContext({ calculateEstimatedLevel }),
            locale,
          });

          // then
          expect(simulationResults).to.have.lengthOf(1);
          expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
          expect(simulationResults[0]).to.have.property('id', 'simulation1');
          expect(simulationResults[0]).to.have.property('estimatedLevel', 5.309899756825917);
          expect(simulationResults[0]).to.have.property(
            'error',
            'Calculated estimated level 5.309899756825917 is different from expected given estimated level 1'
          );
        });
      });
    });
  });

  describe('when NOT calculating estimated level', function () {
    const calculateEstimatedLevel = false;

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

        const simulation = new ScoringSimulation({
          id: 'simulation1',
          answers,
          estimatedLevel,
        });

        // when
        const simulationResults = await usecases.simulateFlashScoring({
          simulations: [simulation],
          context: new ScoringSimulationContext({ calculateEstimatedLevel }),
          locale,
        });

        // then
        expect(simulationResults).to.have.lengthOf(1);
        expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
        expect(simulationResults[0]).to.have.property('id', 'simulation1');
        expect(simulationResults[0]).to.have.property('pixScore', 110011);
      });
    });

    describe('when there are NO answers', function () {
      it('should return a total score with inferred challenges values', async function () {
        // given
        const estimatedLevel = 2;

        const simulation = new ScoringSimulation({ id: 'simulation1', estimatedLevel });

        // when
        const simulationResults = await usecases.simulateFlashScoring({
          simulations: [simulation],
          context: new ScoringSimulationContext({ calculateEstimatedLevel }),
          locale,
        });

        // then
        expect(simulationResults).to.have.lengthOf(1);
        expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
        expect(simulationResults[0]).to.have.property('id', 'simulation1');
        expect(simulationResults[0]).to.have.property('pixScore', 111000);
      });
    });

    describe('when a simulation does NOT have any estimated level', function () {
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
        const simulationResults = await usecases.simulateFlashScoring({
          simulations: [simulation],
          context: new ScoringSimulationContext({ calculateEstimatedLevel }),
          locale,
        });

        // then
        expect(simulationResults).to.have.lengthOf(1);
        expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
        expect(simulationResults[0]).to.have.property('error', 'Simulation should have an estimated level');
      });
    });
  });

  describe('when there are answers', function () {
    describe('when an answer on an unknown challenge is received', function () {
      it('should return an error', async function () {
        // given
        const answers = [domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: 'unknownChallenge' })];

        const estimatedLevel = 2;

        const simulation = new ScoringSimulation({ id: 'simulation1', answers, estimatedLevel });

        // when
        const simulationResults = await usecases.simulateFlashScoring({
          simulations: [simulation],
          context: new ScoringSimulationContext(),
          locale,
        });

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
        const simulationResults = await usecases.simulateFlashScoring({
          simulations: [simulation],
          context: new ScoringSimulationContext(),
          locale,
        });

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

  describe('when there is a custom success probability threshold', function () {
    it('should return a different total score', async function () {
      // given
      const estimatedLevel = 2;
      const successProbabilityThreshold = 0.65;

      const simulation = new ScoringSimulation({ id: 'simulation1', estimatedLevel });

      // when
      const simulationResults = await usecases.simulateFlashScoring({
        simulations: [simulation],
        context: new ScoringSimulationContext({ successProbabilityThreshold }),
        locale,
      });

      // then
      expect(simulationResults).to.have.lengthOf(1);
      expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
      expect(simulationResults[0]).to.have.property('id', 'simulation1');
      expect(simulationResults[0]).to.have.property('pixScore', 111001);
    });
  });
});
