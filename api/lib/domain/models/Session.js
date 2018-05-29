class Session {

  constructor({ id, certificationCenter, address, room, examiner, date, time, description, accessCode, certifications } = {}) {
    this.id = id;
    this.certificationCenter = certificationCenter;
    this.address = address;
    this.room = room;
    this.examiner = examiner;
    this.date = date;
    this.time = time;
    this.description = description;
    this.accessCode = accessCode;

    this.certifications = certifications;
  }
}

module.exports = Session;
