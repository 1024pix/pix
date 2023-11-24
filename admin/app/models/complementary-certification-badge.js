import Model, { attr, belongsTo } from '@ember-data/model';

export default class ComplementaryCertificationBadge extends Model {
  @belongsTo('complementary-certification') complementaryCertification;

  @attr('number') badgeId;
  @attr('number') level;
  @attr('number') minimumEarnedPix;
  @attr('string') imageUrl;
  @attr('string') label;
  @attr('string') certificateMessage;
  @attr('string') temporaryCertificateMessage;
  @attr('string') stickerUrl;
}
