import { Assertion } from 'chai';
export function equalWithGetter() {
  Assertion.addMethod('equalWithGetter', function (expectedElement) {
    if (Array.isArray(expectedElement)) {
      expectedElement.forEach((element, index) => {
        expect(this._obj[index]).equalWithGetter(element);
      });
    } else {
      Object.keys(expectedElement).forEach((property) => {
        if (Array.isArray(expectedElement[property])) {
          expectedElement[property].forEach((subelement, index) => {
            expect(this._obj[property][index]).equalWithGetter(subelement);
          });
        } else {
          const errorMessage = `expect ${this._obj} with key ${property} to equal ${expectedElement[property]} (found ${this._obj[property]})`;
          new Assertion(this._obj[property], errorMessage).to.deep.equal(expectedElement[property]);
        }
      });
    }
  });
}
