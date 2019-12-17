import Component from '@ember/component';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';

const SelectOption = EmberObject.extend({

  value: '',
  label: '',
  disabled: false

});

const adminOption = SelectOption.create({ value: 'ADMIN', label: 'Administrateur', disabled: false });

const memberOption = SelectOption.create({ value: 'MEMBER', label: 'Membre', disabled: false });

export default Component.extend({

  tagName: 'tr',

  currentUser: service(),
  organizationRoles: null,
  isEditionMode: false,
  selectedNewRole: null,
  currentRole: null,

  init() {
    this._super(...arguments);
    this.organizationRoles = [adminOption, memberOption];
  },

  actions: {

    setRoleSelection: function(selected) {
      this.set('selectedNewRole', selected);
      this.set('isEditionMode', true);
    },

    editRoleOfMember: function(membership) {
      this.set('selectedNewRole', null);
      this.set('currentRole', membership.displayRole);
      this.set('isEditionMode', true);

    },

    updateRoleOfMember: function(membership) {
      this.set('isEditionMode', false);

      if (null === this.get('selectedNewRole')) return false;

      membership.set('displayRole', this.get('selectedNewRole.label'));
      membership.set('organizationRole', this.get('selectedNewRole.value'));

      return membership.save();
    },

    cancelUpdateRoleOfMember: function() {
      this.set('isEditionMode', false);
      this._clearState();
    },
  },

  _clearState() {
    this.set('selectedNewRole', null);
    this.set('currentRole', null);
  }

});
