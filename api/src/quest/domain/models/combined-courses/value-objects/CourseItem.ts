import type { CourseItemType } from '../../../constant-types.d.ts';

type CourseItemCompetence = {
  id: string;
  name: string;
  index: string;
};

type CourseItemArea = {
  id: string;
  code: string;
  title: string;
  color: string;
  competences: CourseItemCompetence[];
};

export type CourseItemArgs = {
  id: string;
  sourceId: number;
  name: string;
  type: CourseItemType;
  nbTubes?: number | null;
  nbModules?: number | null;
  category?: string | null;
  isSimplifiedAccess?: boolean | null;
  areas?: CourseItemArea[];
  createdAt?: Date | null;
};

export class CourseItem {
  id: string;
  sourceId: number;
  createdAt: Date | null;
  name: string;
  type: CourseItemType;
  nbTubes: number | null;
  nbModules: number | null;
  category: string | null;
  isSimplifiedAccess: boolean | null;
  areas: CourseItemArea[];

  constructor({
    id,
    sourceId,
    name,
    type,
    nbTubes,
    nbModules,
    category,
    isSimplifiedAccess,
    areas,
    createdAt,
  }: CourseItemArgs) {
    this.id = id;
    this.sourceId = sourceId;
    this.createdAt = createdAt ?? null;
    this.name = name;
    this.type = type;
    this.nbTubes = nbTubes ?? null;
    this.nbModules = nbModules ?? null;
    this.category = category ?? null;
    this.isSimplifiedAccess = isSimplifiedAccess ?? null;
    this.areas = areas ?? [];
  }
}
