import Service, { inject as service } from '@ember/service';

export default class AriaLabelsService extends Service {
  @service intl;

  computeScoreAriaLabel({ isNotStarted, currentLevel, percentageAheadOfNextLevel }) {
    if (isNotStarted) {
      return this.intl.t('pages.profile.competence-card.image-info.no-level');
    }
    else if (currentLevel == 0) {
      return this.intl.t('pages.profile.competence-card.image-info.first-level', {
        percentageAheadOfNextLevel,
      });
    }
    return this.intl.t('pages.profile.competence-card.image-info.level', {
      currentLevel,
      percentageAheadOfNextLevel,
    });
  }
}
