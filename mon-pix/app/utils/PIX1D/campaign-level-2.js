export default class CampaignLevel2 {
  constructor(masteryPercentage) {
    this.masteryPercentage = masteryPercentage;
  }
  next() {
    if (this.masteryPercentage <= 50) {
      return 'MGBFUS272';
    } else {
      return 'PROCOMP51';
    }
  }
}
