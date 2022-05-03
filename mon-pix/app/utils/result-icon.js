const resultIcons = {
  ok: {
    icon: 'circle-check',
    color: 'green',
  },
  ko: {
    icon: 'times-circle',
    color: 'red',
  },
  focusedOut: {
    icon: 'times-circle',
    color: 'red',
  },
  aband: {
    icon: 'times-circle',
    color: 'grey',
  },
  partially: {
    icon: 'circle-check',
    color: 'orange',
  },
  timedout: {
    icon: 'times-circle',
    color: 'red',
  },
};

export default function resultIcon(resultStatus) {
  return resultIcons[resultStatus];
}
