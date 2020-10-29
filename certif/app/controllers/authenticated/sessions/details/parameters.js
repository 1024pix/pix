import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';

export default class SessionParametersController extends Controller {

  @alias('model.session') session;
  @alias('model.certificationCandidates') certificationCandidates;
  @tracked tooltipText = 'Copier le lien direct';

  @computed('certificationCandidates.@each.isLinked')
  get sessionHasStarted() {
    return this.certificationCandidates.isAny('isLinked');
  }

  @action
  clipboardSuccess() {
    this.tooltipText = 'Copié !';
  }

  @action
  clipboardOut() {
    this.tooltipText = 'Copier le code d\'accès';
  }
}
