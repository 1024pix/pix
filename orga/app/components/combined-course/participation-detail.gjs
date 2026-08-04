import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ActivityType from 'pix-orga/components/activity-type';
import Breadcrumb from 'pix-orga/components/ui/breadcrumb';
import PageTitle from 'pix-orga/components/ui/page-title';
import ParticipationStatus from 'pix-orga/components/ui/participation-status';

const ITEM_TYPES = {
  CAMPAIGN: 'CAMPAIGN',
  FORMATION: 'FORMATION',
  MODULE: 'MODULE',
};

export default class ParticipationDetail extends Component {
  @service intl;

  getStepLabel = (index, hasMultipleSteps) => {
    if (!hasMultipleSteps) return '';
    return this.intl.t('pages.combined-course.participation-detail.step-label', { number: index + 1 });
  };

  getColumnLabel = (items) => {
    if (!items || items.length === 0) return '';
    const firstItemType = items[0].type;
    const key = firstItemType === ITEM_TYPES.CAMPAIGN ? 'campaign' : 'module';
    return this.intl.t(`pages.combined-course.participation-detail.column.${key}`);
  };

  getParticipationStatus = (item) => {
    switch (true) {
      case item.isLocked:
        return 'LOCKED';
      case item.isCompleted:
        return 'COMPLETED';
      case item.participationStatus === 'NOT_STARTED':
        return 'NOT_STARTED';
      default:
        return 'STARTED';
    }
  };

  getFormattedMasteryRate = (masteryRate) => {
    const rate = masteryRate ?? 0;
    return `${Math.trunc(rate * 100, 0)} %`;
  };

  isCampaign = (items) => {
    const firstItemType = items[0].type;
    return firstItemType === ITEM_TYPES.CAMPAIGN;
  };

  isFormation = (type) => {
    return type === ITEM_TYPES.FORMATION;
  };

  get breadcrumbLinks() {
    return [
      {
        route: 'authenticated.campaigns.list.my-campaigns',
        label: this.intl.t('navigation.main.campaigns'),
      },
      {
        route: 'authenticated.campaigns.combined-courses',
        label: this.intl.t('navigation.main.combined-courses'),
      },
      {
        route: 'authenticated.combined-course',
        label: this.args.combinedCourse.name,
        model: this.args.combinedCourse.id,
      },
      {
        label: this.intl.t('pages.combined-course.participation-detail.breadcrumb', {
          firstName: this.args.participation.firstName,
          lastName: this.args.participation.lastName,
        }),
      },
    ];
  }

  get hasMultipleSteps() {
    return this.args.itemsBySteps?.length > 1;
  }

  <template>
    <PageTitle>
      <:breadcrumb>
        <Breadcrumb @links={{this.breadcrumbLinks}} class="campaign-header-title__breadcrumb" />
      </:breadcrumb>
      <:title>
        {{@participation.firstName}}
        {{@participation.lastName}}
      </:title>
    </PageTitle>

    {{#each @itemsBySteps as |items index|}}
      {{#if this.hasMultipleSteps}}
        <h2 class="participation-detail__step-title">{{this.getStepLabel index this.hasMultipleSteps}}</h2>
      {{/if}}

      <PixTable
        @variant="orga"
        @caption={{this.getStepLabel index this.hasMultipleSteps}}
        @data={{items}}
        class="table"
      >
        <:columns as |item context|>

          <PixTableColumn @context={{context}}>
            <:header>
              {{this.getColumnLabel items}}
            </:header>

            <:cell>
              <span class="participation-detail__item-title">
                <ActivityType @type={{item.type}} @hideLabel={{true}} />
                {{#if (this.isFormation item.type)}}
                  {{t "pages.combined-course.participation-detail.formation-locked"}}
                {{else}}
                  {{item.title}}
                {{/if}}
              </span>
            </:cell>
          </PixTableColumn>

          {{#if (this.isCampaign items)}}
            <PixTableColumn @context={{context}} class="participation-detail__mastery-rate-column">
              <:header>
                {{t "pages.combined-course.participation-detail.column.mastery-rate"}}
              </:header>
              <:cell>
                {{this.getFormattedMasteryRate item.masteryRate}}
              </:cell>
            </PixTableColumn>
          {{/if}}

          <PixTableColumn @context={{context}} class="participation-detail__status-column">
            <:header>
              {{t "pages.combined-course.participation-detail.column.status"}}
            </:header>
            <:cell>
              {{#if (this.isFormation item.type)}}
                <span aria-label={{t "pages.combined-course.participation-detail.formation-locked"}}>-</span>
              {{else}}
                <ParticipationStatus @status={{this.getParticipationStatus item}} />
              {{/if}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    {{/each}}
  </template>
}
