const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
const OldScoringSimulation = require('../../../../lib/domain/models/OldScoringSimulation');
const SimulationResult = require('../../../../lib/domain/models/SimulationResult');
const usecases = require('../../../../lib/domain/usecases/');

describe('Integration | UseCases | simulateOldScoring', function () {
  it('should return 10001 as a direct scoring result', async function () {
    // given
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
        { id: 'skill1', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1', pixValue: 1 },
        { id: 'skill2', status: 'archivé', tubeId: 'recTube1', competenceId: 'rec1', pixValue: 10 },
        { id: 'skill3', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 100 },
        { id: 'skill4', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 1000 },
        { id: 'skill5', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 10000 },
        { id: 'skill6', status: 'périmé', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 100000 },
      ],
      challenges: [
        { id: 'challenge1', skillId: 'skill1', status: 'validé' },
        { id: 'challenge2', skillId: 'skill3', status: 'validé' },
        { id: 'challenge3', skillId: 'skill4', status: 'validé' },
        { id: 'challenge4', skillId: 'skill5', status: 'validé' },
      ],
    };

    mockLearningContent(learningContent);

    const answers = [
      domainBuilder.buildAnswer.ok({
        challengeId: 'challenge1',
      }),
      domainBuilder.buildAnswer.ko({
        challengeId: 'challenge2',
      }),
      domainBuilder.buildAnswer.skipped({
        challengeId: 'challenge3',
      }),
      domainBuilder.buildAnswer.ok({
        challengeId: 'challenge4',
      }),
    ];

    const simulation = new OldScoringSimulation({ answers });

    // when
    const simulationResults = await usecases.simulateOldScoring({ simulations: [simulation] });

    // then
    expect(simulationResults).to.have.lengthOf(1);
    expect(simulationResults[0]).to.be.instanceOf(SimulationResult);
    expect(simulationResults[0]).to.have.property('pixScore', 10001);
  });
});
