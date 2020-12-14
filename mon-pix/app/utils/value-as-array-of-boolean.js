import flow from 'lodash/fp/flow';
import thru from 'lodash/fp/thru';
import split from 'lodash/fp/split';
import map from 'lodash/fp/map';
import reject from 'lodash/fp/reject';
import filter from 'lodash/fp/filter';
import sortBy from 'lodash/fp/sortBy';
import uniqBy from 'lodash/fp/uniqBy';
import times from 'lodash/times';
import max from 'lodash/max';
import includes from 'lodash/includes';
import isString from 'lodash/isString';
import trim from 'lodash/trim';
import identity from 'lodash/identity';
import isEmpty from 'lodash/isEmpty';

export default flow( // in the worst case : ',4, 2 , 2,1,  ,-1'
  thru((e) => isString(e) ? e : ''), // check if string
  split(','), // now ['', '4', ' 2 ', ' 2', '1', '  ', '','-1']
  map(trim), // now ['', '4', '2', '2', '1', '', '','-1']
  reject(isEmpty), // now ['4', '2', '2', '1','-1']
  map(parseInt), // now [4, 2, 2, 1,-1]
  filter((e) => e >= 1), // check if int >= 1
  sortBy(identity), // now [1, 2, 2, 4]
  uniqBy(identity), // now [1, 2, 4]
  map((e) => e - 1), // now [0, 1, 3]
  thru((e) => times(max(e) + 1, (o) => includes(e, o))), // now [true, true, false, true]
);
