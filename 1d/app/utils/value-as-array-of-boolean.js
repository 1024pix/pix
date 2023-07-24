import flow from 'lodash/fp/flow';
import split from 'lodash/fp/split';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import sortBy from 'lodash/fp/sortBy';
import isString from 'lodash/isString';
import trim from 'lodash/trim';
import compact from 'lodash/fp/compact';
import sortedUniq from 'lodash/fp/sortedUniq';
import last from 'lodash/last';

export default function valueAsArrayOfBoolean(value, length) {
  return flow(
    // in the worst case : ',4, 2 , 2,1,  ,-1'
    (e) => (isString(e) ? e : ''), // check if string
    split(','), // now ['', '4', ' 2 ', ' 2', '1', '  ', '','-1']
    map(trim), // now ['', '4', '2', '2', '1', '', '','-1']
    compact, // now ['4', '2', '2', '1','-1']
    map(parseInt), // now [4, 2, 2, 1,-1]
    filter((e) => e >= 1), // check if int >= 1
    sortBy((_) => _), // now [1, 2, 2, 4]
    sortedUniq, // now [1, 2, 4]
    map((e) => e - 1), // now [0, 1, 3]
    (e) => Array.from({ length: length ?? last(e) + 1 }, (_, i) => e.includes(i)), // now [true, true, false, true]
  )(value);
}
