/* eslint-disable ember/no-computed-properties-in-native-classes */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class NeutralizationController extends Controller {
  @alias('model') certificationDetails;
  @service notifications;

  @action
  async neutralize(challengeRecId) {
    try {
      await this.certificationDetails.neutralizeChallenge({
        certificationCourseId: this.certificationDetails.id,
        challengeRecId,
      });
      return this.notifications.success('Épreuve neutralisée avec succès.');
    } catch (e) {
      return this.notifications.error('Une erreur est survenue lors de la neutralisation de l\'épreuve.');
    }
  }
}
