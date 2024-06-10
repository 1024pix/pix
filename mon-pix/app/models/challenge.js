/* eslint ember/no-computed-properties-in-native-classes: 0 */

import { computed } from '@ember/object';
import { equal, gt, notEmpty } from '@ember/object/computed';
import Model, { attr, belongsTo } from '@ember-data/model';

export default class Challenge extends Model {
  // attributes
  @attr('array') attachments;
  @attr('array') locales;
  @attr('string') embedUrl;
  @attr('string') embedTitle;
  @attr('string') embedHeight;
  @attr('string') format;
  @attr('string') illustrationAlt;
  @attr('string') illustrationUrl;
  @attr('string') instruction;
  @attr('string') alternativeInstruction;
  @attr('string') proposals;
  @attr('number') timer;
  @attr('string') type;
  @attr('boolean') autoReply;
  @attr('boolean') focused;
  @attr('boolean') shuffled;

  // includes
  @belongsTo('answer', { async: false, inverse: 'challenge' }) answer;

  // methods
  @computed('embedUrl', 'embedTitle', 'embedHeight')
  get hasValidEmbedDocument() {
    const embedUrl = this.embedUrl;
    return !!embedUrl && !!this.embedTitle && !!this.embedHeight && embedUrl.toLowerCase().indexOf('https://') === 0; // fixes bug on IE: startsWith in not supported (PR #242)
  }

  @equal('attachments.length', 1) hasSingleAttachment;

  @gt('attachments.length', 1) hasMultipleAttachments;

  @notEmpty('attachments') hasAttachment;
  @notEmpty('timer') hasTimer;
}
