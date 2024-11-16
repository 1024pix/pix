import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CompanionCheck extends Component {
  @service intl;
  @service pixCompanion;

  constructor(...args) {
    super(...args);
    this.pixCompanion.checkExtensionIsEnabled();
  }

  get version() {
    if (!this.pixCompanion.version) return '';
    return this.intl.t('common.companion.check.detected.version', { version: this.pixCompanion.version });
  }

  <template>
    {{#if this.pixCompanion.hasMinimalVersionForCertification}}
      <section class="companion-check companion-check--success">
        <PixIcon @name="checkCircle" @plainIcon={{true}} @ariaHidden={{true}} class="companion-check__icon" />
        <h1 class="companion-check__title">
          {{t "common.companion.check.detected.description" version=this.version htmlSafe=true}}
        </h1>
      </section>
    {{else}}
      <section class="companion-check companion-check--error">
        <PixIcon @name="cancel" @plainIcon={{true}} @ariaHidden={{true}} class="companion-check__icon" />
        <h1 class="companion-check__title">
          {{t "common.companion.check.not-detected.description" htmlSafe=true}}
        </h1>

        <PixButtonLink
          @href="https://cloud.pix.fr/s/KocingDC4mFJ3R6"
          target="_blank"
          class="companion-check__link"
          @variant="primary-bis"
        >
          {{t "common.companion.check.not-detected.link"}}
        </PixButtonLink>
      </section>
    {{/if}}
  </template>
}
