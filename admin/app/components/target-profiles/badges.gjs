import {
  PixButton,
  PixButtonLink,
  PixIcon,
  PixTable,
  PixTableColumn,
  PixTag,
  PixTooltip,
} from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import ConfirmPopup from '../confirm-popup';

export default class Badges extends Component {
  @tracked displayConfirm = false;
  @service store;
  @service pixToast;
  badgeIdToDelete;

  get hasBadges() {
    const badges = this.args.badges;
    return badges && badges.length > 0;
  }

  @action
  toggleDisplayConfirm(badgeId) {
    this.displayConfirm = !this.displayConfirm;
    this.badgeIdToDelete = badgeId;
  }

  @action
  async deleteBadge() {
    let badge;
    try {
      badge = this.store.peekRecord('badge', this.badgeIdToDelete);
      await badge.destroyRecord();
      this.pixToast.sendSuccessNotification({ message: 'Le badge a été supprimé avec succès.' });
    } catch (error) {
      this.pixToast.sendErrorNotification({ message: error.errors[0].detail });
      badge.rollbackAttributes();
    }
    this.toggleDisplayConfirm();
  }

  <template>
    {{#if this.hasBadges}}
      <PixTable
        @variant="admin"
        @data={{@badges}}
        @caption={{t "components.target-profiles.badges.table.caption"}}
        class="table insights-section__badge-table"
      >
        <:columns as |badge context|>
          <PixTableColumn @context={{context}}>
            <:header>
              ID
            </:header>
            <:cell>
              <LinkTo
                @route="authenticated.target-profiles.target-profile.badges.badge"
                @model={{badge.id}}
                aria-label="Voir le détail du badge ID {{badge.id}}"
              >
                {{badge.id}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="badges-table-body__image">
            <:header>
              Image
            </:header>
            <:cell>
              <img src={{badge.imageUrl}} alt={{badge.altMessage}} />
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Clé
            </:header>
            <:cell>
              {{badge.key}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Nom
            </:header>
            <:cell>
              {{badge.title}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Message
            </:header>
            <:cell>
              {{badge.message}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="badges-table-header__parameters">
            <:header>
              <PixTooltip @isWide={{true}}>
                <:triggerElement>
                  Paramètres
                  <PixIcon @name="help" />
                </:triggerElement>
                <:tooltip>
                  {{t "components.badges.tooltips.parameters" htmlSafe=true}}
                </:tooltip>
              </PixTooltip>
            </:header>
            <:cell>
              <div class="badges-table-body__content">
                <PixTag class="badges-table-body__tag" @color={{if badge.isAlwaysVisible "tertiary" "error"}}>
                  <PixIcon @name={{if badge.isAlwaysVisible "check" "close"}} />
                  {{if badge.isAlwaysVisible "En lacune" "Pas en lacune"}}
                </PixTag>
                <PixTag class="badges-table-body__tag" @color={{if badge.isCertifiable "success" "error"}}>
                  <PixIcon @name={{if badge.isCertifiable "check" "close"}} />
                  {{if badge.isCertifiable "Certifiable" "Pas certifiable"}}
                </PixTag>
              </div>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Actions
            </:header>
            <:cell>
              <div class="badges-table-body__content">
                <PixButtonLink
                  @variant="secondary"
                  @route="authenticated.target-profiles.target-profile.badges.badge"
                  @size="small"
                  @model={{badge.id}}
                  aria-label="Voir le détail du badge {{badge.title}}"
                >
                  Voir le détail
                </PixButtonLink>
                <PixButton
                  @size="small"
                  @variant="error"
                  @triggerAction={{fn this.toggleDisplayConfirm badge.id}}
                  class="badges-table-actions-delete"
                  @iconBefore="delete"
                  aria-label="Supprimer le badge {{badge.title}}"
                >
                  Supprimer
                </PixButton>
              </div>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty">Aucun badge associé</div>
    {{/if}}

    <ConfirmPopup
      @message="Êtes-vous sûr de vouloir supprimer ce badge ? (Uniquement si le badge n'a pas encore été assigné)"
      @title="Suppression d'un badge"
      @submitTitle="Confirmer"
      @confirm={{fn this.deleteBadge this.badgeIdToDelete}}
      @cancel={{this.toggleDisplayConfirm}}
      @show={{this.displayConfirm}}
    />
  </template>
}
