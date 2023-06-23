module.exports = (translations) => {
  return Object.keys(translations).sort((keyA, keyB) => {
    if (keyB == 'current-lang' || keyB == 'title') {
      return 1;
    } else if (keyA == 'current-lang' || keyA == 'title') {
      return -1;
    }
    if (keyA == keyB) {
      return 0;
    } else if (keyA < keyB) {
      return -1;
    } else {
      return 1;
    }
  });
};
