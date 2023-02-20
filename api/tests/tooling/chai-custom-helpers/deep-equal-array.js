export default function (chai, _utils) {
  chai.Assertion.addMethod('deepEqualArray', function (referenceArray) {
    const assertedArray = this._obj;

    _assertIsArray(chai, assertedArray);
    _assertIsArray(chai, referenceArray);
    _assertArraysHaveSameLength(chai, assertedArray, referenceArray);

    for (let i = 0; i < assertedArray.length; ++i) {
      _assertDeepEqualInstance(chai, assertedArray[i], referenceArray[i]);
    }
  });
}

function _assertIsArray(chai, value) {
  const instanceClassName = value.constructor.name;
  new chai.Assertion(instanceClassName).to.equal('Array');
}

function _assertArraysHaveSameLength(chai, array1, array2) {
  const array1Length = array1.length;
  const array2Length = array2.length;
  new chai.Assertion(array1Length).to.equal(array2Length);
}

function _assertDeepEqualInstance(chai, instance1, instance2) {
  new chai.Assertion(instance1).to.deepEqualInstance(instance2);
}
