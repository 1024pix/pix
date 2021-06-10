const { AccessCode } = require('./AccessCode');
const moment = require('moment');
const Joi = require('joi');
const { ObjectValidationError } = require('../errors/ObjectValidationError');

class Session {
  constructor({
    id,
    certificationCenterId,
    certificationCenterName,
    accessCode,
    address,
    examiner,
    room,
    date,
    time,
    description,
  }) {
    this._id = id;
    this._certificationCenterId = certificationCenterId;
    this._certificationCenterName = certificationCenterName;
    this._accessCode = accessCode;
    this._address = address;
    this._examiner = examiner;
    this._room = room;
    this._date = date;
    this._time = time;
    this._description = description;

    validate(this);
  }

  static schedule({
    certificationCenterId,
    certificationCenterName,
    address,
    examiner,
    room,
    date,
    time,
    description,
  }, pickOneFrom) {
    // On ne peut pas, avec certitude, valider la règle de "date ne doit pas être avant aujourd'hui"
    // car on ne connaît pas la timezone du lieu où se déroule la session
    return new Session({
      id: null,
      certificationCenterId,
      certificationCenterName,
      accessCode: AccessCode.generate(pickOneFrom),
      address,
      examiner,
      room,
      date,
      time,
      description,
    });
  }

  toDTO() {
    return {
      id: this._id,
      certificationCenterId: this._certificationCenterId,
      certificationCenterName: this._certificationCenterName,
      address: this._address,
      examiner: this._examiner,
      room: this._room,
      date: this._date,
      time: this._time,
      description: this._description,
      accessCode: this._accessCode.value,
    };
  }
}

const schema = Joi.object({
  _id: Joi.number().integer().positive().allow(null).required(),
  _certificationCenterId: Joi.number().integer().positive().required(),
  _certificationCenterName: Joi.any(),
  _accessCode: Joi.any().required(),
  _address: Joi.string().required(),
  _examiner: Joi.string().required(),
  _room: Joi.string().required(),
  _date: Joi.string().custom(_validateDate).required(),
  _time: Joi.string().custom(_validateTime).required(),
  _description: Joi.any(),
});

function validate(session) {
  const { error } = schema.validate(session);

  if (error) {
    throw new ObjectValidationError(error);
  }
}

function _validateDate(aDate) {
  if ('string' != typeof aDate) {
    throw new Error('Should be a string');
  }

  const format = 'YYYY-MM-DD';
  if (!moment(aDate, format, true).isValid()) {
    throw new Error(`Expected ${format} format`);
  }

  return aDate;
}

function _validateTime(aTime) {
  if ('string' != typeof aTime) {
    throw new Error('Should be a string');
  }

  const format = 'HH:mm';
  if (!moment(aTime, format, true).isValid()) {
    throw new Error(`Expected ${format} format`);
  }

  return aTime;
}

module.exports = {
  Session,
};
