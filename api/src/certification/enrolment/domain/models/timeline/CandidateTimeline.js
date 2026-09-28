// @ts-check
/**
 * @typedef {import ('./TimelineEvent.js').TimelineEvent} TimelineEvent
 */

import dayjs from 'dayjs';
import Joi from 'joi';

import { EntityValidationError } from '../../../../../shared/domain/errors.js';

export class CandidateTimeline {
  static #schema = Joi.object({
    certificationCandidateId: Joi.number().integer().required(),
    events: Joi.array().required(),
  });

  /**
   * @param {object} props
   * @param {number} props.certificationCandidateId
   */
  constructor({ certificationCandidateId }) {
    this.certificationCandidateId = certificationCandidateId;
    this.events = [];
    this.#validate();
  }

  /**
   * @param {TimelineEvent} event
   */
  addEvent(event) {
    this.events = [...this.events, event].toSorted(this.#compareEventDates);
  }

  /**
   * @param {TimelineEvent} eventA
   * @param {TimelineEvent} eventB
   */
  #compareEventDates(eventA, eventB) {
    const dateA = dayjs(eventA.when);
    const dateB = dayjs(eventB.when);

    if (dateA.isBefore(dateB)) {
      return -1;
    } else if (dateB.isBefore(dateA)) {
      return 1;
    }
    return 0;
  }

  #validate() {
    const { error } = CandidateTimeline.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
