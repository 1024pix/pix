/* eslint-disable ember/no-computed-properties-in-native-classes */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class NeutralizationController extends Controller {
  @alias('model') certificationDetails;

  @action
  neutralize(challengeRecId) {
    return this.certificationDetails.neutralizeChallenge({
      certificationCourseId: this.certificationDetails.id,
      challengeRecId,
    });
  }
}
