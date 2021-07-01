module.exports = function(chai, _utils) {
  chai.Assertion.addMethod('deepEqualInstance', function(referenceInstance) {
    const assertedInstance = this._obj;

    // Assert type
    const assertedInstanceName = assertedInstance.constructor.name;
    const referenceInstanceName = referenceInstance.constructor.name;
    new chai.Assertion(assertedInstanceName).to.equal(referenceInstanceName);

    // Assert content
    new chai.Assertion(assertedInstance).to.deep.equal(referenceInstance);
  });
};
