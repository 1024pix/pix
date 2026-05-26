import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import get from 'lodash/get';
import CopyButton from 'pix-admin/components/ui/copy-button';
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
    <div class="organization__head-information">
      <div class="organization__logo">
        <figure class="organization__logo-figure">
          {{#if @organization.logoUrl}}
            {{! template-lint-disable no-redundant-role }}
            <img src={{@organization.logoUrl}} alt="" role="presentation" />
          {{else}}
            {{! template-lint-disable no-redundant-role }}
            <img src="{{this.rootURL}}/logo-placeholder.png" alt="" role="presentation" />
          {{/if}}

          <label class="file-upload">
            <input type="file" accept="image/*" hidden {{on "change" this.onLogoUpload}} />
          </label>
        </figure>
      </div>

      <div class="organization__title">
        <div>
          <h1 class="organization__name">{{@organization.name}}</h1>
          <div class="organization__id">
            <p>ID : <span>{{@organization.id}}</span></p>
            <CopyButton
              @id="copy-organization-id"
              @value={{@organization.id}}
              @tooltip={{t "components.organizations.head-information.copy-id"}}
              @label={{t "components.organizations.head-information.copy-id"}}
            />
          </div>
        </div>

        <ul class="organization-tags-list">
          {{#if this.belongsToNetwork}}
            <PixTag class="organization__child-tag" @color="success">
              {{t "components.organizations.head-information.network"}}
              <LinkTo @route="authenticated.networks.get" @model={{@organization.network.id}}>
                {{@organization.network.name}}
              </LinkTo>
            </PixTag>
            {{#if @organization.parentOrganizationId}}
              <li>
                <PixTag class="organization__child-tag" @color="success">
                  {{t "components.organizations.head-information.parent-organization-tag"}}
                  <LinkTo @route="authenticated.organizations.get" @model={{@organization.parentOrganizationId}}>
                    {{@organization.parentOrganizationName}}
                  </LinkTo>
                </PixTag>
              </li>
            {{else}}
              <li>
                <PixTag class="organization__child-tag" @color="success">
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
      </div>

      <PixButtonLink
        class="organization__dashboard-button"
        @variant="secondary"
        @href={{this.externalURL}}
        @size="small"
        target="_blank"
        rel="noopener noreferrer"
      >
        Tableau de bord
      </PixButtonLink>
    </div>
  </template>
}
