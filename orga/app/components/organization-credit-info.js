import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';

export default class OrganizationCreditInfoComponent extends Component {
    @service currentUser

    get tooltipContent() {
      return htmlSafe('Le nombre de crédits affichés correspond au nombre de crédits acquis par l’organisation et en cours de validité (indépendamment de leur activation). Pour plus d’information contactez-nous à l’adresse <a href=mailto:pro@pix.fr>pro@pix.fr</a>');
    }

    get credit() {
      const creditText = this.currentUser.organization.credit > 1 ? ' crédits' : ' crédit';
      return this.currentUser.organization.credit.toLocaleString() + creditText;
    }

    get canShowCredit() {
      return this.currentUser.isAdminInOrganization && this.currentUser.organization.credit > 0;
    }
}
