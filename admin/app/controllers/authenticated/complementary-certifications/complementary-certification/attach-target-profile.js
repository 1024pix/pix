import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AttachTargetProfileController extends Controller {

  @service notifications;
  @service router;
  @service store;

  @tracked attachableTargetProfiles = [];
  @tracked isAttachableTargetProfilesLoading = false;

  @tracked selectedTargetProfile;

  @tracked isLoadingBadges = false;
  @tracked targetProfileBadges = [];

  get getTargetProfileBadgesErrorMessage() {
    if(this.isLoadingBadges || this.targetProfileBadges.length > 0) {
      return;
    }
    return "Seul un profil cible comportant au moins un résultat thématique certifiant peut être rattaché à une certification complémentaire. Le profil cible que vous avez sélectionné ne comporte pas de résultat thématique certifiant. Veuillez le modifier puis rafraîchir cette page ou bien sélectionner un autre profil cible.";
  }

  @action
  async cancel() {
    this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');
  }

  @action
  async onSelection(selectedAttachableTargetProfile) {
    this.attachableTargetProfiles = [];

    if(selectedAttachableTargetProfile?.value?.id) {
      this.selectedTargetProfile = selectedAttachableTargetProfile?.value;
      try {
        this.isLoadingBadges = true;

        const targetProfile = await this.store.findRecord('target-profile', this.selectedTargetProfile.id);
        this.targetProfileBadges = targetProfile.badges?.map((badge) => ({
          id: badge.id,
          label: badge.title,
        }));

      } catch (e) {
        this.notifications.error("Une erreur est survenue, veuillez rafraichir la page.");
      } finally {
        this.isLoadingBadges = false;
      }
    }
  }

  @action
  onChange() {
    this.selectedTargetProfile = undefined;
    this.targetProfileBadges = []
  }

  @action
  async onSearch(value) {
    const searchTerm = value?.trim();
    const isSearchById = searchTerm && /^\d+$/.test(searchTerm);
    const isSearchByName = searchTerm?.length >= 2;

    if (isSearchById || isSearchByName) {

      try {
        this.isAttachableTargetProfilesLoading = true;

        const attachableTargetProfiles = await this.store.query('attachable-target-profile', { searchTerm });
        this.attachableTargetProfiles = attachableTargetProfiles.map((attachableTargetProfile) => ({
          label: `${attachableTargetProfile.id} - ${attachableTargetProfile.name}`,
          value: attachableTargetProfile,
        }));

      } catch (e) {
        this.notifications.error("Une erreur est survenue lors de la recherche de profils cibles.");
      } finally {
        this.isAttachableTargetProfilesLoading = false;
      }
    } else {
      this.attachableTargetProfiles = [];
    }
  }
}
