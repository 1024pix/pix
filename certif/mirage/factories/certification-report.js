import { Factory } from 'miragejs';

export default Factory.extend({
  certificationCourseId() {
    return 15263748;
  },

  firstName() {
    return 'Ivan';
  },

  lastName() {
    return 'Denissovitch';
  },

  externalId() {
    return 'CH-854';
  },

  hasSeenEndTestScreen() {
    return false;
  },

  isCompleted() {
    return false;
  },

  abortReason() {
    return 'Avait froid aux mains';
  },
});
