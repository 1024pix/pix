import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import JoinScoInformationModal from 'mon-pix/components/routes/campaigns/join-sco-information-modal';
import ScoForm from 'mon-pix/components/routes/campaigns/sco-form';
import { decodeToken } from 'mon-pix/helpers/jwt';

export default class AssociateScoStudentWithMediacentreForm extends Component {
  <template>
    <ScoForm
      @campaignCode={{@campaignCode}}
      @organizationName={{@organizationName}}
      @areNamesDisabled={{true}}
      @firstName={{this.firstName}}
      @lastName={{this.lastName}}
      @onSubmit={{this.submit}}
      @errorMessage={{this.errorMessage}}
    />

    {{#if this.displayInformationModal}}
      <JoinScoInformationModal
        @campaignCode={{@campaignCode}}
        @reconciliationError={{this.reconciliationError}}
        @reconciliationWarning={{this.reconciliationWarning}}
        @closeModal={{this.closeModal}}
      />
    {{/if}}
  </template>
  @service session;
  @service currentUser;
  @service store;
  @service intl;

  @tracked errorMessage;

  @tracked displayInformationModal = false;
  @tracked reconciliationError = null;

  @tracked attributes = null;

  firstName = '';
  lastName = '';

  constructor() {
    super(...arguments);

    const tokenIdForExternalUser = this.session.externalUserTokenFromGar;
    if (tokenIdForExternalUser) {
      const userFirstNameAndLastName = decodeToken(tokenIdForExternalUser);
      this.firstName = userFirstNameAndLastName['first_name'];
      this.lastName = userFirstNameAndLastName['last_name'];
    }
  }

  @action
  closeModal() {
    this.displayInformationModal = false;
  }

  @action
  async submit(attributes) {
    this.errorMessage = null;
    this.displayInformationModal = false;
    this.reconciliationError = null;
    this.attributes = attributes;

    const externalUserRecord = this._createExternalUserRecord();
    try {
      await this.args.onSubmit(externalUserRecord);
    } catch (errorResponse) {
      externalUserRecord.unloadRecord();
      this._setErrorMessageForAttemptNextAction(errorResponse);
    }
  }

  _createExternalUserRecord() {
    const externalUserToken = this.session.externalUserTokenFromGar;
    return this.store.createRecord('external-user', {
      birthdate: this.attributes.birthdate,
      organizationId: this.args.organizationId,
      externalUserToken,
    });
  }

  _setErrorMessageForAttemptNextAction(errorResponse) {
    if (!errorResponse.errors) throw errorResponse;
    errorResponse.errors.forEach((error) => {
      if (error.status === '409') {
        if ('USER_ALREADY_RECONCILED_IN_THIS_ORGANIZATION' === error.code) {
          this.errorMessage = this.intl.t('api-error-messages.join-error.r70');
        } else {
          this.reconciliationError = error;
          this.displayInformationModal = true;
          this.session.userIdForLearnerAssociation = error.meta.userId;
        }
      } else if (error.status === '404') {
        this.errorMessage = this.intl.t('pages.join.sco.error-not-found', { htmlSafe: true });
      } else if (error.status === '400') {
        this.errorMessage = this.intl.t('pages.join.sco.invalid-reconciliation-error', { htmlSafe: true });
      } else {
        this.errorMessage = error.detail;
      }
    });
  }
}
