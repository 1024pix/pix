import Component from '@glimmer/component';

const MAX_LEVEL = 8;

export default class OldDetails extends Component {
  computeSkillLevelChecks(tube) {
    const skillLevelChecks = [];
    for (let i = 1; i <= MAX_LEVEL; ++i) {
      const foundSkill = tube.skills.find((skill) => skill.difficulty === i);
      skillLevelChecks.push({
        name: foundSkill?.name,
        tooltip: `${foundSkill?.id} ${foundSkill?.name}`,
        isChecked: Boolean(foundSkill),
      });
    }
    return skillLevelChecks;
  }

  get maxLevelAsArray() {
    return Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);
  }
}
