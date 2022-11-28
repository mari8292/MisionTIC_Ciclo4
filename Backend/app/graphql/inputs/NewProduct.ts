import { Field, InputType } from 'type-graphql';

import { Product } from '../models/Product';

@InputType()
export class NewProduct implements Partial<Product> {
  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  price?: Number;

  @Field({ nullable: true })
  stockQuantity?: Number;
}
