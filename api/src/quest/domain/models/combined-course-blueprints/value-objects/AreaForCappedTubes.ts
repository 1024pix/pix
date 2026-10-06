type Tube = {
  id: string;
  level: number;
  name: string;
  practicalTitle: string;
};

type Thematic = {
  id: string;
  name: string;
  index: string;
  tubes: Tube[];
};

type Competence = {
  id: string;
  name: string;
  index: string;
  thematics: Thematic[];
};

export type AreaForCappedTubesArgs = {
  id: string;
  title: string;
  code: string;
  color: string;
  competences: Competence[];
};

export class AreaForCappedTubes {
  id: string;
  title: string;
  code: string;
  color: string;
  competences: Competence[];

  constructor({ id, title, code, color, competences }: AreaForCappedTubesArgs) {
    this.id = id;
    this.title = title;
    this.code = code;
    this.color = color;
    this.competences = competences;
  }
}
