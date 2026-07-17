import { load } from 'js-yaml';

export default function answersAsObject(answer, inputKeys) {
  if (answer === '#ABAND#') {
    return inputKeys.reduce((answersObject, key) => {
      answersObject[key] = '';
      return answersObject;
    }, {});
  }
  return load(answer);
}
