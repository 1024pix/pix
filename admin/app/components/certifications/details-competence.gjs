import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';

import Card from '../card';
import CertificationDetailsAnswer from './details-answer';

export default class CertificationDetailsCompetence extends Component {
  constructor() {
    super(...arguments);
  }

  get certifiedWidth() {
    const obtainedLevel = this.args.competence.obtainedLevel;
    return htmlSafe('width:' + Math.round((obtainedLevel / 8) * 100) + '%');
  }

  get positionedWidth() {
    const positionedLevel = this.args.competence.positionedLevel;
    return htmlSafe('width:' + Math.round((positionedLevel / 8) * 100) + '%');
  }

  get answers() {
    const competence = this.args.competence;
    return competence.answers;
  }

  <template>
    <Card @title="{{@competence.index}} {{@competence.name}}" class="certification-details-competence">
      <div class="certification-details-competence__content">
        <div class="certification-details-competence__content__header">
          <div>Positionné :</div>
          <div class="progress">
            <div
              aria-label="Jauge de compétences positionnées"
              class="progress-bar"
              role="progressbar"
              aria-valuenow="{{@competence.positionedLevel}}"
              aria-valuemin="0"
              aria-valuemax="8"
              style={{this.positionedWidth}}
            >{{@competence.positionedLevel}}</div>
          </div>
          <div class="competence-score">{{@competence.positionedScore}} Pix</div>
        </div>
        <div class="certification-details-competence__content__header">
          <div>Certifié :</div>
          <div class="progress">
            <div
              aria-label="Jauge de compétences certifiées"
              class="progress-bar certificate"
              role="progressbar"
              aria-valuenow="{{@competence.obtainedLevel}}"
              aria-valuemin="0"
              aria-valuemax="8"
              style={{this.certifiedWidth}}
            >{{@competence.obtainedLevel}}</div>
          </div>
          <div class="certificate">{{@competence.obtainedScore}} Pix</div>
        </div>
        <div class="certification-details-competence-challenges">
          {{#each this.answers as |answer|}}
            <CertificationDetailsAnswer @answer={{answer}} />
          {{/each}}
        </div>
      </div>
    </Card>
  </template>
}
