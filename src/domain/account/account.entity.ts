import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Account extends BaseEntity {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ nullable: true })
  password?: string;
}
