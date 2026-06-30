import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import {
  CERTIFICATE_STATUSES,
  CERTIFICATE_TYPES,
  EXTRA_CERTIFICATE_STATUSES,
} from 'mon-pix/models/certificate-summary';

export default class CertificationTags extends Component {
  @service intl;
  @service session;
  @service fileSaver;
  @service currentDomain;
  @service locale;

  @tracked errorMessage = null;

  get isPixPlusV3Certification() {
    return (
      !['CORE', 'CLEA'].includes(this.args.framework) && this.args.certificateType === CERTIFICATE_TYPES.CERTIFICATE
    );
  }

  get statusTagData() {
    const tagMap = {
      [CERTIFICATE_STATUSES.VALIDATED]: {
        color: 'green',
        content: this.isPixPlusV3Certification
          ? this.intl.t(
              `pages.user-certifications.meshes.${this.args.framework}.${this.args.reachedMeshLevel ?? 'BELOW_MINIMUM'}`,
            )
          : this.intl.t('pages.certifications-list.statuses.validated'),
        displayFramework: true,
      },
      [CERTIFICATE_STATUSES.REJECTED]: {
        color: 'error',
        content: this.isPixPlusV3Certification
          ? this.intl.t(
              `pages.user-certifications.meshes.${this.args.framework}.${this.args.reachedMeshLevel ?? 'BELOW_MINIMUM'}`,
            )
          : this.intl.t('pages.certifications-list.statuses.rejected'),
        displayFramework: true,
      },
      [CERTIFICATE_STATUSES.CANCELLED]: {
        color: 'error',
        content: this.intl.t('pages.certifications-list.statuses.cancelled'),
        displayFramework: true,
      },
      [CERTIFICATE_STATUSES.CANCELLED_BY_JURY]: {
        color: 'error',
        content: this.intl.t('pages.certifications-list.statuses.cancelled'),
        displayFramework: true,
      },
      [CERTIFICATE_STATUSES.WAITING_FOR_RESULTS]: {
        color: 'primary',
        content: this.intl.t('pages.certifications-list.statuses.not-published'),
        displayFramework: false,
      },
    };
    return tagMap[this.args.status];
  }

  get extraStatusTagData() {
    const tagMap = {
      [EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE]: null,
      [EXTRA_CERTIFICATE_STATUSES.ACQUIRED]: {
        color: 'green',
        content: this.intl.t('pages.certifications-list.statuses.validated'),
      },
      [EXTRA_CERTIFICATE_STATUSES.NOT_ACQUIRED]: {
        color: 'error',
        content: this.intl.t('pages.certifications-list.statuses.rejected'),
      },
    };
    return tagMap[this.args.extraStatus];
  }

  get isPublished() {
    return this.args.status !== CERTIFICATE_STATUSES.WAITING_FOR_RESULTS;
  }

  get shouldDisplayFramework() {
    return !this.isPublished || this.args.status === CERTIFICATE_STATUSES.CANCELLED;
  }

  get frameworkName() {
    return this.intl.t(`pages.certification-frameworks.${this.args.framework}`);
  }

  <template>
    <PixTag data-testid="pw-certification-card-main-status" @color={{this.statusTagData.color}} class="tag">
      <div>
        {{#if this.extraStatusTagData}}
          <strong>{{t "pages.certification-frameworks.CORE"}}&nbsp;:</strong>
        {{else if this.statusTagData.displayFramework}}
          <strong>{{this.frameworkName}}&nbsp;:</strong>
        {{/if}}
        {{this.statusTagData.content}}
      </div>
    </PixTag>
    {{#if this.extraStatusTagData}}
      <PixTag data-testid="pw-certification-card-extra-status" @color={{this.extraStatusTagData.color}} class="tag">
        <div>
          <strong>{{this.frameworkName}}&nbsp;:</strong>
          {{this.extraStatusTagData.content}}
        </div>
      </PixTag>
    {{/if}}
  </template>
}
