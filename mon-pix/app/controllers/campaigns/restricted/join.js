import _ from 'lodash';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import ENV from 'mon-pix/config/environment';

export default class JoinRestrictedCampaignController extends Controller {
  queryParams = ['participantExternalId'];
  participantExternalId = null;

  @service session;
  @service store;
  @service intl;

  @tracked isLoading = false;
  @tracked errorMessage = null;

  @action
  attemptNext(schoolingRegistration) {

    this.errorMessage = null;
    this.isLoading = true;
    return schoolingRegistration.save().then(() => {
      this.isLoading = false;

      this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
        queryParams: { associationDone: true, participantExternalId: this.participantExternalId }
      });
    }, (errorResponse) => {
      schoolingRegistration.unloadRecord();
      this._setErrorMessageForAttemptNextAction(errorResponse);
      this.isLoading = false;
    });
  }

  _setErrorMessageForAttemptNextAction(errorResponse) {
    errorResponse.errors.forEach((error) => {
      if (error.status === '409') {
        const message = this._showErrorMessageByShortCode(error.meta);
        return this.errorMessage = message;
      }
      if (error.status === '404') {
        return this.errorMessage = 'Vous êtes un élève ? <br/> Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant.<br/> <br/> Vous êtes un enseignant ? <br/> L‘accès à un parcours n‘est pas disponible pour le moment.';
      }
      return this.errorMessage = error.detail;
    });
  }

  _showErrorMessageByShortCode(meta) {
    const defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);

    const errors = [
      { code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION', shortCode:'R11', message: `Vous possédez déjà un compte Pix avec l’adresse e-mail <br>${meta.value}<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br>(Code R11)` },
      { code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION', shortCode:'R12', message:`Vous possédez déjà un compte Pix utilisé avec l’identifiant <br>${meta.value}<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br>(Code R12)` },
      { code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION', shortCode:'R13', message: 'Vous possédez déjà un compte Pix via l‘ENT dans un autre établissement scolaire.<br>Pour continuer, contactez un enseignant qui pourra vous donner l’accès à ce compte à l‘aide de Pix Orga.' },
      { code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION', shortCode:'R31', message:`Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec l‘adresse mail <br>${meta.value}.<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br> (Code R31)` },
      { code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION', shortCode:'R32', message:`Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec l‘identifiant<br>${meta.value}.<br>Pour continuer, connectez-vous à ce compte ou demandez de l‘aide à un enseignant.<br> (Code R32)` },
      { code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION', shortCode:'R33', message:'Vous possédez déjà un compte Pix via l’ENT. Utilisez-le pour rejoindre le parcours.' }
    ];

    return  _.find(errors, ['shortCode', meta.shortCode]).message || defaultMessage;
  }
}
