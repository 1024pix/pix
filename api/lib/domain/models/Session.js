class Session {

  constructor({
    id,
    accessCode,
    address,
    certificationCenter,
    certifications,
    date,
    description,
    examiner,
    room,
    time,
  } = {}) {
    this.id = id;
    this.accessCode = accessCode;
    this.address = address;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.description = description;
    this.examiner = examiner;
    this.room = room;
    this.time = time;

    this.certifications = certifications;
  }
}

module.exports = Session;
