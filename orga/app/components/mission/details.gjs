import { PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Breadcrumb from '../ui/breadcrumb';
import PageTitle from '../ui/page-title';

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
      <PageTitle>
        <:breadcrumb>
          <Breadcrumb @links={{this.breadcrumbLinks}} />
        </:breadcrumb>
        <:title>
          {{@mission.name}}
        </:title>
        <:tools>
          {{#if @mission.documentationUrl}}
            <PixButtonLink
              class="mission-header-informations__documentation-button"
              @href={{@mission.documentationUrl}}
              target="_blank "
            >
              <PixIcon @name="openNew" />
              {{t "pages.missions.mission.details.button-label"}}
            </PixButtonLink>
          {{/if}}
        </:tools>
      </PageTitle>

      <section class="mission-header-objectives">
        <div>
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
        <div class="mission-header-objectives__competence">
          <h2>
            {{t "pages.missions.mission.details.competence.title"}}
          </h2>
          <p>
            {{@mission.competenceName}}
          </p>
        </div>
      </section>
    </header>
  </template>
}
