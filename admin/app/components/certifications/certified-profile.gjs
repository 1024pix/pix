import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { concat } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
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

  <template>
    {{#each this.certifiedCompetenceList as |certifiedCompetence|}}
      <section class="page-section competence">
        <span class="competence__border competence__border--{{certifiedCompetence.certifiedArea.color}}"></span>
        <div>
          <header class="competence__header">
            <h2 class="competence__title">{{certifiedCompetence.name}}</h2>
            <sub class="competence__subtitle">{{certifiedCompetence.certifiedArea.name}}</sub>
          </header>
          <table class="table-admin">
            <thead>
              <tr>
                <th class="table__column table__column--wide">Sujet</th>
                {{#each this.difficultyLevels as |difficultyLevel|}}
                  <th class="table__column table__column--small table__column--center">Niveau {{difficultyLevel}}</th>
                {{/each}}
              </tr>
            </thead>
            <tbody>
              {{#each certifiedCompetence.certifiedTubes as |certifiedTube|}}
                <tr>
                  <td>{{certifiedTube.name}}</td>
                  {{#each certifiedTube.certifiedSkills as |certifiedSkill|}}
                    <td class="table__column--center skill-column">
                      {{#if certifiedSkill.hasBeenAskedInCertif}}
                        <PixTooltip @position="bottom">
                          <:triggerElement>
                            <FaIcon
                              @icon="check-double"
                              class="skill-column--tested-in-certif"
                              aria-label={{certifiedSkill.name}}
                            />
                          </:triggerElement>
                          <:tooltip>{{concat certifiedSkill.id " " certifiedSkill.name}}</:tooltip>
                        </PixTooltip>
                      {{else if certifiedSkill}}
                        <PixTooltip @position="bottom">
                          <:triggerElement>
                            <FaIcon @icon="check" class="skill-column--check" aria-label={{certifiedSkill.name}} />
                          </:triggerElement>
                          <:tooltip>{{concat certifiedSkill.id " " certifiedSkill.name}}</:tooltip>
                        </PixTooltip>
                      {{else}}
                        <FaIcon @icon="xmark" class="skill-column--uncheck" />
                      {{/if}}
                    </td>
                  {{/each}}
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      </section>
    {{else}}
      <section class="page-section">
        <div class="table__empty">Profil certifié vide.</div>
      </section>
    {{/each}}
  </template>
}
