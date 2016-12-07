module.exports = {

  // XXX inspired by http://stackoverflow.com/a/37511463/827989
  _removeAccentsSpacesUppercase(rawAnswer) {
    return rawAnswer.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  _fuzzyMatchingWithAnswers(answer, solutionVariants) {
    answer = this._removeAccentsSpacesUppercase(answer);
    const solutionVariantList = solutionVariants.split('\n');
    for (const variant of solutionVariantList) {
      if (answer == this._removeAccentsSpacesUppercase(variant)) {
        return true;
      }
    }
    return false;
  },

  _areStringListEquivalent(listA, listB) {
    let result = false;
    try {
      const trimmedListA = listA.split(',').map(s => s.trim());
      const trimmedListB = listB.split(',').map(s => s.trim());
      result = (trimmedListA.sort().join(',') === trimmedListB.sort().join(','));
    } catch (e) {
      result = false;
    }
    return result;
  },

  match(answer, solution) {

    const answerValue = answer.get('value');
    const solutionValue = solution.value;

    if ('#ABAND#' === answerValue) {
      return 'aband';
    }

    if (solution.type === 'QRU') {
      return 'pending';
    }

    if (solution.type === 'QCU') {
      return (answerValue === solutionValue) ? 'ok' : 'ko';
    }

    if (solution.type === 'QCM') {
      return this._areStringListEquivalent(answerValue, solutionValue) ? 'ok' : 'ko';
    }

    if (solution.type === 'QROC') {
      return this._fuzzyMatchingWithAnswers(answerValue, solutionValue) ? 'ok' : 'ko';
    }

    return 'pending';
  }

};
