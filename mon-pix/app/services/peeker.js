import Service, { inject as service } from '@ember/service';

export default class PeekerService extends Service {
  @service store;

  get(modelName, predicateFn) {
    const peeked = this.find(modelName, predicateFn);
    if (peeked.length === 0) {
      throw new Error('No record was found for model ' + modelName);
    }
    if (peeked.length > 1) {
      throw new Error('Multiple records were found for model ' + modelName + '. Consider using #find() instead.');
    }
    return peeked[0];
  }

  findOne(modelName, predicateFn) {
    const peeked = this.find(modelName, predicateFn);
    return peeked[0];
  }

  find(modelName, predicateFn) {
    predicateFn = this.checkPredicateFn(predicateFn);
    const peeked = [];
    this.store.peekAll(modelName).forEach((record) => {
      if (predicateFn(record)) {
        peeked.push(record);
      }
    });
    return peeked;
  }

  checkPredicateFn(predicateFn) {

    // To support findOne() without predicate, so we can retrieve the item
    // from the store without argument when we know there is only one of a specific kind
    if (!predicateFn) {
      predicateFn = () => true;
    }

    // Support shorthand syntax, like lodash methods
    if (!predicateFn) {
      predicateFn = () => true;
    }

    if (typeof predicateFn === 'object') {
      return (record) => {
        const objectKeys = Object.keys(predicateFn);
        return this.haveCommonProperties(objectKeys, predicateFn, record);
      };
    }
    if (typeof predicateFn !== 'function') {
      throw new Error('The second argument must be a Function');
    }
    return predicateFn;
  }

  haveCommonProperties(keys, firstObj, secondObj, matchingKeys = false) {

    // The function exists when all keys have been compared recursively for clarity.
    // But if no keys were ever compared, then the objects cannot be considered equals.
    if (keys.length === 0 && !matchingKeys) {
      return false;
    }
    // Each call pops out a value, so eventually, this will be empty and the function must stop calling itself.
    // Returning true here ensures this final return does not alter the previous boolean expression
    if (keys.length === 0) {
      return true;
    }
    const key = keys[0];
    return firstObj[key] === secondObj[key] && this.haveCommonProperties(keys.slice(1), firstObj, secondObj, true);
  }
}
