import { BaseEvent } from './BaseEvent.js';

export class CandidateEnrolledEvent extends BaseEvent {
  get name() {
    return 'CandidateEnrolledEvent';
  }
}
