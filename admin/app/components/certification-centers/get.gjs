import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import CopyableId from 'pix-admin/components/ui/copyable-id';
import HeadInformationBlock from 'pix-admin/components/ui/head-information-block';
import ENV from 'pix-admin/config/environment';

export default class CertificationCentersGet extends Component {
  get externalURL() {
    const urlDashboardPrefix = ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.certificationCenter.id;
  }

  <template>
    <section class="page-body certification-center-get-page">
      <HeadInformationBlock @title={{@certificationCenter.name}}>
        <:subtitle>
          <CopyableId @value={{@certificationCenter.id}} @copyButtonId="copy-certification-center-id" />
        </:subtitle>
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

      {{#if @certificationCenter.isArchived}}
        <PixNotificationAlert class="certification-center-information-display__archived-warning" @type="warning">
          {{t
            "pages.certification-centers.information-view.is-archived-warning"
            archivedAt=@certificationCenter.archivedAtFormatDate
            archivedBy=@certificationCenter.archivistFullName
          }}
        </PixNotificationAlert>
      {{/if}}

      <PixTabs
        @variant="primary"
        @ariaLabel={{t "pages.certification-centers.get.navbar.aria-label"}}
        class="navigation certification-center-get-page__navigation"
      >
        <LinkTo @route="authenticated.certification-centers.get.details" @model={{@certificationCenter.id}}>
          {{t "pages.certification-centers.get.navbar.details"}}
        </LinkTo>

        {{#unless @certificationCenter.isArchived}}
          <LinkTo @route="authenticated.certification-centers.get.team" @model={{@certificationCenter.id}}>
            {{t "pages.certification-centers.get.navbar.team"}}
            ({{@certificationCenter.certificationCenterMemberships.length}})
          </LinkTo>

          <LinkTo @route="authenticated.certification-centers.get.invitations" @model={{@certificationCenter.id}}>
            {{t "pages.certification-centers.get.navbar.invitations"}}
            ({{@certificationCenter.certificationCenterInvitations.length}})
          </LinkTo>
        {{/unless}}

        <LinkTo
          @route="authenticated.certification-centers.get.attached-organizations"
          @model={{@certificationCenter.id}}
        >
          {{t "pages.certification-centers.get.navbar.attached-organizations"}}
        </LinkTo>
      </PixTabs>

      {{yield to="outlet"}}

    </section>
  </template>
}
