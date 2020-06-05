import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ToolsController extends Controller {

  isLoading = false;
  srcDatabaseUrl = null;
  srcUserId = null;
  destDatabaseUrl = null;
  destUserId = null;
  destOrganizationId = null;
  destCreatorId = null;
  destCertificationCenterId = null;

  @service notifications;

  @action
  async refreshLearningContent() {
    this.set('isLoading', true);
    try {
      await this.store.adapterFor('learning-content-cache').refreshCacheEntries();
      this.notifications.success('La demande de rechargement du cache a bien été prise en compte.');
    } catch (err) {
      this.notifications.error('Une erreur est survenue.');
    } finally {
      this.set('isLoading', false);
    }
  }

  @action
  async copyProfile() {
    this.set('isLoading', true);
    try {
      await this.store.adapterFor('profile-copy').copyProfile({
        srcDatabaseUrl: this.srcDatabaseUrl,
        srcUserId: this.srcUserId,
        destDatabaseUrl: this.destDatabaseUrl,
        destUserId: this.destUserId,
        destOrganizationId: this.destOrganizationId,
        destCreatorId: this.destCreatorId,
        destCertificationCenterId: this.destCertificationCenterId,
      });
      this.notifications.success('Succès de copie');
    } catch (err) {
      this._handleError(err);
    } finally {
      this.set('isLoading', false);
    }
  }

  _handleError(err) {
    if (!err || !err.errors || !err.errors[0]) {
      this.notifications.error(`Erreur lors de la copie du profil : erreur inconnue ${err}`);
    }
    const error = err.errors[0];
    if (error.status === '422') {
      let errorMessage;
      if (error.detail.includes('srcUserId')) errorMessage = 'ID utilisateur d\'origine est obligatoire et doit être un nombre';
      if (error.detail.includes('destUserId')) errorMessage = 'ID utilisateur de destination est obligatoire et doit être un nombre';
      if (error.detail.includes('srcDatabaseUrl')) errorMessage = 'Adresse vers la base de données source doit être une chaîne de caractères';
      if (error.detail.includes('destDatabaseUrl')) errorMessage = 'Adresse vers la base de données destination doit être une chaîne de caractères';
      if (error.detail.includes('destOrganizationId')) errorMessage = 'ID organisation de destination est obligatoire et doit être un nombre';
      if (error.detail.includes('destCreatorId')) errorMessage = 'ID membre de l\'organisation de destination est obligatoire et doit être un nombre';
      if (error.detail.includes('destCertificationCenterId')) errorMessage = 'ID du centre de certification est obligatoire et doit être un nombre';
      this.notifications.error(`Erreur lors de la copie du profil: ${errorMessage}`);
      return;
    }
    if (error.status === '400') {
      this.notifications.error(`Erreur lors de la copie du profil: ${error.detail}`);
      return;
    }
    this.notifications.error(`Erreur lors de la copie du profil : erreur inconnue ${err}`);
  }
}
