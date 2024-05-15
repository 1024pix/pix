import { FlashAssessmentAlgorithm } from '../../../../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithm.js';
import { FlashAssessmentAlgorithmRuleEngine } from '../../../../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithmRuleEngine.js';

export const buildFlashAssessmentAlgorithm = ({ flashAlgorithmImplementation, configuration, ruleEngine }) => {
  return new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation,
    configuration,
    ruleEngine: ruleEngine ?? new FlashAssessmentAlgorithmRuleEngine([], {}),
  });
};
