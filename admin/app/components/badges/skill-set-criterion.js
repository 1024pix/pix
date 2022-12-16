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
      .map((tube) => ({
        tube,
        skills: tube.skills.filter((skill) => skillIds.includes(skill.id)),
      }))
      .filter(({ skills }) => skills.length !== 0)
      .map(({ tube, skills }) => ({
        tubeTitle: tube.practicalTitle,
        skillsWithAllLevels: this.allLevels.map((level) => skills.find((skill) => skill.difficulty === level)),
      }));
  }
}
