/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';

export default class SessionParametersController extends Controller {

  @alias('model.session') session;
  @alias('model.certificationCandidates') certificationCandidates;
  @tracked accessCodeTooltipText = '';

  @computed('certificationCandidates.@each.isLinked')
  get sessionHasStarted() {
    return this.certificationCandidates.isAny('isLinked');
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
}

async function _waitForSeconds(timeoutInSeconds) {
  const timeoutInMiliseconds = timeoutInSeconds * 1000;
  return new Promise((resolve) => window.setTimeout(resolve, timeoutInMiliseconds));
}
