import Training from 'mon-pix/models/training';

// Infos d'affichage partagées par les cartes mobiles (type • modalité • durée)
export function getTrainingInfo({ training, intl, locale }) {
  const deliveryModeKey = training.deliveryMode === 'onSite' ? 'on-site' : training.deliveryMode;
  const type = training.isTypeLinkedToALocation
    ? intl.t('pages.training.type.formation')
    : intl.t(`pages.training.type.${training.type}`);

  return {
    type,
    deliveryMode: intl.t(`pages.skill-review.recommended-engine.training-card.delivery-mode.${deliveryModeKey}`),
    duration: training.hasDuration
      ? Training.formatDuration({ locale: locale.currentLanguage, duration: training.duration })
      : null,
    illustrationPath: `/images/illustrations/results/training-${training.type}.webp`,
  };
}
