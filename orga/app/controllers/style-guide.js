import { inject as service } from '@ember/service';
import FreestyleController from 'ember-freestyle/controllers/freestyle';

const colorPalette = {
  'porcelain': { 'name': 'porcelain', 'base': '#f2f3f4' },
  'wild-sand': { 'name': 'wild-sand', 'base': '#f5f5f5' },
  'aqua': { 'name': 'aqua', 'base': '#388AFF' },
  'dodger-blue': { 'name': 'dodger-blue', 'base': '#3D68FF' },
  'heliotrope': { 'name': 'heliotrope', 'base': '#985FFF' },
  'mariner': { 'name': 'mariner', 'base': '#355BD1' },
  'denim': { 'name': 'denim', 'base': '#0D7DC4' },
  'astronaut': { 'name': 'astronaut', 'base': '#213371' },
};

const textColorPalette = {
  'alto': { 'name': 'alto', 'base': '#DDDDDD' },
  'dusty-gray': { 'name': 'dusty-gray', 'base': '#999999' },
  'dove-gray': { 'name': 'dove-gray', 'base': '#666666' },
  'tundora': { 'name': 'tundora', 'base': '#444444' },
  'nero': { 'name': 'nero', 'base': '#222222' },
};

const gradientPalette = {
  'blue-purple-gradient': { 'name': 'blue-purple-gradient', 'base': 'none;background:linear-gradient(135.25deg, #3D68FF 0%, #985FFF 100%)' },
  'denim-gradient': { 'name': 'denim-gradient', 'base': 'none;background:linear-gradient(0deg, #0D7DC4 0%, #213371 100%)' },
};

const campaignTest = {
  name: 'Campagne de test',
};
export default class StyleGuideController extends FreestyleController {
  @service emberFreestyle;

  colorPalette = colorPalette;
  textColorPalette = textColorPalette;
  gradientPalette = gradientPalette;
  campaignTest = campaignTest;
}
