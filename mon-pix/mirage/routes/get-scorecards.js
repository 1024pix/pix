export default function(schema, request) {
  const userId = request.params.id;

  return {
    data: {
      type: 'scorecards',
      id: userId,
      'attributes': {
        'name': 'Keyboard',
        'index': '61',
        'course-id': '1',
        'skills': [
          {
            'id': '1',
            'name': 'Skill 1',
            'pixValue': 1,
            'competenceId': '5'
          },
          {
            'id': '2',
            'name': 'Skill 2',
            'pixValue': 3,
            'competenceId': '4'
          },
          {
            'id': '3',
            'name': 'Skill 3',
            'pixValue': 0,
            'competenceId': '1'
          }
        ],
        'earned-pix': '7',
        'level': '2',
        'percentage-on-level': '0.67'
      },
      'relationships': {
        'area': {
          'data': {
            'id': '1',
            'type': 'areas'
          }
        }
      }
    },
    'included': [
      {
        'attributes': {
          'code': 1,
          'title': 'Potions magiques'
        },
        'id': '1',
        'type': 'areas'
      }
    ]
  };
}
