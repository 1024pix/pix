import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
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
  @service notifications;
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
      this.notifications.success('Le résultat thématique a été supprimé avec succès.');
    } catch (e) {
      this.notifications.error(e.errors[0].detail);
      badge.rollbackAttributes();
    }
    this.toggleDisplayConfirm();
  }

  <template>
    <div class="content-text content-text--small">
      {{#if this.hasBadges}}
        <table class="badges-table table-admin">
          <thead class="badges-table__header">
            <tr>
              <th class="badges-table-header__id">ID</th>
              <th class="badges-table-header__image">Image</th>
              <th class="badges-table-header__key">Clé</th>
              <th class="badges-table-header__name">Nom</th>
              <th class="badges-table-header__message">Message</th>
              <th class="badges-table-header__parameters">
                <PixTooltip @isWide={{true}}>
                  <:triggerElement>
                    Paramètres
                    <PixIcon @name="help" />
                  </:triggerElement>
                  <:tooltip>
                    {{t "components.badges.tooltips.parameters" htmlSafe=true}}
                  </:tooltip>
                </PixTooltip>
              </th>
              <th class="badges-table-header__actions">Actions</th>
            </tr>
          </thead>
          <tbody class="badges-table__body">
            {{#each @badges as |badge|}}
              <tr aria-label="Informations du badge {{badge.title}}">
                <td class="badges-table-body__id">
                  <LinkTo
                    @route="authenticated.target-profiles.target-profile.badges.badge"
                    @model={{badge.id}}
                    aria-label="Voir le détail du résultat thématique ID {{badge.id}}"
                  >
                    {{badge.id}}
                  </LinkTo>
                </td>
                <td class="badges-table-body__image"><img src={{badge.imageUrl}} alt={{badge.altMessage}} /></td>
                <td class="badges-table-body__key">{{badge.key}}</td>
                <td class="badges-table-body__title">{{badge.title}}</td>
                <td class="badges-table-body__message">{{badge.message}}</td>
                <td class="badges-table-body__parameters">
                  <PixTag
                    class={{if badge.isAlwaysVisible "valid" "not-valid"}}
                    @color={{if badge.isAlwaysVisible "tertiary" "error"}}
                  >
                    {{if badge.isAlwaysVisible "En lacune" "Pas en lacune"}}
                  </PixTag>
                  <PixTag
                    class={{if badge.isCertifiable "valid" "not-valid"}}
                    @color={{if badge.isCertifiable "success" "error"}}
                  >
                    {{if badge.isCertifiable "Certifiable" "Pas certifiable"}}
                  </PixTag>
                </td>
                <td class="badges-table-body__actions">
                  <PixButtonLink
                    @variant="secondary"
                    @route="authenticated.target-profiles.target-profile.badges.badge"
                    @size="small"
                    @model={{badge.id}}
                    aria-label="Voir le détail du résultat thématique {{badge.title}}"
                  >
                    Voir le détail
                  </PixButtonLink>
                  <PixButton
                    @size="small"
                    @variant="error"
                    @triggerAction={{fn this.toggleDisplayConfirm badge.id}}
                    class="badges-table-actions-delete"
                    @iconBefore="delete"
                    aria-label="Supprimer le résultat thématique {{badge.title}}"
                  >
                    Supprimer
                  </PixButton>
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      {{else}}
        <div class="table__empty">Aucun résultat thématique associé</div>
      {{/if}}
    </div>

    <ConfirmPopup
      @message="Êtes-vous sûr de vouloir supprimer ce résultat thématique ? (Uniquement si le RT n'a pas encore été assigné)"
      @title="Suppression d'un résultat thématique"
      @submitTitle="Confirmer"
      @confirm={{fn this.deleteBadge this.badgeIdToDelete}}
      @cancel={{this.toggleDisplayConfirm}}
      @show={{this.displayConfirm}}
    />
  </template>
}
