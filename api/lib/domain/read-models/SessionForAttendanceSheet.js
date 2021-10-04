class SessionForAttendanceSheet {

  constructor({
    id,
    date,
    time,
    address,
    room,
    examiner,
    certificationCenterName,
    certificationCenterType,
    certificationCandidates,
  }) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.address = address;
    this.room = room;
    this.examiner = examiner;
    this.certificationCenterName = certificationCenterName;
    this.certificationCenterType = certificationCenterType;
    this.certificationCandidates = certificationCandidates;
  }
}

module.exports = SessionForAttendanceSheet;
