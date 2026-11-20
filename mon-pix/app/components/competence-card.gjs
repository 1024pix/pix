import { service } from '@ember/service';
import Component from '@glimmer/component';
import CompetenceCardDefault from 'mon-pix/components/competence-card-default';
import CompetenceCardMobile from 'mon-pix/components/competence-card-mobile';

export default class CompetenceCard extends Component {
  @service media;

  <template>
    {{#if this.media.isMobile}}
      <CompetenceCardMobile @interactive={{@interactive}} @scorecard={{@scorecard}} />
    {{else}}
      <CompetenceCardDefault @interactive={{@interactive}} @scorecard={{@scorecard}} />
    {{/if}}
  </template>
}
