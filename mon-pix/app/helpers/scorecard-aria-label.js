import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class ScorecardAriaLabel extends Helper {
  @service intl;

  compute([scorecard]) {
    const isNotStarted = scorecard.isNotStarted;
    const currentLevel = isNotStarted ? null : scorecard.level;
    const capedPercentageAheadOfNextLevel = scorecard.capedPercentageAheadOfNextLevel;

    if (isNotStarted) {
      return this.intl.t('pages.profile.competence-card.image-info.no-level');
    } else if (currentLevel == 0) {
      return this.intl.t('pages.profile.competence-card.image-info.first-level', {
        percentageAheadOfNextLevel: capedPercentageAheadOfNextLevel,
      });
    }
    return this.intl.t('pages.profile.competence-card.image-info.level', {
      currentLevel,
      percentageAheadOfNextLevel: capedPercentageAheadOfNextLevel,
    });
  }
}
