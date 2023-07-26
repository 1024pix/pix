import PresenceBase from 'ember-cp-validations/validators/presence';

const Presence = PresenceBase.extend({
  validate(value, options, model, attribute) {
    if (options.allowNone && value == null) return true;
    return this._super(value, options, model, attribute);
  },
});

export default Presence;
