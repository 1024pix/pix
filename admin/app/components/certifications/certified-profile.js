import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import partition from 'lodash/partition';
import ENV from 'pix-admin/config/environment';

export default class CertifiedProfile extends Component {
  @tracked certifiedAreas = [];
  @tracked certifiedCompetences = [];
  @tracked certifiedTubes = [];
  @tracked certifiedSkills = [];
  constructor() {
    super(...arguments);
    this.args.certifiedProfile.certifiedAreas.then((certifiedAreas) => {
      this.certifiedAreas = certifiedAreas;
    });
    this.args.certifiedProfile.certifiedCompetences.then((certifiedCompetences) => {
      this.certifiedCompetences = certifiedCompetences;
    });
    this.args.certifiedProfile.certifiedTubes.then((certifiedTubes) => {
      this.certifiedTubes = certifiedTubes;
    });
    this.args.certifiedProfile.certifiedSkills.then((certifiedSkills) => {
      this.certifiedSkills = certifiedSkills;
    });
  }

  get certifiedCompetenceList() {
    const competencesOfCertifiedAreas = this.certifiedAreas
      .toArray()
      .flatMap((certifiedArea) => this._buildCertifiedCompetencesOfCertifiedArea(certifiedArea));

    const [pixCompetences, nonPixCompetences] = partition(competencesOfCertifiedAreas, { origin: 'Pix' });
    const certifiedCompetencesGroupedByOriginWithNonPixCompetencesFirst = [...nonPixCompetences, ...pixCompetences];

    return certifiedCompetencesGroupedByOriginWithNonPixCompetencesFirst;
  }

  get difficultyLevels() {
    return Array.from({ length: ENV.APP.MAX_LEVEL }, (_, i) => i + 1);
  }

  _buildCertifiedCompetencesOfCertifiedArea(certifiedArea) {
    return this.certifiedCompetences
      .filter((certifiedCompetence) => certifiedCompetence.areaId === certifiedArea.id)
      .map((certifiedCompetence) => ({
        name: certifiedCompetence.name,
        certifiedArea,
        certifiedTubes: this._buildCertifiedTubeOfCertifiedCompetence(certifiedCompetence.id),
        origin: certifiedCompetence.origin,
      }));
  }

  _buildCertifiedTubeOfCertifiedCompetence(certifiedCompetenceId) {
    return this.certifiedTubes
      .filter((certifiedTube) => certifiedTube.competenceId === certifiedCompetenceId)
      .map((certifiedTube) => ({
        name: certifiedTube.name,
        certifiedSkills: this._buildCertifiedTubeSkillsByLevel(certifiedTube.id),
      }));
  }

  _buildCertifiedTubeSkillsByLevel(certifiedTubeId) {
    const tubeSkills = this.certifiedSkills.filter((certifiedSkill) => certifiedSkill.tubeId === certifiedTubeId);
    return this.difficultyLevels.map((_, index) => {
      return tubeSkills.find((skill) => skill.difficulty === index + 1);
    });
  }
}
