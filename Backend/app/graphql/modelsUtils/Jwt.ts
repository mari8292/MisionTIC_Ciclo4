import { Field, ObjectType } from 'type-graphql';
import { Menu } from '../models/Menu';
import { Role } from '../models/Role';

@ObjectType({ description: 'The User model' })
export class Jwt {
  @Field({ nullable: true })
  jwt?: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  profilePhoto?: string;

  @Field({ nullable: true })
  role?: Role;

  @Field((_type: any) => [Menu], { nullable: true })
  roleMenus?: [Menu];
}
