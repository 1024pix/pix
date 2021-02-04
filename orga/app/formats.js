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
    EUR: {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    USD: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
};
