class SessionForInvigilatorKit {
  constructor({ id, date, time, address, room, examiner, accessCode, invigilatorPassword, version }) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.address = address;
    this.room = room;
    this.examiner = examiner;
    this.accessCode = accessCode;
    this.invigilatorPassword = invigilatorPassword;
    this.version = version;
  }
}

export { SessionForInvigilatorKit };
