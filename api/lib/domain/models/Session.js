class Session {

  constructor(model = {}) {
    this.id = model.id;
    this.certificationCenter = model.certificationCenter;
    this.address = model.address;
    this.room = model.room;
    this.examiner = model.examiner;
    this.date = model.date;
    this.time = model.time;
    this.description = model.description;
    this.accessCode = model.accessCode;
  }
}

module.exports = Session;
