import dayjs from 'dayjs';

class SessionData {
  constructor({ id, date, time, address, room, examiner }) {
    this.id = id;
    this.address = address;
    this.date = date;
    this.examiner = examiner;
    this.room = room;
    this.startTime = dayjs(time, 'HH:mm').format('HH:mm');
    this.date = dayjs(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
  }

  static fromSession(session) {
    return new SessionData(session);
  }
}

export { SessionData };
