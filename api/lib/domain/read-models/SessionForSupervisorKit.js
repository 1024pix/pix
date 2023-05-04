class SessionForSupervisorKit {
  constructor({ id, date, time, address, room, examiner, accessCode, supervisorPassword }) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.address = address;
    this.room = room;
    this.examiner = examiner;
    this.accessCode = accessCode;
    this.supervisorPassword = supervisorPassword;
  }
}

export { SessionForSupervisorKit };
