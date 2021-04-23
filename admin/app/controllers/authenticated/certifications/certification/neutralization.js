/* eslint-disable ember/no-computed-properties-in-native-classes */

import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class NeutralizationController extends Controller {
  @alias('model') certificationDetails;
  @service notifications;

  @action
  async neutralize(challengeRecId, questionIndex) {
    try {
      await this.certificationDetails.neutralizeChallenge({
        certificationCourseId: this.certificationDetails.id,
        challengeRecId,
      });
      this._updateModel(challengeRecId, true);
      return this.notifications.success(`La question n°${questionIndex} a été neutralisée avec succès.`);
    } catch (e) {
      return this.notifications.error(`Une erreur est survenue lors de la neutralisation de la question n°${questionIndex}.`);
    }
  }

  @action
  async deneutralize(challengeRecId, questionIndex) {
    try {
      await this.certificationDetails.deneutralizeChallenge({
        certificationCourseId: this.certificationDetails.id,
        challengeRecId,
      });
      this._updateModel(challengeRecId, false);
      return this.notifications.success(`La question n°${questionIndex} a été dé-neutralisée avec succès.`);
    } catch (e) {
      return this.notifications.error(`Une erreur est survenue lors de la dé-neutralisation de la question n°${questionIndex}.`);
    }
  }

  _updateModel(challengeRecId, neutralized) {
    const neutralizedChallenge = this.certificationDetails.listChallengesAndAnswers.find((challengeAndAnswer) => {
      return challengeAndAnswer.challengeId === challengeRecId;
    });
    set(neutralizedChallenge, 'isNeutralized', neutralized);
  }
}
