import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Breadcrumb from '../ui/breadcrumb';

export default class MissionDetails extends Component {
  @service intl;
  get breadcrumbLinks() {
    return [
      {
        route: 'authenticated.missions',
        label: this.intl.t('navigation.main.missions'),
      },
      {
        route: 'authenticated.missions.mission',
        label: this.args.mission.name,
      },
    ];
  }

  get displayObjectives() {
    return this.args.mission.learningObjectives?.split('\n');
  }

  <template>
    <header class="mission-header">
      <Breadcrumb @links={{this.breadcrumbLinks}} />
      <div class="mission-header-informations">
        <h1 class="mission-header-informations__title">
          {{@mission.name}}
        </h1>
        <div class="mission-header-informations__details">
          <p class="competence-title">
            {{t "pages.missions.mission.details.competence.title"}}
          </p>
          <p class="competence-name">
            {{@mission.competenceName}}
          </p>
          {{#if @mission.documentationUrl}}
            <PixButtonLink
              class="mission-header-informations__documentation-button"
              @href={{@mission.documentationUrl}}
              target="_blank "
            >
              {{t "pages.missions.mission.details.button-label"}}</PixButtonLink>
          {{/if}}
        </div>
      </div>

      <div class="mission-header-objectives">
        {{#if this.displayObjectives}}
          <h2>
            {{t "pages.missions.mission.details.objective.title"}}
          </h2>
          <ul class="mission-header-objectives__list">
            {{#each this.displayObjectives as |objective|}}
              <li>
                {{objective}}
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </div>
    </header>
  </template>
}
