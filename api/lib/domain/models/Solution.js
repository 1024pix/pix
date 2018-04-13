class Session {

  // TODO: @Brandone est ce que c'est utile de stocker les deactivations, est ce que cela ne se recalcule pas avec les enabledTreatments ?
  constructor({
    id, type, value, enabledTreatments, deactivations, scoring
  } = {}) {
    this.id = id;
    this.type = type;
    this.value = value;
    this.enabledTreatments = enabledTreatments;
    this.deactivations = deactivations;
    this.scoring = scoring;
  }
}

module.exports = Session;
