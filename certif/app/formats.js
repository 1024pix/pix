export default {
  time: {
    hhmm: {
      hour: 'numeric',
      minute: 'numeric',
    },
    hhmmss: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    },
  },
  date: {
    hhmmss: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    },
    L: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
    LL: {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  },
  number: {
    compact: { notation: 'compact' },
  },
};
