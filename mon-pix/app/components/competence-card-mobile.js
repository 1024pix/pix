/* eslint ember/no-classic-components: 0 */
/* eslint ember/no-computed-properties-in-native-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { computed } from '@ember/object';
import Component from '@ember/component';

export default class CompetenceCardMobile extends Component {
  scorecard = null;

  @computed('scorecard.{level,isNotStarted}')
  get displayedLevel() {
    if (this.scorecard.isNotStarted) {
      return null;
    }
    return this.scorecard.level;
  }
}
