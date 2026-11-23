import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SessionParametersController extends Controller {
  @tracked sessionNumberTooltipText = '';
  @tracked accessCodeTooltipText = '';
  @tracked invigilatorPasswordTooltipText = '';
  @service currentUser;
  @service intl;

  get session() {
    return this.model.session;
  }

  get sessionManagement() {
    return this.model.sessionManagement;
  }

  get certificationCandidates() {
    return this.model.certificationCandidates;
  }

  get sessionHasStartedCertification() {
    return this.certificationCandidates.some(({ hasStartedTest }) => hasStartedTest);
  }

  @action
  async showSessionIdTooltip() {
    await navigator.clipboard.writeText(this.session.id);
    this.sessionNumberTooltipText = this.intl.t('common.actions.copied');
    await _waitForSeconds(2);
    this.removeSessionNumberTooltip();
  }

  @action
  removeSessionNumberTooltip() {
    this.sessionNumberTooltipText = '';
  }

  @action
  async showAccessCodeTooltip() {
    await navigator.clipboard.writeText(this.session.accessCode);
    this.accessCodeTooltipText = this.intl.t('common.actions.copied');
    await _waitForSeconds(2);
    this.removeAccessCodeTooltip();
  }

  @action
  removeAccessCodeTooltip() {
    this.accessCodeTooltipText = '';
  }

  @action
  async showInvigilatorPasswordTooltip() {
    await navigator.clipboard.writeText(this.session.invigilatorPassword);
    this.invigilatorPasswordTooltipText = this.intl.t('common.actions.copied');
    await _waitForSeconds(2);
    this.removeInvigilatorPasswordTooltip();
  }

  @action
  removeInvigilatorPasswordTooltip() {
    this.invigilatorPasswordTooltipText = '';
  }

  get isAccessCodeTooltipTextEmpty() {
    return this.accessCodeTooltipText.length === 0;
  }

  get isInvigilatorPasswordTooltipTextEmpty() {
    return this.invigilatorPasswordTooltipText.length === 0;
  }

  get isSessionNumberTooltipTextEmpty() {
    return this.sessionNumberTooltipText.length === 0;
  }
}

async function _waitForSeconds(timeoutInSeconds) {
  const timeoutInMiliseconds = timeoutInSeconds * 1000;
  return new Promise((resolve) => window.setTimeout(resolve, timeoutInMiliseconds));
}
