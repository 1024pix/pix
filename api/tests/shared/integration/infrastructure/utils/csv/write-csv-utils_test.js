import { CsvParsingError } from '../../../../../../src/shared/domain/errors.js';
import { getCsvContent } from '../../../../../../src/shared/infrastructure/utils/csv/write-csv-utils.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Utils | csv | write-csv-utils', function () {
  it('should return a csv content according to fileHeaders data', async function () {
    // given
    const data = {
      firstName: 'Julie',
      lastName: 'Dupont',
      competenceWithMarks: [
        {
          1.1: 0,
        },
        {
          1.2: 2,
        },
      ],
    };
    const fileHeaders = ['firstName', 'competenceWithMarks'];

    // when
    const result = await getCsvContent({ data, fileHeaders });

    // then
    const expectedResult = '\uFEFF' + '"firstName";"competenceWithMarks"\n' + '"Julie";"[{""1.1"":0},{""1.2"":2}]"';
    expect(result).to.deep.equal(expectedResult);
  });

  it('should throw an error if data is not json', async function () {
    // given
    const data = undefined;

    // when
    const result = await catchErr(getCsvContent)({ data });

    // then
    expect(result).to.be.instanceOf(CsvParsingError);
  });

  it('should throw an error if fileHeaders is not an array', async function () {
    // given
    const data = { firstName: 'Lili' };
    const fileHeaders = 1234;

    // when
    const result = await catchErr(getCsvContent)({ data, fileHeaders });

    // then
    expect(result).to.be.instanceOf(CsvParsingError);
  });
});
