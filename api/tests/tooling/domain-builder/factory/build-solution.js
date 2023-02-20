import Solution from '../../../../lib/domain/models/Solution';

export default function buildSolution({
  id = 'recCHAL123',
  type = 'QCM',
  value = '1',
  isT1Enabled = false,
  isT2Enabled = false,
  isT3Enabled = false,
  scoring = '',
} = {}) {
  return new Solution({
    id,
    type,
    value,
    isT1Enabled,
    isT2Enabled,
    isT3Enabled,
    scoring,
  });
}
