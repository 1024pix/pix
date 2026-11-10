import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class FocusedOutNotification extends Component {
  get isNotCertification() {
    return !this.args.isCertification;
  }

  get isV2Certification() {
    return this.args.certificationVersion === 2;
  }

  get isV3CertificationAdjustedForAccessibility() {
    return this.args.certificationVersion === 3 && this.args.isAdjustedCourseForAccessibility;
  }

  get isV3CertificationNotAdjusted() {
    return this.args.certificationVersion === 3 && !this.args.isAdjustedCourseForAccessibility;
  }
  <template>
    <div aria-live="assertive">
      {{#if @hasFocusedOutOfWindow}}
        <PixNotificationAlert @type="warning" @withIcon="danger">
          {{#if this.isNotCertification}}
            {{t "pages.challenge.has-focused-out-of-window.default"}}
          {{/if}}

          {{#if this.isV2Certification}}
            {{t "pages.challenge.has-focused-out-of-window.certification"}}
          {{/if}}

          {{#if this.isV3CertificationAdjustedForAccessibility}}
            {{t "pages.challenge.has-focused-out-of-window.v3-accessible-certification"}}
          {{/if}}

          {{#if this.isV3CertificationNotAdjusted}}
            {{t "pages.challenge.has-focused-out-of-window.v3-certification"}}
          {{/if}}
        </PixNotificationAlert>
      {{/if}}
    </div>
  </template>
}
