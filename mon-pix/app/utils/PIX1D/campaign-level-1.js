export default class CampaignLevel1 {
  constructor(masteryPercentage) {
    this.masteryPercentage = masteryPercentage;
  }
  next() {
    if (this.masteryPercentage <= 89) {
      return 'MGBFUS272';
    } else {
      return 'KCJJUL493';
    }
  }
}
