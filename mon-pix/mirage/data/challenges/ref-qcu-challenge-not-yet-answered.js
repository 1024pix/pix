// QCM challenge with all field filled
export default {
  data: {
    type: 'challenge',
    id: 'ref_qcu_challenge_id_not_yet_answered',
    attributes: {
      type: 'QCU',
      'illustration-url': 'http://fakeimg.pl/350x200/?text=QCU',
      attachments: ['file.docx', 'file.odt'],
      instruction: 'Un QCU propose plusieurs choix, l\'utilisateur peut en choisir [un seul](http://link.unseul.url)',
      proposals: '' +
        '- 1ere possibilite\n ' +
        '- 2eme possibilite\n ' +
        '- 3eme possibilite\n' +
        '- 4eme possibilite',
      'embed-url': 'https://1024pix.github.io/dessin.html',
      'embed-title': 'Notre premier embed',
      'embed-height': 600
    }
  }
};
