// TODO Move to infrastructure
class EndOfParticipationBadgeViewModel {
  constructor({
    id,
    key,
    altMessage,
    imageUrl,
    message,
    badgePartnerCompetences = [],
  } = {}) {
    this.id = id;
    this.altMessage = altMessage;
    this.imageUrl = imageUrl;
    this.message = message;
    this.key = key;
    this.badgePartnerCompetences = badgePartnerCompetences;
  }
}

module.exports = EndOfParticipationBadgeViewModel;
