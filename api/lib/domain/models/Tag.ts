type TagAttributes = {
  id: number;
  name: string;
}

export class Tag {
  id: number;
  name: string;
  static AGRICULTURE = 'AGRICULTURE';
  static POLE_EMPLOI = 'POLE EMPLOI';
  static MEDIATION_NUMERIQUE = 'MEDNUM';
  static CFA = 'CFA';
  static AEFE = 'AEFE';
  static MLF = 'MLF';

  constructor({ id, name }: TagAttributes) {
    this.id = id;
    this.name = name;
  }
}
