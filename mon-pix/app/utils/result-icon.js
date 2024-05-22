const resultIcons = {
  ok: {
    icon: 'circle-check',
    color: 'green',
  },
  ko: {
    icon: 'circle-xmark',
    color: 'red',
  },
  focusedOut: {
    icon: 'circle-xmark',
    color: 'red',
  },
  aband: {
    icon: 'circle-xmark',
    color: 'grey',
  },
  timedout: {
    icon: 'circle-xmark',
    color: 'red',
  },
};

export default function resultIcon(resultStatus) {
  return resultIcons[resultStatus];
}
