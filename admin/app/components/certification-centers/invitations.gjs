import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import sortBy from 'lodash/sortBy';

export default class CertificationCenterInvitations extends Component {
  @service intl;

  get sortedCertificationCenterInvitations() {
    return sortBy(this.args.certificationCenterInvitations, 'updatedAt').reverse();
  }

  <template>
    <section class="page-section">
      <header class="header page-section__header">
        <h2 class="page-section__title">Invitations</h2>
      </header>

      {{#if this.sortedCertificationCenterInvitations}}
        <PixTable
          @variant="admin"
          @caption={{t "components.certification-centers.invitations.table.caption"}}
          @data={{this.sortedCertificationCenterInvitations}}
        >
          <:columns as |invitation context|>
            <PixTableColumn @context={{context}} class="break-word">
              <:header>
                Adresse e-mail
              </:header>
              <:cell>
                {{invitation.email}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Rôle
              </:header>
              <:cell>
                {{invitation.roleLabel}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Locale
              </:header>
              <:cell>
                {{invitation.locale}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Date de dernier envoi
              </:header>
              <:cell>
                {{formatDate invitation.updatedAt format="medium"}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="certification-center-invitations__actions-buttons">
              <:header>
                Actions
              </:header>
              <:cell>
                <PixButton
                  @size="small"
                  aria-label={{t "common.invitations.send-new-label" invitationEmail=invitation.email}}
                  @triggerAction={{fn @onSendNewCertificationCenterInvitation invitation}}
                  @iconBefore="refresh"
                >
                  {{t "common.invitations.send-new"}}
                </PixButton>
                <PixButton
                  @size="small"
                  @variant="error"
                  aria-label="Annuler l’invitation de {{invitation.email}}"
                  @triggerAction={{fn @onCancelCertificationCenterInvitation invitation}}
                  @iconBefore="delete"
                >
                  Annuler l’invitation
                </PixButton>
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>
      {{else}}
        <p class="table__empty">Aucune invitation en attente</p>
      {{/if}}
    </section>
  </template>
}
