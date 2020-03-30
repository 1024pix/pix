import classic from 'ember-classic-decorator';
import Transform from '@ember-data/serializer/transform';

@classic
export default class DateOnly extends Transform {
  serialize(date) {
    return date;
  }

  deserialize(date) {
    const dateRegex = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';
    if (date && date.search(dateRegex) === 0) {
      return date;
    }
    return null;
  }
}
