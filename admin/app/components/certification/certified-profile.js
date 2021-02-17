import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';

export default class CertifiedProfile extends Component {
  get certifiedCompetenceList() {
    const { certifiedAreas } = this.args.certifiedProfile;
    return certifiedAreas.toArray().flatMap((certifiedArea) => this._buildCertifiedCompetencesOfCertifiedArea(certifiedArea));
  }

  get difficultyLevels() {
    return Array.from({ length: ENV.APP.MAX_LEVEL }, (_, i) => i + 1);
  }

  _buildCertifiedCompetencesOfCertifiedArea(certifiedArea) {
    const { certifiedCompetences } = this.args.certifiedProfile;
    return certifiedCompetences
      .filter((certifiedCompetence) => certifiedCompetence.areaId === certifiedArea.id)
      .map((certifiedCompetence) => ({
        name: certifiedCompetence.name,
        certifiedArea,
        certifiedTubes: this._buildCertifiedTubeOfCertifiedCompetence(certifiedCompetence.id),
      }));
  }

  _buildCertifiedTubeOfCertifiedCompetence(certifiedCompetenceId) {
    const { certifiedTubes } = this.args.certifiedProfile;
    return certifiedTubes
      .filter((certifiedTube) => certifiedTube.competenceId === certifiedCompetenceId)
      .map((certifiedTube) => ({
        name: certifiedTube.name,
        certifiedSkills: this._buildCertifiedTubeSkillsByLevel(certifiedTube.id),
      }));
  }

  _buildCertifiedTubeSkillsByLevel(certifiedTubeId) {
    const { certifiedSkills } = this.args.certifiedProfile;
    const tubeSkills = certifiedSkills.filter((certifiedSkill) => certifiedSkill.tubeId === certifiedTubeId);
    return this.difficultyLevels.map((_, index) => {
      return tubeSkills.find((skill) => skill.difficulty === index + 1);
    });
  }
}
