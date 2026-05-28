import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { concat, get } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import { formatMinutes } from 'pix-admin/utils/date';

import FrameworkContentDetails from './framework-content-details';
import VersionComment from './version-comment';

const STATUS_COLORS = { ACTIVE: 'success', DRAFT: 'tertiary', ARCHIVED: 'secondary' };

export default class CertificationVersionDetailModal extends Component {
  @service intl;

  get frameworkLabel() {
    return this.intl.t(`components.certification-frameworks.labels.${this.args.frameworkKey}`);
  }

  get locales() {
    if (this.args.frameworkKey === 'CORE') {
      return [
        { flag: '🇫🇷', label: 'fr-FR' },
        { flag: '🇫🇷', label: 'fr' },
        { flag: '🇬🇧', label: 'en' },
      ];
    } else {
      return [{ flag: '🇫🇷', label: 'fr-FR' }];
    }
  }

  <template>
    <PixModal
      class="certification-version-detail-modal"
      @title={{this.frameworkLabel}}
      @showModal={{@showModal}}
      @onCloseButtonClick={{@onClose}}
    >
      <:content>
        <h2 class="certification-version-detail-modal__subtitle">{{t
            "components.certification-frameworks.item.framework.version-detail-modal.parameters"
          }}</h2>
        <PixBlock class="certification-version-detail-modal__parameters">
          <dl>
            <PixIcon @name="star" @ariaHidden={{true}} />
            <dt>{{t "components.certification-frameworks.item.framework.version-detail-modal.status"}}</dt>
            <dd>
              <PixTag @color={{get STATUS_COLORS @status}}>
                {{t (concat "components.certification-frameworks.item.framework.history.statuses." @status)}}
              </PixTag>
            </dd>

            {{#if @version.startDate}}
              <PixIcon @name="calendar" @ariaHidden={{true}} />
              <dt>{{t "components.certification-frameworks.item.framework.version-detail-modal.start-date"}}</dt>
              <dd>{{formatDate @version.startDate}}</dd>
            {{/if}}

            {{#if @version.expirationDate}}
              <PixIcon @name="calendar" @ariaHidden={{true}} />
              <dt>{{t "components.certification-frameworks.item.framework.version-detail-modal.expiration-date"}}</dt>
              <dd>{{formatDate @version.expirationDate}}</dd>
            {{/if}}

            <PixIcon @name="flag" @ariaHidden={{true}} />
            <dt>{{t "components.certification-frameworks.item.framework.version-detail-modal.locales"}}</dt>
            <dd>
              {{#each this.locales as |locale|}}
                {{locale.flag}}
                {{locale.label}}
              {{/each}}
            </dd>

            <PixIcon @name="time" @ariaHidden={{true}} />
            <dt>{{t "components.certification-frameworks.item.framework.version-detail-modal.assessment-duration"}}</dt>
            <dd>{{formatMinutes @version.assessmentDuration}}</dd>

            <PixIcon @name="helpSimple" @ariaHidden={{true}} />
            <dt>{{t
                "components.certification-frameworks.item.framework.version-detail-modal.maximum-assessment-length"
              }}</dt>
            <dd>{{@version.maximumAssessmentLength}}</dd>

            <PixIcon @name="helpSimple" @ariaHidden={{true}} />
            <dt>{{t
                "components.certification-frameworks.item.framework.version-detail-modal.minimum-answers-required"
              }}</dt>
            <dd>{{@version.minimumAnswersRequiredForValidation}}</dd>
          </dl>
        </PixBlock>

        <FrameworkContentDetails @areas={{@version.areas}} />

        <VersionComment @version={{@version}} />
      </:content>
    </PixModal>
  </template>
}
