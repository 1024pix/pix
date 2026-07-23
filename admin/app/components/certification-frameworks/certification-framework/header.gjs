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
    return this.intl.t(`components.certification-frameworks.labels.${this.args.certificationFramework.scope}`);
  }

  get canCreateVersion() {
    return this.args.certificationFramework.hasDraft;
  }

  get activeCertificationVersionId() {
    const activeVersionId = this.args.certificationFramework.activeVersionId;
    return {
      activeVersionId,
    };
  }

  <template>
    <div class="certification-framework-header">
      <h1 class="certification-framework-header__title">
        <span>
          {{this.frameworkLabel}}
        </span>
      </h1>

      <PixTooltip @hide={{not this.canCreateVersion}} @position="bottom" @isWide={{true}}>
        <:triggerElement>
          <PixButtonLink
            class="framework__creation-button"
            @route="authenticated.certification-frameworks.certification-framework.versions.new"
            @iconBefore="add"
            @isDisabled={{this.canCreateVersion}}
          >
            {{t "components.certification-frameworks.certification-framework.create-button"}}
          </PixButtonLink>
        </:triggerElement>

        <:tooltip>
          {{t "components.certification-frameworks.certification-framework.create-button-cancel-tooltip"}}
        </:tooltip>
      </PixTooltip>
    </div>
  </template>
}
