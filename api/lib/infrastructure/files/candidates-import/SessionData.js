import dayjs from 'dayjs';

class SessionData {
  constructor({
    id,
    accessCode,
    address,
    certificationCenter,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    certificationCenterId,
    assignedCertificationOfficerId,
  }) {
    this.id = id;
    this.accessCode = accessCode;
    this.address = address;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.description = description;
    this.examiner = examiner;
    this.room = room;
    this.time = time;
    this.examinerGlobalComment = examinerGlobalComment;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    this.publishedAt = publishedAt;
    this.certificationCenterId = certificationCenterId;
    this.assignedCertificationOfficerId = assignedCertificationOfficerId;
    this.startTime = dayjs(time, 'HH:mm').format('HH:mm');
    this.date = dayjs(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
  }

  static fromSession(session) {
    return new SessionData(session);
  }
}

export { SessionData };
