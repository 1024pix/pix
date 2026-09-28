import { PixBlock, PixIcon, PixTag } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { formatDate, t } from 'ember-intl';
import { and } from 'ember-truth-helpers';

import Breadcrumb from '../../ui/breadcrumb';
import Information from '../../ui/information';
import InformationWrapper from '../../ui/information-wrapper';
import PageTitle from '../../ui/page-title';
import LinkToOrganizationLearner from '../link-to';

export default class Header extends Component {
  @service intl;

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
        route: 'authenticated.campaigns.participant-profile',
        label: this.intl.t('pages.profiles-individual-results.breadcrumb-current-page-label', {
          firstName: this.args.campaignProfile.firstName,
          lastName: this.args.campaignProfile.lastName,
        }),
        models: [this.args.campaign.id, this.args.campaignParticipationId],
      },
    ];
  }

  <template>
    <PageTitle>
      <:breadcrumb>
        <Breadcrumb @links={{this.breadcrumbLinks}} />
      </:breadcrumb>

      <:title>
        {{@campaignProfile.firstName}}
        {{@campaignProfile.lastName}}
      </:title>
      <:tools>
        {{#if (and @campaignProfile.isCertifiable @campaignProfile.isShared)}}
          <PixTag @color="green-light" class="prescriber__certifiable-tag">
            {{t "pages.profiles-individual-results.certifiable"}}
          </PixTag>
        {{/if}}
      </:tools>
      <:subtitle>
        <span class="participant__link">
          <PixIcon @name="infoUser" @plainIcon={{true}} />
          <LinkToOrganizationLearner @organizationLearnerId={{@campaignProfile.organizationLearnerId}}>
            {{t "common.actions.link-to-participant"}}
          </LinkToOrganizationLearner>
        </span>
      </:subtitle>
    </PageTitle>

    <PixBlock class="participant-header" @variant="orga">
      <header class="panel-header__headline">
        <h2 class="panel-header-title">{{@campaign.name}}</h2>
      </header>
      <div class="panel-header__body">
        <InformationWrapper>
          {{#if @campaignProfile.externalId}}
            <Information>
              <:title>{{@campaign.externalIdLabel}}</:title>
              <:content>{{@campaignProfile.externalId}}</:content>
            </Information>
          {{/if}}
          <Information>
            <:title>{{t "pages.campaign-individual-results.start-date"}}</:title>
            <:content>{{formatDate @campaignProfile.createdAt format="LLL"}}</:content>
          </Information>
          {{#if @campaignProfile.isShared}}
            <Information>
              <:title>{{t "pages.campaign-individual-results.shared-date"}}</:title>
              <:content>{{formatDate @campaignProfile.sharedAt format="LLL"}}</:content>
            </Information>
          {{/if}}
        </InformationWrapper>

        {{#if @campaignProfile.isShared}}
          <ul class="panel-header__data panel-header__data--highlight">
            <li class="panel-header-data__content">
              <span class="value-text value-text--highlight">{{t
                  "pages.profiles-individual-results.pix-score"
                  score=@campaignProfile.pixScore
                }}</span>
              <span class="label-text label-text--dark label-text--small">
                {{t "pages.profiles-individual-results.pix"}}
              </span>
            </li>
            <li class="panel-header-data__content">
              <span class="value-text">
                <span class="value-text value-text--highlight">{{@campaignProfile.certifiableCompetencesCount}}</span>
                <span>&nbsp;/&nbsp;{{@campaignProfile.competencesCount}}</span>
              </span>
              <span class="label-text label-text--dark label-text--small">
                {{t "pages.profiles-individual-results.competences-certifiables"}}
              </span>
            </li>
          </ul>
        {{/if}}
      </div>
    </PixBlock>
  </template>
}
