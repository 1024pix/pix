import PixButton from '@1024pix/pix-ui/components/pix-button';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Card from '../card';

export default class OrganizationInformationSection extends Component {
  @service accessControl;

  <template>
    <div class="organization__data">
      <OrganizationDescription @organization={{@organization}} />

      {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
        <div class="form-actions organization-information__actions">
          <PixButton @variant="secondary" @size="small" @triggerAction={{@toggleEditMode}}>
            {{t "common.actions.edit"}}
          </PixButton>
          {{#unless @organization.isArchived}}
            <PixButton @variant="error" @size="small" @triggerAction={{@toggleArchivingConfirmationModal}}>
              {{t "components.organizations.information-section-view.archive-organization.action"}}
            </PixButton>
          {{/unless}}
        </div>
      {{/if}}
    </div>
  </template>
}

class OrganizationDescription extends Component {
  @service oidcIdentityProviders;
  @service intl;

  get identityProviderName() {
    const identityProviderForCampaigns = this.args.organization.identityProviderForCampaigns;
    if (identityProviderForCampaigns === 'GAR') {
      return 'GAR';
    }

    const identityProvider = this.oidcIdentityProviders.list.find(
      (identityProvider) => identityProvider.code === identityProviderForCampaigns,
    );
    return identityProvider?.contextualizedName ?? this.intl.t('common.words.none');
  }

  get dpoSectionTitle() {
    return `${this.intl.t('components.organizations.creation.dpo.definition')} (${this.intl.t('components.organizations.creation.dpo.acronym')})`;
  }

  get country() {
    //TODO: remove condition based on countryCode when it becomes not nullable at the end of Epix
    if (!this.args.organization.countryCode && !this.args.organization.countryName) {
      return this.intl.t('common.not-specified');
    }

    if (this.args.organization.countryCode && !this.args.organization.countryName) {
      return this.intl.t('components.organizations.information-section-view.country.not-found', {
        countryCode: this.args.organization.countryCode,
      });
    }

    return `${this.args.organization.countryName} (${this.args.organization.countryCode})`;
  }

  <template>
    <section class="admin-form__content">
      <Card
        class="admin-form__card organization-information-section__card organization-information-section__card--general"
        @title={{t "components.organizations.creation.general-information"}}
      >
        <div class="organization-information-section__left-block">
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.type"
              }}</span>
            <span class="organization-information-section__value">{{@organization.type}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.created-by"
              }}</span>
            <span class="organization-information-section__value">{{@organization.creatorFullName}}
              ({{@organization.createdBy}})</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.created-at"
              }}</span>
            <span class="organization-information-section__value">{{@organization.createdAtFormattedDate}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.administration-team"
              }}</span>
            <span class="organization-information-section__value">{{if
                @organization.administrationTeamName
                @organization.administrationTeamName
                (t "common.not-specified")
              }}</span>
          </div>
        </div>
        <div class="organization-information-section__right-block">
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">
              {{t "components.organizations.information-section-view.organization-learner-type"}}
            </span>
            <span class="organization-information-section__value">{{@organization.organizationLearnerTypeName}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.country.label"
              }}</span>
            <span class="organization-information-section__value">{{this.country}}</span>
          </div>
          {{#if @organization.provinceCode}}
            <div class="organization-information-section__field">
              <span class="organization-information-section__label">{{t
                  "components.organizations.information-section-view.province-code"
                }}</span>
              <span class="organization-information-section__value">{{@organization.provinceCode}}</span>
            </div>
          {{/if}}
          {{#if @organization.externalId}}
            <div class="organization-information-section__field">
              <span class="organization-information-section__label">{{t
                  "components.organizations.information-section-view.external-id"
                }}</span>
              <span class="organization-information-section__value">{{@organization.externalId}}</span>
            </div>
          {{/if}}
        </div>
      </Card>

      <div class="organization-information-section__side-by-side">
        <Card
          class="admin-form__card organization-information-section__card organization-information-section__card--side"
          @title={{t "components.organizations.creation.configuration"}}
        >
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.credits"
              }}</span>
            <span class="organization-information-section__value">{{@organization.credit}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.documentation-link"
              }}</span>
            <span class="organization-information-section__value">
              {{#if @organization.documentationUrl}}
                <a href="{{@organization.documentationUrl}}" target="_blank" rel="noopener noreferrer">
                  {{@organization.documentationUrl}}
                </a>
              {{else}}
                {{t "common.not-specified"}}
              {{/if}}
            </span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.sso"
              }}</span>
            <span class="organization-information-section__value">{{this.identityProviderName}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.sco-activation-email"
              }}</span>
            <span class="organization-information-section__value">{{@organization.email}}</span>
          </div>
          {{#if @organization.code}}
            <div class="organization-information-section__field">
              <span class="organization-information-section__label">{{t
                  "components.organizations.information-section-view.code"
                }}</span>
              <span class="organization-information-section__value">{{@organization.code}}</span>
            </div>
          {{/if}}
        </Card>

        <Card
          class="admin-form__card organization-information-section__card organization-information-section__card--side"
          @title={{this.dpoSectionTitle}}
        >
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.dpo-name"
              }}</span>
            <span class="organization-information-section__value">{{@organization.dataProtectionOfficerFullName}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "components.organizations.information-section-view.dpo-email"
              }}</span>
            <span class="organization-information-section__value">{{@organization.dataProtectionOfficerEmail}}</span>
          </div>
        </Card>
      </div>
    </section>
  </template>
}
