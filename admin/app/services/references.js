import Service from '@ember/service';

export default class ReferencesService extends Service {
  get availableLanguages() {
    return [
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'Anglais' },
    ];
  }

  get availableLocales() {
    return [
      { value: 'en', label: 'en' },
      { value: 'fr', label: 'fr' },
      { value: 'fr-BE', label: 'fr-BE' },
      { value: 'fr-FR', label: 'fr-FR' },
    ];
  }
}
