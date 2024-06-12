import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Badges extends Component {
  @tracked isLoading;
  @tracked badges;

  @service store;

  constructor() {
    super(...arguments);
    this.#initBadges(this.args.targetProfile);
  }

  get getTargetProfileBadgesErrorMessage() {
    if (this.isLoading || this.badges?.length > 0) {
      return undefined;
    }
    return 'Seul un profil cible comportant au moins un résultat thématique certifiant peut être rattaché à une certification complémentaire. Le profil cible que vous avez sélectionné ne comporte pas de résultat thématique certifiant. Veuillez le modifier puis rafraîchir cette page ou bien sélectionner un autre profil cible.';
  }

  @action
  onBadgeUpdated({ badgeId, fieldName, fieldValue }) {
    if (!badgeId) {
      return;
    }

    this.args.onBadgeUpdated({ update: { badgeId, fieldName, fieldValue } });
  }

  async #initBadges({ id } = {}) {
    this.isLoading = true;
    if (!id) {
      this.#onfetchBadgesError(new ReferenceError('No target profile provided'));
      this.isLoading = false;
      return;
    }

    try {
      const targetProfile = await this.store.queryRecord('target-profile', {
        targetProfileId: id,
        filter: {
          badges: 'certifiable',
        },
      });
      if (this.isDestroyed) {
        return;
      }
      this.badges = targetProfile
        .hasMany('badges')
        .value()
        ?.map((badge) => ({
          id: badge.id,
          label: badge.title,
          isCertifiable: badge.isCertifiable,
        }));
    } catch {
      this.#onfetchBadgesError();
    } finally {
      this.isLoading = false;
    }
  }

  #onfetchBadgesError() {
    this.args.onError('Une erreur est survenue lors de la recherche de résultats thématiques.');
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.isLoading = undefined;
    this.badges = undefined;
  }
}
