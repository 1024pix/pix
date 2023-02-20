export default function (chai, _utils) {
  chai.Assertion.addMethod('deepEqualInstance', function (referenceInstance) {
    const assertedInstance = this._obj;

    _assertAreSameType(chai, assertedInstance, referenceInstance);
    _assertHaveSameContent(chai, assertedInstance, referenceInstance);
  });
}

function _assertAreSameType(chai, value1, value2) {
  const instanceClassName1 = value1.constructor.name;
  const instanceClassName2 = value2.constructor.name;
  new chai.Assertion(instanceClassName1).to.equal(instanceClassName2);
}

function _assertHaveSameContent(chai, value1, value2) {
  new chai.Assertion(value1).to.deep.equal(value2);
}
