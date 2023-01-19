export default class FichierLevel2 {
  constructor(masteryPercentage) {
    this.masteryPercentage = masteryPercentage;
  }
  next() {
    if (this.masteryPercentage < 70) {
      return 'SDDPGG528';
    } else {
      return 'DOCUMENTS';
    }
  }
}
