import {
  Accessibility,
  CalibratedChallenge,
} from '../../../../../../src/certification/evaluation/domain/models/CalibratedChallenge.js';
import { buildCalibratedChallengeSkill } from './build-calibrated-challenge-skill.js';

export function buildCalibratedChallenge({
  id = 'recCHAL1',
  discriminant = 1,
  difficulty = 0,
  blindnessCompatibility = Accessibility.OK,
  colorBlindnessCompatibility = Accessibility.RAS,
  skill = buildCalibratedChallengeSkill(),
} = {}) {
  return new CalibratedChallenge({
    id,
    discriminant,
    difficulty,
    blindnessCompatibility,
    colorBlindnessCompatibility,
    skill,
  });
}
