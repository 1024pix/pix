import { expect } from '../test-helper.js';
import { employeeReport } from './exercice1.js';

describe.only('Exercice 1 | Unit', function () {
  it('should give all employee +18 yo', async function () {
    // given
    const employees = [
      { name: 'Max', age: 17 },
      { name: 'Sepp', age: 18 },
      { name: 'Nina', age: 15 },
      { name: 'Mike', age: 51 },
    ];
    // when
    const result = employeeReport(employees);
    // then
    expect(result.length).to.equal(2);
    expect(result.every((item) => item.age >= 18)).to.be.true;
  });

  it('should order employee by name asc', async function () {
    // given
    const employees = [
      { name: 'Max', age: 99 },
      { name: 'Sepp', age: 18 },
      { name: 'Nina', age: 15 },
      { name: 'Mike', age: 51 },
    ];
    // when
    const result = employeeReport(employees);

    // then
    expect(result[0].name.localeCompare('Max', undefined, { sensitivity: 'base' })).to.equal(0);
    expect(result[1].name.localeCompare('Mike', undefined, { sensitivity: 'base' })).to.equal(0);
    expect(result[2].name.localeCompare('Sepp', undefined, { sensitivity: 'base' })).to.equal(0);
  });

  it('should uppercase name', async function () {
    // given
    const employees = [
      { name: 'alex', age: 99 },
      { name: 'Paul', age: 12 },
      { name: 'max', age: 15 },
      { name: 'tony', age: 51 },
    ];
    // when
    const result = employeeReport(employees);

    // then
    expect(result[0].name).to.equal('ALEX');
    expect(result[1].name).to.equal('TONY');
  });
});
