import Controller from '@ember/controller';
import { computed } from '@ember/object';
import areaColors from 'mon-pix/static-data/area-colors';

const NUMBER_OF_PIX_BY_LEVEL = 8;
const MAX_DISPLAYED_PERCENTAGE = 95;

export default Controller.extend({
  maxLevel: 5,

  areaColor: computed('model.scorecard', function() {
    const codeString = this.get('model.scorecard.area.code').toString();
    const foundArea = areaColors.find((color) => color.area === codeString);

    return foundArea.color;
  }),

  percentageAheadOfNextLevel: computed('model.scorecard', function() {
    return Math.min(MAX_DISPLAYED_PERCENTAGE, this.get('model.scorecard.pixScoreAheadOfNextLevel') / NUMBER_OF_PIX_BY_LEVEL * 100);
  }),

  remainingDaysText: computed('model.competence', function() {
    const daysBeforeNewAttempt = this.get('model.competence.daysBeforeNewAttempt');

    return `Disponible dans ${daysBeforeNewAttempt} ${daysBeforeNewAttempt <= 1 ? 'jour' : 'jours'}`;
  }),
});
