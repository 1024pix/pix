import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Header extends Component {
  @service intl;
  @service currentUser;

  get frameworkLabel() {
    return this.intl.t(`components.certification-frameworks.labels.${this.args.certificationFramework.name}`);
  }

  get canCreateVersion() {
    return this.currentUser.adminMember.isSuperAdmin && this.args.certificationFramework?.name !== 'CLEA';
  }

  get activeCertificationVersionId() {
    return {
      activeVersionId: this.args.frameworkHistory?.history.find(
        (frameworkHistory) => frameworkHistory.status == 'ACTIVE',
      )?.id,
    };
  }

  get links() {
    return [
      {
        route: 'authenticated.certification-frameworks',
        label: this.intl.t('components.layout.sidebar.certification-frameworks'),
      },
      {
        label: this.frameworkLabel,
      },
    ];
  }

  <template>
    <header>
      <PixBreadcrumb @links={{this.links}} class="breadcrumb" />
    </header>

    <div class="certification-framework-header">
      <h1 class="certification-framework-header__title">
        <span>
          {{this.frameworkLabel}}
        </span>
      </h1>

      {{#if this.canCreateVersion}}
        <PixButtonLink
          class="framework__creation-button"
          @route="authenticated.certification-frameworks.item.framework.new-version"
          @query={{this.activeCertificationVersionId}}
          @iconBefore="add"
        >
          {{t "components.certification-frameworks.item.framework.create-button"}}
        </PixButtonLink>
      {{/if}}
    </div>
  </template>
}
