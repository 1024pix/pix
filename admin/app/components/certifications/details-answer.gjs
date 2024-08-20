import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import Card from '../card';

const options = [
  { value: 'ok', label: 'Succès' },
  { value: 'ko', label: 'Échec' },
  { value: 'timedout', label: 'Temps écoulé' },
  { value: 'focusedOut', label: 'Focus échoué' },
  { value: 'aband', label: 'Passée' },
  { value: 'skip', label: 'Neutralisée' },
  { value: 'skippedAutomatically', label: 'Abandon' },
  { value: 'noResponse', label: 'Non répondue' },
];

export default class CertificationDetailsAnswer extends Component {
  @tracked selectedOption = null;
  @tracked hasJuryResult = false;

  constructor() {
    super(...arguments);
    this.resultOptions = options;
    this.selectedOption = this._answerResultValue();
  }

  get resultClass() {
    return this.hasJuryResult ? 'jury' : null;
  }

  get linkToChallengePreviewInPixApp() {
    return `https://app.recette.pix.fr/challenges/${this.args.answer.challengeId}/preview`;
  }

  get resultLabel() {
    return this.resultOptions.find((option) => option.value === this.selectedOption).label;
  }

  get linkToChallengeInfoInPixEditor() {
    return `https://editor.pix.fr/challenge/${this.args.answer.challengeId}`;
  }

  _answerResultValue() {
    if (this.args.answer.isNeutralized) {
      return 'skip';
    }
    if (this.args.answer.hasBeenSkippedAutomatically) {
      return 'skippedAutomatically';
    }
    return this.args.answer.result ?? 'noResponse';
  }

  <template>
    <Card class="certification-details-answer">
      <div class="certification-details-card">
        <div class="certification-details-answer-order">
          {{@answer.order}}
        </div>
        <div class="certification-details-answer-skill">
          {{@answer.skill}}
        </div>
        <div class="certification-details-answer-challenge">
          <div>
            {{@answer.challengeId}}
          </div>
          <div class="certification-details-answer-challenge-links">
            <a href={{this.linkToChallengePreviewInPixApp}} target="_blank" rel="noreferrer noopener">
              Preview
            </a>|
            <a href={{this.linkToChallengeInfoInPixEditor}} target="_blank" rel="noreferrer noopener">
              Info
            </a>
          </div>
        </div>
        <div class="certification-details-answer-value">
          {{@answer.value}}
        </div>
      </div>
      <div class="card-footer">
        <p>{{this.resultLabel}}</p>
      </div>
    </Card>
  </template>
}
