export const formats = {
  formatTime: {
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
  formatDate: {
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
    LLL: {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
    medium: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  },
  formatNumber: {
    compact: { notation: 'compact' },
  },
};
