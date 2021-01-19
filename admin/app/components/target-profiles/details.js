import Component from '@glimmer/component';

import ENV from 'pix-admin/config/environment';

export default class TargetProfileDetails extends Component {
  get competenceList() {
    const { areas } = this.args.targetProfile;
    return areas.toArray().flatMap((area) => this._buildCompetencesOfArea(area));
  }

  _buildCompetencesOfArea(area) {
    const { competences } = this.args.targetProfile;
    return competences
      .filter((competence) => competence.areaId === area.id)
      .map((competence) => ({
        name: competence.name,
        area,
        tubes: this._buildTubeOfCompetence(competence.id),
      }));
  }

  _buildTubeOfCompetence(competenceId) {
    const { tubes } = this.args.targetProfile;
    return tubes
      .filter((tube) => tube.competenceId === competenceId)
      .map((tube) => ({
        practicalTitle: tube.practicalTitle,
        skills: this._buildTubeSkillsByLevel(tube.id),
      }));
  }

  _buildTubeSkillsByLevel(tubeId) {
    const { skills } = this.args.targetProfile;
    const tubeSkills = skills.filter((skill) => skill.tubeId === tubeId);
    return [...Array(ENV.APP.MAX_LEVEL)].map((_, index) => {
      return tubeSkills.find((skill) => skill.difficulty === index + 1);
    });
  }
}
