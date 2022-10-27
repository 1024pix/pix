import Component from '@glimmer/component';
import { action } from '@ember/object';
import times from 'lodash/times';

import ENV from 'pix-admin/config/environment';

export default class SkillSetCriterion extends Component {
  get allLevels() {
    return times(ENV.APP.MAX_LEVEL, (index) => index + 1);
  }

  @action
  getTubeForSkillSet(skillIds) {
    return this.args.targetProfile.oldAreas
      .toArray()
      .flatMap((area) => area.competences.toArray().flatMap((competence) => competence.tubes.toArray()))
      .filter((tube) => tube.skills.any((skill) => skillIds.includes(skill.id)))
      .map((tube) => ({
        tubeTitle: tube.practicalTitle,
        skillsWithAllLevels: this.allLevels.map((level) => tube.skills.find((skill) => skill.difficulty === level)),
      }));
  }
}
