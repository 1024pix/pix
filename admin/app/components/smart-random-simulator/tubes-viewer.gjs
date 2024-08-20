import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { lt } from 'ember-truth-helpers';

import Card from '../card';
import { SMART_RANDOM_STEPS } from './SMART_RANDOM_STEPS';

const SKILLS_STATUSES = {
  MISSING: 'missing',
  CURRENT: 'current',
  PRESENT: 'present',
  ELIMINATED: 'eliminated',
};

const PRIMARY_COLOR = 'primary';
const NEUTRAL_COLOR = 'neutral';

export default class TubesViewer extends Component {
  levels = [1, 2, 3, 4, 5, 6, 7, 8];

  @tracked showSkillsRewards = true;

  get steps() {
    return this.args.smartRandomLog.steps;
  }

  get predictedLevel() {
    return this.args.smartRandomLog.predictedLevel;
  }

  @action
  getStepTagColor(stepIndex) {
    return stepIndex <= this.args.displayedStepIndex ? PRIMARY_COLOR : NEUTRAL_COLOR;
  }

  @action
  getEliminatedSkillsByStepCount(stepIndex) {
    const currentStep = this.steps[stepIndex];
    const currentStepSkillsCount = currentStep.outputSkills.length;

    if (stepIndex === 0) return this.args.totalNumberOfSkills - currentStepSkillsCount;

    const previousStep = this.steps[stepIndex - 1];
    const previousStepSkillsCount = previousStep.outputSkills.length;

    return previousStepSkillsCount - currentStepSkillsCount;
  }

  @action
  getRemainingSkillsCountAfterStep(stepIndex) {
    return this.steps[stepIndex].outputSkills.length;
  }

  @action
  getSkillStatus(tube, level) {
    const skillInTube = tube.skills.find((skill) => skill.difficulty === level);

    if (!skillInTube) return SKILLS_STATUSES.MISSING;

    const isCurrentSkill = this.isSkillTheCurrentSkill(skillInTube);
    if (isCurrentSkill) return SKILLS_STATUSES.CURRENT;

    const knowledgeElementForSkill = this.knowledgeElementForSkill(skillInTube);
    if (knowledgeElementForSkill) return knowledgeElementForSkill.status;

    const skillInSelectedStep = this.isSkillInSelectedStep(skillInTube);
    if (!skillInSelectedStep) return SKILLS_STATUSES.ELIMINATED;

    return SKILLS_STATUSES.PRESENT;
  }

  @action
  getSkillReward(tube, level) {
    const skillInTube = tube.skills.find((skill) => skill.difficulty === level);

    if (!skillInTube) return '';

    const skillReward = this.args.smartRandomLog.skillRewards.find((skill) => skill.skillId === skillInTube.id);

    if (!skillReward) return '';

    return skillReward.reward.toFixed(1);
  }

  @action
  toggleShowSkillsRewards() {
    this.showSkillsRewards = !this.showSkillsRewards;
  }

  isSkillTheCurrentSkill(skill) {
    return skill.id === this.args.currentSkillId;
  }

  isSkillInSelectedStep(skill) {
    return this.steps[this.args.displayedStepIndex].outputSkills.some((outputSkill) => outputSkill.id === skill.id);
  }

  knowledgeElementForSkill(skill) {
    return this.args.knowledgeElements.find((knowledgeElement) => knowledgeElement.skillId === skill.id);
  }

  getStepName(stepName) {
    return SMART_RANDOM_STEPS[stepName].translatedName;
  }

  getStepDescription(stepName) {
    return SMART_RANDOM_STEPS[stepName].description;
  }

  <template>
    <Card class="admin-form__card" @title="Étapes de sélection">

      <ul class="tubes-viewer__steps">
        <li>
          <PixTag @color="orga">
            <p>État initial</p>
            <p>{{@totalNumberOfSkills}} acquis</p>
          </PixTag>
        </li>

        {{#each this.steps as |step index|}}
          <li aria-label={{this.getStepName step.name}} class={{if (lt index @displayedStepIndex) "selected" ""}}>

            <PixTooltip @isWide={{true}}>

              <:triggerElement>
                <button {{on "click" (fn @selectDisplayedStepIndex index)}} type="button">
                  <PixTag @color="{{this.getStepTagColor index}}">
                    <p>{{this.getStepName step.name}}</p>
                    <p>
                      {{this.getEliminatedSkillsByStepCount index}}
                      acquis filtrés /
                      {{this.getRemainingSkillsCountAfterStep index}}
                      restants
                    </p>
                  </PixTag>
                </button>
              </:triggerElement>

              <:tooltip>
                {{this.getStepDescription step.name}}
              </:tooltip>

            </PixTooltip>

          </li>
        {{/each}}
      </ul>

      <p>Niveau prédit de l'utilisateur: {{if this.predictedLevel this.predictedLevel "N/A"}}</p>

      <p>
        <PixCheckbox {{on "change" this.toggleShowSkillsRewards}} checked={{this.showSkillsRewards}}>
          <:label>Afficher la lucrativité des acquis</:label>
        </PixCheckbox>
      </p>

      <table class="tubes-viewer__table">

        <caption class="tubes-viewer__table__captions">
          <ul>
            <li class="tubes-viewer__table__caption">
              <span class="tubes-viewer__table__skill current" />Acquis en cours
            </li>
            <li class="tubes-viewer__table__caption">
              <span class="tubes-viewer__table__skill present" />Acquis non évalué
            </li>
            <li class="tubes-viewer__table__caption">
              <span class="tubes-viewer__table__skill validated" />Validé par l'utilisateur
            </li>
            <li class="tubes-viewer__table__caption">
              <span class="tubes-viewer__table__skill invalidated" />Invalidé par l'utilisateur
            </li>
            <li class="tubes-viewer__table__caption">
              <span class="tubes-viewer__table__skill eliminated" />Éliminé par les filtres
            </li>
          </ul>
        </caption>

        <thead>
          <tr>
            <th>Sujet</th>
            {{#each this.levels as |level|}}
              <th>{{level}}</th>
            {{/each}}
          </tr>
        </thead>

        <tbody>
          {{#each @tubes as |tube|}}
            <tr>
              <th class="tubes-viewer__table__name">{{tube.name}}</th>
              {{#each this.levels as |level|}}
                <td aria-label="{{tube.name}}{{level}}">
                  <span class="tubes-viewer__table__skill {{this.getSkillStatus tube level}}">
                    {{#if this.showSkillsRewards}}
                      {{this.getSkillReward tube level}}
                    {{/if}}
                  </span>
                </td>
              {{/each}}
            </tr>
          {{/each}}
        </tbody>

      </table>

    </Card>
  </template>
}
