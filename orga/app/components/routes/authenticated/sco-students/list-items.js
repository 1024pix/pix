import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';
import { htmlSafe } from '@ember/string';

export default class ListItems extends Component {

  @service currentUser;
  @service session;

  @tracked student = null;
  @tracked isShowingAuthenticationMethodModal = false;
  @tracked isShowingDissociateModal = false;
  @tracked isDissociateButtonEnabled = ENV.APP.IS_DISSOCIATE_BUTTON_ENABLED;

  get acceptedFileType() {
    if (this.currentUser.isAgriculture) {
      return ['.csv'];
    }
    return ['.xml', '.zip'];
  }

  get displayLearnMoreAndLinkTemplate() {
    return this.currentUser.isAgriculture && this.currentUser.isCFA;
  }

  get urlToDownloadCsvTemplate() {
    return `${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/schooling-registrations/csv-template?accessToken=${this.session.data.authenticated.access_token}`;
  }

  get textTooltipForAgri() {
    return htmlSafe('Quelques informations concernant l’import :<ul><li>Pour vos élèves : utiliser l’export FREGATA vers Pix et cliquer sur le bouton importer.</li><li>Pour vos apprentis : Pix importe tous les apprentis fin novembre au sein de votre espace Pix Orga. Les ajouts ponctuels d’apprentis se feront à partir de décembre, pour cela consulter la documentation Pix Orga et utiliser le modèle fourni.</li></ul>');
  }

  @action
  openAuthenticationMethodModal(student) {
    this.student = student;
    this.isShowingAuthenticationMethodModal = true;
  }

  @action
  closeAuthenticationMethodModal() {
    this.isShowingAuthenticationMethodModal = false;
  }

  @action
  openDissociateModal(student) {
    this.student = student;
    this.isShowingDissociateModal = true;
  }

  @action
  closeDissociateModal() {
    this.isShowingDissociateModal = false;
  }
}
