import Service from '@ember/service';

export default class ReferencesService extends Service {
  get availableLanguages() {
    return [
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'Anglais' },
    ];
  }
}
