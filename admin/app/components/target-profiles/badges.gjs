import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import TickOrCross from '../common/tick-or-cross';
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
        <table class="table-admin">
          <thead>
            <tr>
              <th class="table__column table__column--id">ID</th>
              <th class="badges-table__image">Image</th>
              <th class="badges-table__key">Clé</th>
              <th class="badges-table__name">Nom</th>
              <th>Message</th>
              <th class="badges-table__shortcoming">Lacune</th>
              <th class="badges-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {{#each @badges as |badge|}}
              <tr aria-label="Informations du badge {{badge.title}}">
                <td class="table__column table__column--id">{{badge.id}}</td>
                <td class="badges-table__image"><img src={{badge.imageUrl}} alt={{badge.altMessage}} /></td>
                <td class="key-table">{{badge.key}}</td>
                <td>{{badge.title}}</td>
                <td>{{badge.message}}</td>
                <td>
                  <TickOrCross @isTrue={{badge.isAlwaysVisible}} />
                </td>
                <td class="badges-table__actions">
                  <PixButtonLink
                    @variant="secondary"
                    @route="authenticated.target-profiles.target-profile.badges.badge"
                    @size="small"
                    @model={{badge.id}}
                    class="badges-table-actions__button"
                    aria-label="Détails du badge {{badge.title}}"
                  >Voir détail</PixButtonLink>
                  <PixButton
                    @size="small"
                    @variant="error"
                    @triggerAction={{fn this.toggleDisplayConfirm badge.id}}
                    class="badges-table-actions-delete"
                    @iconBefore="trash"
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
