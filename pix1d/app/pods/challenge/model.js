/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr } from '@ember-data/model';

export default class Challenge extends Model {
  // attributes
  @attr('array') attachments;
  @attr('string') embedUrl;
  @attr('string') embedTitle;
  @attr('string') embedHeight;
  @attr('string') format;
  @attr('string', {
    defaultValue() {
      return '';
    },
  })
  illustrationAlt;
  @attr('string') illustrationUrl;
  @attr('string') instruction;
  @attr('string') alternativeInstruction;
  @attr('string') proposals;
  @attr('number') timer;
  @attr('string') type;
  @attr('boolean') autoReply;
  @attr('boolean') focused;
}
