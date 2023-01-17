export default class CampaignLevel2 {
  constructor(masteryPercentage) {
    this.masteryPercentage = masteryPercentage;
  }
  next() {
    if (this.masteryPercentage < 70) {
      return 'LBNPQE113';
    } else {
      return 'KMXHXK913';
    }
  }
}
