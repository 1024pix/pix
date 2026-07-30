import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import get from 'lodash/get';
import CopyableId from 'pix-admin/components/ui/copyable-id';
import HeadInformationBlock from 'pix-admin/components/ui/head-information-block';
import ENV from 'pix-admin/config/environment';

export default class HeadInformation extends Component {
  @service intl;
  @service pixToast;
  @service accessControl;

  @action
  onLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.updateLogo(reader.result);
    };
    reader.readAsDataURL(file);
  }

  updateLogo = async (logoUrl) => {
    this.args.organization.logoUrl = logoUrl;
    try {
      await this.args.organization.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.organizations.head-information.notifications.logo-update-success'),
      });
    } catch (responseError) {
      this.args.organization.rollbackAttributes();
      const error = get(responseError, 'errors[0]');
      let message;
      switch (error?.status) {
        case '413':
          message = this.intl.t('pages.organizations.notifications.errors.payload-too-large', {
            maxSizeInMegaBytes: error?.meta?.maxSizeInMegaBytes,
          });
          break;
        default:
          message = this.intl.t('common.notifications.generic-error');
      }
      this.pixToast.sendErrorNotification({ message });
    }
  };

  get hasTags() {
    const tags = this.args.organization.tags;
    return tags?.length > 0;
  }

  get hasChildren() {
    const children = this.args.organization.children;
    return children?.length > 0;
  }

  get belongsToNetwork() {
    return this.args.organization?.network;
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.ORGANIZATION_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.organization.id;
  }

  <template>
    <HeadInformationBlock @title={{@organization.name}}>
      <:logo>
        {{#if @organization.logoUrl}}
          <img src={{@organization.logoUrl}} alt="" />
        {{else}}
          <img src="{{ENV.rootURL}}logo-placeholder.png" alt="" />
        {{/if}}

        <label class="organization-head-information__file-upload">
          <span class="sr-only">{{t "components.organizations.head-information.change-logo"}}</span>
          <input class="sr-only" type="file" accept="image/*" {{on "change" this.onLogoUpload}} />
        </label>
      </:logo>

      <:subtitle>
        <CopyableId @value={{@organization.id}} @copyButtonId="copy-organization-id" />
      </:subtitle>
      <:tagsSection>
        <ul class="organization-head-information__tags-list">
          {{#if this.belongsToNetwork}}
            <li>
              <PixTag class="organization-head-information__child-tag" @color="success">
                {{t "components.organizations.head-information.network"}}
                <LinkTo @route="authenticated.networks.get" @model={{@organization.network.id}}>
                  {{@organization.network.name}}
                </LinkTo>
              </PixTag>
            </li>
            {{#if @organization.parentOrganizationId}}
              <li>
                <PixTag class="organization-head-information__child-tag" @color="success">
                  {{t "components.organizations.head-information.parent-organization-tag"}}
                  <LinkTo @route="authenticated.organizations.get" @model={{@organization.parentOrganizationId}}>
                    {{@organization.parentOrganizationName}}
                  </LinkTo>
                </PixTag>
              </li>
            {{else}}
              <li>
                <PixTag class="organization-head-information__child-tag" @color="success">
                  {{t "components.organizations.head-information.head-organization-tag"}}

                </PixTag>
              </li>
            {{/if}}
          {{/if}}

          {{#if this.hasTags}}
            {{#each @organization.tags as |tag|}}
              <li>
                <PixTag @color="blue">{{tag.name}}</PixTag>
              </li>
            {{/each}}
          {{/if}}
        </ul>
      </:tagsSection>

      <:link>
        <PixButtonLink
          @variant="secondary"
          @href={{this.externalURL}}
          @size="small"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tableau de bord
        </PixButtonLink>

      </:link>
    </HeadInformationBlock>
  </template>
}
