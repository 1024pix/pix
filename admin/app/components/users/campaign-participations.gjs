import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import { and, not } from 'ember-truth-helpers';

import ConfirmPopup from '../confirm-popup';

export default class CampaignParticipation extends Component {
  @service accessControl;

  @tracked displayRemoveParticipationModal = false;
  @tracked participationToDelete = null;

  @action
  toggleDisplayRemoveParticipationModal(participation) {
    this.participationToDelete = participation;
    this.displayRemoveParticipationModal = !this.displayRemoveParticipationModal;
  }

  @action
  async removeParticipation() {
    try {
      await this.args.removeParticipation(this.participationToDelete);
    } finally {
      this.toggleDisplayRemoveParticipationModal();
    }
  }

  <template>
    <header class="header page-section__header">
      <h2 class="page-section__title">Participations à des campagnes</h2>
    </header>
    <p class="participations-section__subtitle">
      Attention toute modification sur une participation nécessite un accord écrit du prescripteur et du prescrit.
    </p>

    {{#if @participations}}
      <PixTable
        @variant="admin"
        @data={{@participations}}
        @caption={{t "components.users.campaign-participations.table.caption"}}
      >
        <:columns as |participation context|>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Prescrit
            </:header>
            <:cell>
              {{participation.organizationLearnerFullName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Campagne
            </:header>
            <:cell>
              <LinkTo @route="authenticated.campaigns.campaign" @model={{participation.campaignId}}>
                {{participation.campaignCode}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Identifiant externe
            </:header>
            <:cell>
              {{#if participation.participantExternalId}}
                {{participation.participantExternalId}}
              {{else}}
                -
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Date de début
            </:header>
            <:cell>
              {{formatDate participation.createdAt}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Statut
            </:header>
            <:cell>
              {{participation.displayedStatus}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Date d'envoi
            </:header>
            <:cell>
              {{if participation.sharedAt (formatDate participation.sharedAt) "-"}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Supprimé le
            </:header>
            <:cell>
              {{if participation.deletedAt (formatDate participation.deletedAt) "-"}}
            </:cell>
          </PixTableColumn>
          {{#if (and this.accessControl.hasAccessToUsersActionsScope (not participation.isFromCombinedCourse))}}
            <PixTableColumn @context={{context}}>
              <:header>
                Actions
              </:header>
              <:cell>
                {{#unless participation.deletedAt}}
                  <PixButton
                    @triggerAction={{fn this.toggleDisplayRemoveParticipationModal participation}}
                    @size="small"
                    @variant="error"
                  >
                    Supprimer
                  </PixButton>
                {{/unless}}
              </:cell>
            </PixTableColumn>
          {{/if}}
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty">Aucune participation</div>
    {{/if}}

    <ConfirmPopup
      @message="Vous êtes sur le point de supprimer la ou les participation(s) de {{this.participationToDelete.organizationLearnerFullName}} (y compris celles améliorées), celle-ci ne sera plus visible ni comprise dans les statistiques de la campagne de Pix Orga. Le participant ne pourra plus terminer son parcours, ni envoyer ses résultats. Il pourra de nouveau participer à cette campagne."
      @title="Supprimer cette participation ?"
      @submitTitle="Oui, je supprime"
      @submitButtonType="danger"
      @confirm={{this.removeParticipation}}
      @cancel={{this.toggleDisplayRemoveParticipationModal}}
      @show={{this.displayRemoveParticipationModal}}
    />
  </template>
}
