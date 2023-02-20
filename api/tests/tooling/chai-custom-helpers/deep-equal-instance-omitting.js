import _ from 'lodash';

export default function (chai, _utils) {
  chai.Assertion.addMethod('deepEqualInstanceOmitting', function (referenceInstance, omittedAttributes) {
    const assertedInstance = this._obj;

    _assertAreSameType(chai, assertedInstance, referenceInstance);
    _assertHaveSameContent(chai, assertedInstance, referenceInstance, omittedAttributes);
  });
}

function _assertAreSameType(chai, value1, value2) {
  const instanceClassName1 = value1.constructor.name;
  const instanceClassName2 = value2.constructor.name;
  new chai.Assertion(instanceClassName1).to.equal(instanceClassName2);
}

function _assertHaveSameContent(chai, value1, value2, omittedAttributes) {
  new chai.Assertion(_.omit(value1, omittedAttributes)).to.deep.equal(_.omit(value2, omittedAttributes));
}
