import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';

import { IModelData } from '../interfaces/IModelData';
import { ConnectionType, EdgeType } from '../pagination/relaySpecs';

@ObjectType({ description: 'The Product model', implements: IModelData })
@Entity()
export class Product extends IModelData {
  @Field({ nullable: true })
  @Column({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  price?: Number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  stockQuantity?: Number;
}

@ObjectType()
export class ProductEdge extends EdgeType('Product', Product) { }

@ObjectType()
export class ProductConnection extends ConnectionType<ProductEdge>('Product', ProductEdge) { }
