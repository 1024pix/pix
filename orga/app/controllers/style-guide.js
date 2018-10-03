import Ember from 'ember';
import FreestyleController from 'ember-freestyle/controllers/freestyle';

const { inject } = Ember;

export default FreestyleController.extend({
  emberFreestyle: inject.service(),

  colorPalette: {
    'porcelain': { 'name': 'porcelain', 'base': '#f2f3f4' },
    'wild-sand': { 'name': 'wild-sand', 'base': '#f5f5f5' },
    'aqua': { 'name': 'aqua', 'base': '#388AFF' },
    'dodger-blue': { 'name': 'dodger-blue', 'base': '#3D68FF' },
    'heliotrope': { 'name': 'heliotrope', 'base': '#985FFF' },
    'mariner': { 'name': 'mariner', 'base': '#355BD1' },
    'denim': { 'name': 'denim', 'base': '#0D7DC4' },
    'astronaut': { 'name': 'astronaut', 'base': '#213371' },
  }
});
