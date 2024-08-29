import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

import SafeMarkdownToHtml from '../safe-markdown-to-html';

export default class Details extends Component {
  @service accessControl;
  @service intl;

  displayBooleanState = (bool) => {
    const yes = this.intl.t('common.words.yes');
    const no = this.intl.t('common.words.no');
    return bool ? yes : no;
  };

  <template>
    <section class="page-section">
      <header class="campaign-title">
        <h2>{{@campaign.name}}</h2>
        <PixTag @color="primary">{{@campaign.totalParticipationsCount}}
          participants</PixTag>
        <PixTag @color="success">
          {{@campaign.sharedParticipationsCount}}
          {{if @campaign.isTypeAssessment "résultats" "profils"}}
          reçus</PixTag>
      </header>
      <p class="campaign__subtitle">
        Créée le
        {{dayjsFormat @campaign.createdAt "DD/MM/YYYY"}}
        par
        {{@campaign.creatorFirstName}}
        {{@campaign.creatorLastName}}
      </p>

      <ul class="campaign__attributes">
        <li>Code : {{@campaign.code}}</li>
        <li>Type : {{if (eq @campaign.type "ASSESSMENT") "Évaluation" "Collecte de profils"}}</li>
        <li>Organisation :
          <LinkTo @route="authenticated.organizations.get" @model={{@campaign.organizationId}}>
            {{@campaign.organizationName}}
          </LinkTo>
        </li>
        {{#if @campaign.targetProfileId}}
          <li>Profil cible :
            <LinkTo @route="authenticated.target-profiles.target-profile.details" @model={{@campaign.targetProfileId}}>
              {{@campaign.targetProfileName}}
            </LinkTo>
          </li>
        {{/if}}
        {{#if @campaign.title}}
          <li>Titre du parcours : {{@campaign.title}}</li>
        {{/if}}
        {{#if @campaign.archivedAt}}
          <li>Archivée le {{dayjsFormat @campaign.archivedAt "DD/MM/YYYY"}}</li>
        {{/if}}

        <br />

        {{#if @campaign.customLandingPageText}}
          <li>Texte de la page d'accueil :
            <SafeMarkdownToHtml @markdown={{@campaign.customLandingPageText}} />
          </li>
        {{/if}}
        {{#if @campaign.customResultPageText}}
          <li>Texte de la page de fin de parcours :
            <SafeMarkdownToHtml @markdown={{@campaign.customResultPageText}} />
          </li>
        {{/if}}
        {{#if @campaign.customResultPageButtonText}}
          <li>Texte du bouton de la page de fin de parcours : {{@campaign.customResultPageButtonText}}</li>
        {{/if}}
        {{#if @campaign.customResultPageButtonUrl}}
          <li>URL du bouton de la page de fin de parcours : {{@campaign.customResultPageButtonUrl}}</li>
        {{/if}}
        <li>Envoi multiple : {{this.displayBooleanState @campaign.multipleSendings}}</li>
        <li>Pour les novices (isForAbsoluteNovice):
          {{this.displayBooleanState @campaign.isForAbsoluteNovice}}
        </li>
      </ul>

      {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
        <br />
        <PixButton @triggerAction={{@toggleEditMode}} @variant="secondary" @size="small">
          {{t "common.actions.edit"}}
        </PixButton>
      {{/if}}

    </section>
  </template>
}
