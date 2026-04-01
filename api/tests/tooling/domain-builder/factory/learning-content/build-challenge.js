import { Challenge } from '../../../../../src/learning-content/domain/models/Challenge.js';

export function buildChallenge({
  id = 'challengeFoo123',
  accessibility1 = 'OK',
  accessibility2 = 'OK',
  skillId = 'skillFoo123',
} = {}) {
  return new Challenge({
    id,
    accessibility1,
    accessibility2,
    skillId,
  });
}
