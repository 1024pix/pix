import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import HabilitationTag from './habilitation-tag';

export default class InformationView extends Component {
  @service intl;
  @tracked habilitations = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.certificationCenter.habilitations).then((habilitations) => {
      this.habilitations = habilitations;
    });
  }

  get availableHabilitations() {
    const habilitations = this.args.availableHabilitations?.sortBy('id') || [];
    return habilitations.map((habilitation) => {
      const isHabilitated = this.habilitations.includes(habilitation);
      const label = habilitation.label;
      const ariaLabel = this.intl.t(
        `pages.certification-centers.information-view.habilitations.aria-label.${
          isHabilitated ? 'active' : 'inactive'
        }`,
        { complementaryCertificationLabel: label },
      );
      return { isHabilitated, label, ariaLabel };
    });
  }

  get availablePilotFeatures() {
    const isComplementaryAlonePilot = this.args.certificationCenter.isComplementaryAlonePilot;
    const isComplementaryAlonePilotLabel = this.intl.t(
      'pages.certification-centers.information-view.pilot-features.is-complementary-alone-pilot.label',
    );
    const isComplementaryAlonePilotAriaLabel = this.intl.t(
      `pages.certification-centers.information-view.pilot-features.is-complementary-alone-pilot.aria-label.${
        isComplementaryAlonePilot ? 'active' : 'inactive'
      }`,
    );

    return [
      {
        isPilot: isComplementaryAlonePilot,
        label: isComplementaryAlonePilotLabel,
        ariaLabel: isComplementaryAlonePilotAriaLabel,
      },
    ];
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.certificationCenter.id;
  }

  <template>
    <h1 class="certification-center-information-display__name">{{@certificationCenter.name}}</h1>

    {{#if @certificationCenter.isArchived}}
      <PixNotificationAlert class="certification-center-information-display__archived-warning" @type="warning">
        {{t
          "pages.certification-centers.information-view.is-archived-warning"
          archivedAt=@certificationCenter.archivedAtFormatDate
          archivedBy=@certificationCenter.archivistFullName
        }}
      </PixNotificationAlert>
    {{/if}}

    <dl class="certification-center-information-display__list">
      <dt class="label">Type :</dt>
      <dd>{{@certificationCenter.typeLabel}}</dd>

      <dt class="label">Identifiant externe :</dt>
      <dd>{{@certificationCenter.externalId}}</dd>

      <dt class="label">
        Nom du
        <abbr title="Délégué à la protection des données">DPO</abbr>
        :
      </dt>
      <dd>{{@certificationCenter.dataProtectionOfficerFullName}}</dd>

      <dt class="label">
        Adresse e-mail du
        <abbr title="Délégué à la protection des données">DPO</abbr>
        :
      </dt>
      <dd>{{@certificationCenter.dataProtectionOfficerEmail}}</dd>
    </dl>

    <span class="label">{{t "pages.certification-centers.information-view.pilot-features.title"}}</span>
    <ul class="certification-center-information-display__habilitations-list">
      {{#each this.availablePilotFeatures as |feature|}}
        <HabilitationTag @label={{feature.label}} @active={{feature.isPilot}} @arialabel={{feature.ariaLabel}} />
      {{/each}}
    </ul>

    <div class="certification-center-information-display__divider"></div>

    <span class="label">{{t "pages.certification-centers.information-view.habilitations.title"}}</span>
    <ul class="certification-center-information-display__habilitations-list">
      {{#each this.availableHabilitations as |habilitation|}}
        <HabilitationTag
          @label={{habilitation.label}}
          @active={{habilitation.isHabilitated}}
          @arialabel={{habilitation.ariaLabel}}
        />
      {{/each}}
    </ul>

    <ul class="certification-center-information-display__action-buttons">
      <li>
        <PixButton @size="small" @triggerAction={{@toggleEditMode}}>
          {{t "common.actions.edit"}}
        </PixButton>
      </li>
      <li>
        <PixButtonLink
          @variant="secondary"
          @href={{this.externalURL}}
          @size="small"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tableau de bord
        </PixButtonLink>
      </li>
    </ul>
  </template>
}
