import * as flashAlgorithmService from '../../../../../../src/certification/flash-certification/domain/services/algorithm-methods/flash.js';
import { scoringDegradationService } from '../../../../../../src/certification/scoring/domain/services/scoring-degradation-service.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | services | scoringDegradationService', function () {
  it('should degrade the initial capacity', function () {
    // given
    const initialCapacity = 2;
    const allChallenges = _buildChallenges();
    const allAnswers = _buildAnswers();
    const flashAssessmentAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
      warmUpLength: 0,
      forcedCompetences: [],
      maximumAssessmentLength: 4,
      challengesBetweenSameCompetence: 0,
      minimumEstimatedSuccessRateRanges: [],
      limitToOneQuestionPerTube: false,
      enablePassageByAllCompetences: false,
      doubleMeasuresUntil: null,
      variationPercent: null,
      variationPercentUntil: null,
      createdAt: new Date('2020-01-01T00:00:00Z'),
    });

    const algorithm = domainBuilder.buildFlashAssessmentAlgorithm({
      flashAlgorithmImplementation: flashAlgorithmService,
      configuration: flashAssessmentAlgorithmConfiguration,
    });

    // when
    const degradedCapacity = scoringDegradationService.downgradeCapacity({
      algorithm,
      capacity: initialCapacity,
      allChallenges,
      allAnswers,
      flashAssessmentAlgorithmConfiguration,
    });

    expect(degradedCapacity).to.be.lessThan(initialCapacity);
  });

  describe('when used in simulation', function () {
    it('should return all necessary information about the challenge', function () {
      // given
      const initialCapacity = 2;
      const allChallenges = _buildChallenges();
      const allAnswers = _buildAnswers();
      const flashAssessmentAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        warmUpLength: 0,
        forcedCompetences: [],
        maximumAssessmentLength: 4,
        challengesBetweenSameCompetence: 0,
        minimumEstimatedSuccessRateRanges: [],
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        doubleMeasuresUntil: null,
        variationPercent: null,
        variationPercentUntil: null,
        createdAt: new Date('2020-01-01T00:00:00Z'),
      });
      const isSimulation = true;

      const algorithm = domainBuilder.buildFlashAssessmentAlgorithm({
        flashAlgorithmImplementation: flashAlgorithmService,
        configuration: flashAssessmentAlgorithmConfiguration,
      });

      const expectedResult = {
        answerStatus: {
          status: 'aband',
        },
        capacity: 1.8865666221427848,
        challenge: {
          alternativeInstruction: 'Des instructions alternatives',
          alternativeVersion: undefined,
          answer: undefined,
          attachments: ['URL pièce jointe'],
          autoReply: false,
          competenceId: 'recCOMP1',
          difficulty: 1.5,
          discriminant: 5,
          embedHeight: undefined,
          embedTitle: undefined,
          embedUrl: undefined,
          focused: false,
          format: 'petit',
          id: 'recChallenge4',
          illustrationAlt: "Le texte de l'illustration",
          illustrationUrl: "Une URL vers l'illustration",
          instruction: 'Des instructions',
          locales: ['fr'],
          proposals: 'Une proposition',
          responsive: 'Smartphone/Tablette',
          shuffled: false,
          skill: {
            competenceId: 'recCOMP123',
            difficulty: 6,
            id: 'skill4',
            learningMoreTutorialIds: [],
            name: '@sau6',
            pixValue: 3,
            tubeId: 'recTUB123',
            tutorialIds: [],
            version: 1,
          },
          status: 'validé',
          timer: undefined,
          type: 'QCM',
          validator: {
            solution: undefined,
          },
        },
        errorRate: 0.3062198687924602,
        reward: 0.001531962907934412,
      };

      // when
      const result = scoringDegradationService.downgradeCapacity({
        algorithm,
        capacity: initialCapacity,
        allChallenges,
        allAnswers,
        flashAssessmentAlgorithmConfiguration,
        isSimulation,
      });

      expect(result).to.deep.equal(expectedResult);
    });
  });
});

const _buildChallenges = () => {
  const allChallenges = [];
  for (let index = 1; index < 5; index++) {
    allChallenges.push(
      domainBuilder.buildChallenge({
        id: `recChallenge${index}`,
        difficulty: 1.5,
        discriminant: 5,
        skill: domainBuilder.buildSkill({ id: `skill${index}` }),
      }),
    );
  }

  return allChallenges;
};

const _buildAnswers = () => {
  const allAnswers = [];
  for (let index = 1; index <= 3; index++) {
    allAnswers.push(
      domainBuilder.buildAnswer({
        challengeId: `recChallenge${index}`,
      }),
    );
  }

  return allAnswers;
};
