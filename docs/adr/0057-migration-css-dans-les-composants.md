# 57. Migration des fichiers CSS dans le dossier des composants

Date : 2024-11-20

## État

Validée

## Contexte

Le paradigme d’Ember impose de séparer tous les fichiers (controllers, templates, styles) en gardant la même arborescence pour s’y retrouver.

Exemple :
```
|-- app
| |-- components
| | |-- monComposant.hbs
| |-- styles
| | |-- app.scss
| | |-- components
| |   |-- monComposant.scss
```

Dans le cas des styles, c'est parfois laborieux de retrouver le fichier correspondant au composant sur lequel on travaille.
suggestion

La colocalisation des fichiers ou l'intégration du CSS dans un même fichier dans la majorité des frameworks permet une DX (developer experience) plus agréable.

Exemple :
```
|-- app
| |-- components
| | |-- monComposant.jsx
| | |-- monComposant.scss
```

L'apparition [des fichiers en .gjs chez Ember](https://rfcs.emberjs.com/id/0779-first-class-component-templates) nous laisse penser que les évolutions du framework vont s'orienter de plus en plus vers ce paradigme, bien que le CSS ne soit pas encore inclus dans leur fichier.

## Solution

Mettre les fichiers `.[s]css` de chaque composant dans le dossier des composants.

Pour le moment, tant que la core team Ember n'a pas décidé d'une approche, il sera sûrement plus sécurisé de garder les styles globaux dans le dossier `styles`.

Exemple :
```
// PixAdmin

|-- app
| |-- components
| | |-- certification-centers
| | | |-- information.gjs
| | | |-- information.scss
| | | |-- membership-item.gjs
| | | |-- membership-item.scss
```

### Mise en oeuvre

Le build du CSS se fait dans le fichier `ember-cli-build.js`, à la racine du projet : [https://cli.emberjs.com/release/advanced-use/stylesheets/](Stylesheet compilation - Advanced use - Ember CLI Guides)

La compilation se fait avec le package : [ember-cli-sass]https://www.npmjs.com/package/ember-cli-sass)
Ce package nous permet de gérer les paths à inclure pour compiler les fichiers `scss`.

Pour mettre les fichiers de style avec les composants, il suffit d'ajouter le path vers les composants dans `ember-cli-build.js`.

```javascript
const app = new EmberApp(defaults, {
  sassOptions: {
    includePaths: ['node_modules/@1024pix/pix-ui/addon/styles', 'node_modules/flatpickr/dist', 'app/components'],
  }
})
```

Rien d'autre.

Exemple avec la PR suivante : [[TECH] : bouger le fichier nav.scss du dossier globals vers le dossier composants](https://github.com/1024pix/pix/pull/9992)

### Avantages
- Très simple à mettre en place
- Pour un composant donné, les styles sont plus faciles à retrouver et à maintenir

### Inconvénients
- On est hors du paradigme d’Ember, risque de problèmes futurs inattendus
- Les styles globaux restent dans le dossier "styles", pour éviter d'éventuels effets de bord au build (pour le moment, tout est OK)

