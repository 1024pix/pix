import { PixBlock, PixIcon, PixProgressBar, PixSelect } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { formatDate, t } from 'ember-intl';
import { and } from 'ember-truth-helpers';

import Badges from '../../campaign/badges';
import Breadcrumb from '../../ui/breadcrumb';
import Information from '../../ui/information';
import InformationWrapper from '../../ui/information-wrapper';
import MasteryPercentageDisplay from '../../ui/mastery-percentage-display';
import PageTitle from '../../ui/page-title';
import LinkToOrganizationLearner from '../link-to';

export default class Header extends Component {
  @service intl;
  @service currentUser;
  @service router;

  get breadcrumbLinks() {
    return [
      {
        route: 'authenticated.campaigns',
        label: this.intl.t('navigation.main.campaigns'),
      },
      {
        route: 'authenticated.campaigns.campaign.activity',
        label: this.args.campaign.name,
        model: this.args.campaign.id,
      },
      {
        route: 'authenticated.campaigns.participant-assessment',
        label: this.intl.t('pages.assessment-individual-results.breadcrumb-current-page-label', {
          firstName: this.args.participation.firstName,
          lastName: this.args.participation.lastName,
        }),
        models: [this.args.campaign.id, this.args.participation.id],
      },
    ];
  }

  get participationsListOptions() {
    let participationNumber = this.args.allParticipations.length;

    const options = this.args.allParticipations.map((participation) => {
      let category;
      let label = this.intl.t('pages.assessment-individual-results.participation-label', { participationNumber });

      if (participation.sharedAt) {
        const participationDate = this.intl.formatDate(participation.sharedAt);
        label = `${label} - ${participationDate}`;
      }

      if (participation.status === 'SHARED') {
        category = `— ${this.intl.t('pages.assessment-individual-results.participation-shared')} —`;
      } else {
        category = `— ${this.intl.t('pages.assessment-individual-results.participation-not-shared')} —`;
      }

      participationNumber--;

      return {
        value: participation.id,
        label,
        category,
      };
    });

    return options;
  }

  get displayProgression() {
    const { participation } = this.args;
    return !participation.isShared;
  }

  get selectedParticipation() {
    return this.participationsListOptions.find((participation) => participation.value === this.args.participation.id);
  }

  @action
  selectAParticipation(participationId) {
    this.router.transitionTo('authenticated.campaigns.participant-assessment', this.args.campaign.id, participationId);
  }

  <template>
    <PageTitle>
      <:breadcrumb>
        <Breadcrumb @links={{this.breadcrumbLinks}} />
      </:breadcrumb>
      <:title>
        {{@participation.firstName}}
        {{@participation.lastName}}
      </:title>
      <:subtitle>
        <span class="participant__link">
          <PixIcon @name="infoUser" @plainIcon={{true}} />
          <LinkToOrganizationLearner @organizationLearnerId={{@participation.organizationLearnerId}}>
            {{t "common.actions.link-to-participant"}}
          </LinkToOrganizationLearner>
        </span>
      </:subtitle>
    </PageTitle>

    <PixBlock class="participant-header" @variant="orga">
      <header class="panel-header__headline panel-header__headline--with-right-content">
        <h2 class="panel-header-title">{{@campaign.name}}</h2>
        {{#if @campaign.multipleSendings}}
          <PixSelect
            @options={{this.participationsListOptions}}
            @value={{this.selectedParticipation.value}}
            @onChange={{this.selectAParticipation}}
            @inlineLabel={{true}}
            @hideDefaultOption={{true}}
          >
            <:label>{{t "pages.assessment-individual-results.participation-selector"}}</:label>
          </PixSelect>
        {{/if}}
      </header>

      <div class="panel-header__body">
        <InformationWrapper>
          {{#if (and @participation.participantExternalId @campaign.externalIdLabel)}}
            <Information>
              <:title>{{@campaign.externalIdLabel}}</:title>
              <:content>{{@participation.participantExternalId}}</:content>
            </Information>
          {{/if}}
          <Information>
            <:title>{{t "pages.campaign-individual-results.start-date"}}</:title>
            <:content>{{formatDate @participation.createdAt format="LLL"}}</:content>
          </Information>
          {{#if this.displayProgression}}
            <Information>
              <:title>{{t "pages.assessment-individual-results.progression"}}</:title>
              <:content>{{t "common.result.percentage" value=@participation.progression}}</:content>
            </Information>
          {{/if}}
          {{#if @participation.isShared}}
            <Information>
              <:title>{{t "pages.campaign-individual-results.shared-date"}}</:title>
              <:content>{{formatDate @participation.sharedAt format="LLL"}}</:content>
            </Information>
          {{/if}}
        </InformationWrapper>

        {{#if @participation.isShared}}
          <ul class="panel-header__data panel-header__data--highlight">
            {{#if @campaign.hasBadges}}
              <li
                aria-label={{t "pages.assessment-individual-results.badges"}}
                class="panel-header-data__content panel-header-data-content__badges"
              >
                <Badges @badges={{@campaign.badges}} @acquiredBadges={{@participation.badges}} />
              </li>
            {{/if}}
            <li
              aria-label={{t "pages.assessment-individual-results.result"}}
              class="panel-header-data__content panel-header-data-content__stages"
            >
              {{#if @campaign.hasStages}}
                <MasteryPercentageDisplay
                  @masteryRate={{@participation.masteryRate}}
                  @hasStages={{@campaign.hasStages}}
                  @reachedStage={{@participation.reachedStage}}
                  @totalStage={{@participation.totalStage}}
                  @prescriberTitle={{@participation.prescriberTitle}}
                  @prescriberDescription={{@participation.prescriberDescription}}
                />
              {{else}}
                <PixProgressBar
                  @value={{@participation.masteryRate}}
                  @percentageValue={{t "common.result.percentage" value=@participation.masteryRate}}
                  @color="primary"
                />
              {{/if}}
            </li>
          </ul>
        {{/if}}
      </div>
    </PixBlock>
  </template>
}
