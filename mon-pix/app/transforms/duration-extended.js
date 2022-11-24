import Transform from '@ember-data/serializer/transform';

export default class DurationExtendedTransform extends Transform {
  serialize(time) {
    return time;
  }

  deserialize(time) {
    const splitTime = time.split(':');
    let seconds = 0;

    if (splitTime.length > 0) {
      seconds += splitTime[0] * 60 * 60;
      seconds += splitTime[1] * 60;
      seconds += splitTime[2] * 1;
    }

    return seconds;
  }
}
