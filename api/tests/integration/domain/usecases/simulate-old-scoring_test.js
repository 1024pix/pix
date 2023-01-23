const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
const ScoringSimulation = require('../../../../lib/domain/models/ScoringSimulation');
const SimulationResult = require('../../../../lib/domain/models/SimulationResult');
const usecases = require('../../../../lib/domain/usecases/');

describe('Integration | UseCases | simulateOldScoring', function () {
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
        { id: 'skill1', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1', level: 1, pixValue: 1 },
        { id: 'skill2', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1', level: 3, pixValue: 10 },
        // tube 2
        { id: 'skill3', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', level: 2, pixValue: 100 },
        { id: 'skill4', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', level: 3, pixValue: 1000 },
        { id: 'skill5', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', level: 5, pixValue: 10000 },
        { id: 'skill6', status: 'périmé', tubeId: 'recTube2', competenceId: 'rec2', level: 6, pixValue: 100000 },
      ],
      challenges: [
        { id: 'challenge1', skillId: 'skill1', status: 'validé' },
        { id: 'challenge2', skillId: 'skill2', status: 'validé' },
        { id: 'challenge3', skillId: 'skill3', status: 'validé' },
        { id: 'challenge4', skillId: 'skill4', status: 'validé' },
        { id: 'challenge5', skillId: 'skill5', status: 'validé' },
        { id: 'challenge6', skillId: 'skill5', status: 'validé' },
      ],
    };

    mockLearningContent(learningContent);
  });

  it('should return computed score with direct scoring result', async function () {
    // given
    const answers = [
      domainBuilder.buildAnswer.ok({
        challengeId: 'challenge1',
      }),
      domainBuilder.buildAnswer.ko({
        challengeId: 'challenge2',
      }),
      domainBuilder.buildAnswer.ok({
        challengeId: 'challenge3',
      }),
      domainBuilder.buildAnswer.skipped({
        challengeId: 'challenge4',
      }),
    ];

    const simulation = new ScoringSimulation({ answers });

    // when
    const simulationResults = await usecases.simulateOldScoring({ simulations: [simulation] });

    // then
    expect(simulationResults).to.have.lengthOf(1);
    expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
    expect(simulationResults[0]).to.have.property('pixScore', 101);
    expect(simulationResults[0].pixScoreByCompetence).to.exactlyContain([
      {
        competenceId: 'rec1',
        pixScore: 1,
      },
      {
        competenceId: 'rec2',
        pixScore: 100,
      },
    ]);
  });

  describe('when there are many challenges on the same tube', function () {
    it('should return computed score with direct and inferred challenges', async function () {
      // given
      const answers = [
        domainBuilder.buildAnswer.ok({
          challengeId: 'challenge2',
        }),
        domainBuilder.buildAnswer.ok({
          challengeId: 'challenge3',
        }),
        domainBuilder.buildAnswer.ok({
          challengeId: 'challenge5',
        }),
      ];

      const simulation = new ScoringSimulation({ id: 'simulation1', answers });

      // when
      const simulationResults = await usecases.simulateOldScoring({ simulations: [simulation] });

      // then
      expect(simulationResults).to.have.lengthOf(1);
      expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
      expect(simulationResults[0]).to.have.property('id', 'simulation1');
      expect(simulationResults[0]).to.have.property('pixScore', 11111);
      expect(simulationResults[0].pixScoreByCompetence).to.exactlyContain([
        {
          competenceId: 'rec1',
          pixScore: 11,
        },
        {
          competenceId: 'rec2',
          pixScore: 11100,
        },
      ]);
    });
  });

  describe('when there are more than one answer on the same skill', function () {
    it('should return an error', async function () {
      // given
      const answers = [
        domainBuilder.buildAnswer.ko({
          challengeId: 'challenge5',
        }),
        domainBuilder.buildAnswer.ok({
          challengeId: 'challenge6',
        }),
      ];

      const simulation = new ScoringSimulation({ id: 'simulation1', answers });

      // when
      const simulationResults = await usecases.simulateOldScoring({ simulations: [simulation] });

      // then
      expect(simulationResults).to.have.lengthOf(1);
      expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
      expect(simulationResults[0]).to.have.property('id', 'simulation1');
      expect(simulationResults[0]).to.have.property('error', 'Answer for skill skill5 was already given or inferred');
    });
  });

  describe('when there is an answer on a skill that was already inferred to be failed', function () {
    it('should return an error', async function () {
      // given
      const answers = [
        domainBuilder.buildAnswer.ko({
          challengeId: 'challenge1',
        }),
        domainBuilder.buildAnswer.ko({
          challengeId: 'challenge2',
        }),
      ];

      const simulation = new ScoringSimulation({ answers });

      // when
      const simulationResults = await usecases.simulateOldScoring({ simulations: [simulation] });

      // then
      expect(simulationResults).to.have.lengthOf(1);
      expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
      expect(simulationResults[0]).to.have.property('error', 'Answer for skill skill2 was already given or inferred');
    });
  });

  describe('when there is an answer on a skill that was already inferred to be succeeded', function () {
    it('should return an error', async function () {
      // given
      const answers = [
        domainBuilder.buildAnswer.ok({
          challengeId: 'challenge2',
        }),
        domainBuilder.buildAnswer.ko({
          challengeId: 'challenge1',
        }),
      ];

      const simulation = new ScoringSimulation({ answers });

      // when
      const simulationResults = await usecases.simulateOldScoring({ simulations: [simulation] });

      // then
      expect(simulationResults).to.have.lengthOf(1);
      expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
      expect(simulationResults[0]).to.have.property('error', 'Answer for skill skill1 was already given or inferred');
    });
  });
});
