import Hint from '../../../../lib/domain/models/Hint';

export default function buildHint({ skillName = '@web2', value = 'Pense à regarder les indices' } = {}) {
  return new Hint({
    skillName,
    value,
  });
}
