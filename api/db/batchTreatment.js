const BATCH_SIZE = 10;

function batch(knex, elementsToUpdate, treatment) {

  function _innerTreatment(knex, remainingElementsToUpdate, countOfBatches, batchesDone) {

    if (remainingElementsToUpdate.length <= 0) {
      return Promise.resolve();
    }

    const assessments = remainingElementsToUpdate.splice(0, BATCH_SIZE);
    const promises = assessments.map((assessment) => {
      return treatment(assessment).catch((err) => {
        console.error('Treatment failed for :', assessment);

        throw err;
      });
    });

    return Promise
      .all(promises)
      .then((results) => {
        console.log(`---- Lot ${batchesDone} : ${results.length} processed - (total: ${countOfBatches} lots, ${batchesDone / countOfBatches * 100}%)`);
      })
      .then(() => _innerTreatment(knex, remainingElementsToUpdate, countOfBatches, batchesDone + 1));
  }

  const numberOfTotalBatches = Math.ceil(elementsToUpdate.length / BATCH_SIZE);

  return Promise
    .resolve()
    .then(() => _innerTreatment(knex, elementsToUpdate, numberOfTotalBatches, 0));
}

module.exports = {
  batch,
};
