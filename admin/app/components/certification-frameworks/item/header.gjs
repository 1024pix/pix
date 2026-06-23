import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

export default class Header extends Component {
  @service intl;
  @service currentUser;
  @service router;

  get frameworkLabel() {
    return this.intl.t(`components.certification-frameworks.labels.${this.args.certificationFramework.name}`);
  }

  get canCreateVersion() {
    return this.args.frameworkHistory?.hasDraft;
  }

  get activeCertificationVersionId() {
    const activeVersion = this.args.frameworkHistory?.activeHistory;
    return {
      activeVersionId: activeVersion?.id,
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

      {{#if @showCreationVersionButton}}
        <PixTooltip @hide={{not this.canCreateVersion}} @position="bottom" @isWide={{true}}>
          <:triggerElement>
            <PixButtonLink
              class="framework__creation-button"
              @route="authenticated.certification-frameworks.item.frameworks.new"
              @query={{this.activeCertificationVersionId}}
              @iconBefore="add"
              @isDisabled={{this.canCreateVersion}}
            >
              {{t "components.certification-frameworks.item.frameworks.create-button"}}
            </PixButtonLink>
          </:triggerElement>

          <:tooltip>
            {{t "components.certification-frameworks.item.frameworks.create-button-cancel-tooltip"}}
          </:tooltip>
        </PixTooltip>
      {{/if}}
    </div>
  </template>
}
