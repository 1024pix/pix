import { PixButton, PixTable, PixTableColumn, PixTag } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import formatDate from 'ember-intl/helpers/format-date';
import { eq } from 'ember-truth-helpers';

export default class List extends Component {
  @service accessControl;

  <template>
    <PixTable
      @variant="admin"
      @caption="Affichage des lots de place disponible triés par ordre anti-chronologique d'activation puis d'expiration"
      @data={{@places}}
    >
      <:columns as |place context|>
        <PixTableColumn @context={{context}}>
          <:header>
            Nombre
          </:header>
          <:cell>
            {{place.count}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Catégorie
          </:header>
          <:cell>
            {{place.categoryLabel}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Date d'activation
          </:header>
          <:cell>
            Du:
            {{formatDate place.activationDate}}
            {{#if place.hasExpirationDate}}
              <br />
              Au:
              {{formatDate place.expirationDate}}
            {{/if}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Statut
          </:header>
          <:cell>
            <PixTag @color={{if (eq place.status "ACTIVE") "blue" "grey"}}>{{place.displayStatus}}</PixTag>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Référence
          </:header>
          <:cell>
            {{place.reference}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Créé par
          </:header>
          <:cell>
            {{place.creatorFullName}}
          </:cell>
        </PixTableColumn>
        {{#if this.accessControl.hasAccessToOrganizationPlacesActionsScope}}
          <PixTableColumn @context={{context}}>
            <:header>
              Actions
            </:header>
            <:cell>
              <PixButton @size="small" @variant="error" @triggerAction={{fn @onDelete place}} @iconBefore="delete">
                Supprimer
              </PixButton>
            </:cell>
          </PixTableColumn>
        {{/if}}
      </:columns>
    </PixTable>
  </template>
}
