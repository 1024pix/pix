import { Assertion } from 'chai';
export function exactlyContain() {
  Assertion.addMethod('exactlyContain', function (expectedElements) {
    const errorMessage = `expect [${this._obj}] to exactly contain [${expectedElements}]`;
    new Assertion(this._obj, errorMessage).to.deep.have.members(expectedElements);
  });
}
