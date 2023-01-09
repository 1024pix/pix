export default class CampaignModule1Level3 {
  constructor(masteryPercentage) {
    this.masteryPercentage = masteryPercentage;
  }
  next() {
    if (this.masteryPercentage < 70) {
      return 'RAENYE884';
    } else {
      return 'PROCOMP51';
    }
  }
}
