import Controller from '@ember/controller';
import { action } from '@ember/object';
/* eslint-disable ember/no-computed-properties-in-native-classes*/
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
/* eslint-enable ember/no-computed-properties-in-native-classes*/
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class SessionParametersController extends Controller {
  @alias('model.session') session;
  @alias('model.certificationCandidates') certificationCandidates;
  @tracked sessionNumberTooltipText = '';
  @tracked accessCodeTooltipText = '';
  @tracked supervisorPasswordTooltipText = '';
  @service currentUser;
  @service intl;

  @computed('certificationCandidates.@each.isLinked')
  get sessionHasStarted() {
    return this.certificationCandidates.some(({ isLinked }) => isLinked);
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
  async showSupervisorPasswordTooltip() {
    await navigator.clipboard.writeText(this.session.supervisorPassword);
    this.supervisorPasswordTooltipText = this.intl.t('common.actions.copied');
    await _waitForSeconds(2);
    this.removeSupervisorPasswordTooltip();
  }

  @action
  removeSupervisorPasswordTooltip() {
    this.supervisorPasswordTooltipText = '';
  }

  get isAccessCodeTooltipTextEmpty() {
    return this.accessCodeTooltipText.length === 0;
  }

  get isSupervisorPasswordTooltipTextEmpty() {
    return this.supervisorPasswordTooltipText.length === 0;
  }

  get isSessionNumberTooltipTextEmpty() {
    return this.sessionNumberTooltipText.length === 0;
  }
}

async function _waitForSeconds(timeoutInSeconds) {
  const timeoutInMiliseconds = timeoutInSeconds * 1000;
  return new Promise((resolve) => window.setTimeout(resolve, timeoutInMiliseconds));
}
