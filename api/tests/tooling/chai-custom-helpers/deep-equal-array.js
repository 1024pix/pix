module.exports = function(chai, _utils) {
  chai.Assertion.addMethod('deepEqualArray', function(referenceInstances) {
    const assertedInstances = this._obj;

    // Assert that both provided values are arrays
    const assertedInstancesName = assertedInstances.constructor.name;
    const referenceInstancesName = referenceInstances.constructor.name;
    new chai.Assertion(assertedInstancesName).to.equal('Array');
    new chai.Assertion(referenceInstancesName).to.equal('Array');

    // Assert that both have the same length
    const assertedInstancesLength = assertedInstances.length;
    const referenceInstancesLength = referenceInstances.length;
    new chai.Assertion(assertedInstancesLength).to.equal(referenceInstancesLength);

    // Assert deepEqualInstance for each pair
    for (let i = 0; i < assertedInstances.length; ++i) {
      const assertedInstance = assertedInstances[i];
      const referenceInstance = referenceInstances[i];
      new chai.Assertion(assertedInstance).to.deepEqualInstance(referenceInstance);
    }
  });
};
