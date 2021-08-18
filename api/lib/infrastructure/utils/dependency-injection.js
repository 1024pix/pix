const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');

function _instantiateDependencies(defaults, queryBuilder) {
  return _.mapValues(defaults, (dependence) => {
    if (dependence.prototype) {
      return new dependence(queryBuilder);
    } else {
      return dependence;
    }
  });
}

function injectDefaults(defaults, useCase) {
  return (args) => {
    if (useCase.useTransaction) {
      return knex.transaction((trx) => {
        const dependencies = _instantiateDependencies(defaults, trx);
        return useCase.perform(Object.assign(Object.create(dependencies), args));
      });
    } else if (useCase.perform) {
      const dependencies = _instantiateDependencies(defaults, knex);
      return useCase.perform(Object.assign(Object.create(dependencies), args));
    } else {
      const dependencies = _instantiateDependencies(defaults, knex);
      return useCase(Object.assign(Object.create(dependencies), args));
    }
  };
}

function injectDependencies(toBeInjected, dependencies) {
  return _.mapValues(toBeInjected, _.partial(injectDefaults, dependencies));
}

module.exports = { injectDependencies, injectDefaults };
