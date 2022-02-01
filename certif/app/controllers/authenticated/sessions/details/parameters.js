import Controller from '@ember/controller';
import { action } from '@ember/object';
/* eslint-disable ember/no-computed-properties-in-native-classes*/
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
/* eslint-enable ember/no-computed-properties-in-native-classes*/
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class SessionParametersController extends Controller {
  @alias('model.session') session;
  @alias('model.certificationCandidates') certificationCandidates;
  @tracked sessionNumberTooltipText = '';
  @tracked accessCodeTooltipText = '';
  @tracked supervisorPasswordTooltipText = '';
  @service featureToggles;
  @service currentUser;

  @computed('certificationCandidates.@each.isLinked')
  get sessionHasStarted() {
    return this.certificationCandidates.isAny('isLinked');
  }

  get supervisorPasswordShouldBeDisplayed() {
    return this.currentUser.currentAllowedCertificationCenterAccess.hasEndTestScreenRemovalEnabled;
  }

  @action
  async showSessionIdTooltip() {
    this.sessionNumberTooltipText = 'Copié !';
    await _waitForSeconds(2);
    this.removeSessionNumberTooltip();
  }

  @action
  removeSessionNumberTooltip() {
    this.sessionNumberTooltipText = '';
  }

  @action
  async showAccessCodeTooltip() {
    this.accessCodeTooltipText = 'Copié !';
    await _waitForSeconds(2);
    this.removeAccessCodeTooltip();
  }

  @action
  removeAccessCodeTooltip() {
    this.accessCodeTooltipText = '';
  }

  @action
  async showSupervisorPasswordTooltip() {
    this.supervisorPasswordTooltipText = 'Copié !';
    await _waitForSeconds(2);
    this.removeSupervisorPasswordTooltip();
  }

  @action
  removeSupervisorPasswordTooltip() {
    this.supervisorPasswordTooltipText = '';
  }
}

async function _waitForSeconds(timeoutInSeconds) {
  const timeoutInMiliseconds = timeoutInSeconds * 1000;
  return new Promise((resolve) => window.setTimeout(resolve, timeoutInMiliseconds));
}
