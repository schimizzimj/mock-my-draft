import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from './team';
import { SourceArticle } from './source-article';

@Entity('draft_class_grades')
export class DraftClassGrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, (team) => team.draftClassGrades)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(
    () => SourceArticle,
    (sourceArticle) => sourceArticle.draftClassGrades,
  )
  @JoinColumn({ name: 'source_article_id' })
  sourceArticle: SourceArticle;

  @Column()
  grade: string;

  @Column({ type: 'float' })
  gradeNumeric: number;

  @Column()
  year: number;

  @Column({ nullable: true })
  text?: string;

  @Column({ type: 'float', nullable: true })
  sentimentCompound?: number;

  @Column({ type: 'float', nullable: true })
  sentimentPositive?: number;

  @Column({ type: 'float', nullable: true })
  sentimentNegative?: number;

  @Column({ type: 'float', nullable: true })
  sentimentNeutral?: number;

  @Column({ type: 'jsonb', nullable: true })
  keywords?: Array<{ word: string; count: number }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
