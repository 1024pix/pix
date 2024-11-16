import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { concat } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { pageTitle } from 'ember-page-title';
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
    {{pageTitle "Certif " @certifiedProfile.id " Profil | Pix Admin" replace=true}}
    <div class="profile">
      <section class="page-section profile__header">
        <div>
          <p>ID du compte Pix du candidat: {{@certifiedProfile.userId}}</p>
          <p>ID de la certification du candidat: {{@certifiedProfile.id}}</p>
        </div>
        <div class="legend">
          <p>
            <PixIcon @name="doneAll" class="skill-icon skill-icon--tested-in-certif" />
            Acquis proposé en certification
          </p>
          <p>
            <PixIcon @name="check" class="skill-icon skill-icon--check" />
            Acquis validé en direct ou par inférence en positionnement au moment du test de certification
          </p>
        </div>
      </section>
      {{#each this.certifiedCompetenceList as |certifiedCompetence|}}
        <section class="page-section competence">
          <span class="competence__border competence__border--{{certifiedCompetence.certifiedArea.color}}"></span>
          <div>
            <div class="competence__header">
              <h2 class="competence__title">{{certifiedCompetence.name}}</h2>
              <sub class="competence__subtitle">{{certifiedCompetence.certifiedArea.name}}</sub>
            </div>
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
                              <PixIcon
                                @name="doneAll"
                                class="skill-icon skill-icon--tested-in-certif"
                                aria-label={{certifiedSkill.name}}
                              />
                            </:triggerElement>
                            <:tooltip>{{concat certifiedSkill.id " " certifiedSkill.name}}</:tooltip>
                          </PixTooltip>
                        {{else if certifiedSkill}}
                          <PixTooltip @position="bottom">
                            <:triggerElement>
                              <PixIcon
                                @name="check"
                                class="skill-icon skill-icon--check"
                                aria-label={{certifiedSkill.name}}
                              />
                            </:triggerElement>
                            <:tooltip>{{concat certifiedSkill.id " " certifiedSkill.name}}</:tooltip>
                          </PixTooltip>
                        {{else}}
                          <PixIcon @name="close" class="skill-icon skill-icon--uncheck" />
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
    </div>
  </template>
}
