import Service from '@ember/service';

export default class ReferencesService extends Service {
  get availableLanguages() {
    return [
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'Anglais' },
      { value: 'nl', label: 'Néerlandais' },
      { value: 'es', label: 'Espagnol' },
    ];
  }

  get availableLocales() {
    return [
      { value: 'en', label: 'en' },
      { value: 'fr', label: 'fr' },
      { value: 'fr-BE', label: 'fr-BE' },
      { value: 'fr-FR', label: 'fr-FR' },
      { value: 'nl-BE', label: 'nl-BE' },
    ];
  }
}
