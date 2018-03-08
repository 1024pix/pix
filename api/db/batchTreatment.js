const BATCH_SIZE = 10;

function batch(knex, elementsToUpdate, treatment) {

  function _innerTreatment(knex, remainingElementsToUpdate, countOfBatches, batchesDone) {

    if (remainingElementsToUpdate.length <= 0) {
      return Promise.resolve()
        .then(() => {
          console.log(`-- ENDING - ${numberOfTotalBatches} iterations done\n`);
        });
    }

    const assessments = remainingElementsToUpdate.splice(0, BATCH_SIZE);
    const promises = assessments.map(treatment);

    return Promise
      .all(promises)
      .then((results) => {
        console.log(`---- Lot ${batchesDone} : ${results.length} processed - (total: ${countOfBatches} lots, ${batchesDone / countOfBatches * 100}%)`);
      })
      .then(() => _innerTreatment(knex, remainingElementsToUpdate, countOfBatches, batchesDone+1));
  }

  const numberOfTotalBatches = Math.ceil(elementsToUpdate.length / BATCH_SIZE);

  return Promise
    .resolve()
    .then(() => {
      console.log(`\n-- STARTING - Processing the data through ${numberOfTotalBatches} iterations`);
    })
    .then(() => _innerTreatment(knex, elementsToUpdate, numberOfTotalBatches, 0));
}

module.exports = {
  batch
};
