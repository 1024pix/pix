export default class SourisLevel3 {
  constructor(masteryPercentage) {
    this.masteryPercentage = masteryPercentage;
  }
  next() {
    if (this.masteryPercentage < 70) {
      return 'NTNSFE441';
    } else {
      return 'SBESVL926';
    }
  }
}
