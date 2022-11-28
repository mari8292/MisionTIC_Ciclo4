import * as Relay from 'graphql-relay';
import { ArgsType, ClassType, Field, ObjectType } from 'type-graphql';

@ArgsType()
export class ConnectionArgs implements Relay.ConnectionArguments {
  @Field((type: any) => String, {
    nullable: true,
    description: 'Paginate before opaque cursor',
  })
  before?: Relay.ConnectionCursor;

  @Field((type: any) => String, {
    nullable: true,
    description: 'Paginate after opaque cursor',
  })
  after?: Relay.ConnectionCursor;

  @Field((type: any) => Number, { nullable: true, description: 'Paginate first' })
  first?: number;

  @Field((type: any) => Number, { nullable: true, description: 'Paginate last' })
  last?: number;
}

type ExtractNodeType<EdgeType> = EdgeType extends Relay.Edge<infer NodeType> ? NodeType : never;

export function ConnectionType<
  EdgeType extends Relay.Edge<NodeType>,
  NodeType = ExtractNodeType<EdgeType>
>(nodeName: string, edgeClass: ClassType<EdgeType>) {
  @ObjectType(`${nodeName}Connection`, { isAbstract: true })
  abstract class Connection implements Relay.Connection<NodeType> {
    @Field((type: any) => PageInfo)
    pageInfo!: PageInfo;

    @Field((type: any) => [edgeClass])
    edges!: EdgeType[];

    @Field((type: any) => Number, { nullable: true, description: 'Total Count' })
    totalCount?: number;
  }

  return Connection;
}

export function EdgeType<NodeType>(nodeName: string, nodeType: ClassType<NodeType>) {
  @ObjectType(`${nodeName}Edge`, { isAbstract: true })
  abstract class Edge implements Relay.Edge<NodeType> {
    @Field((type: any) => nodeType)
    node!: NodeType;

    @Field((type: any) => String, {
      description: 'Used in `before` and `after` args',
    })
    cursor!: Relay.ConnectionCursor;
  }

  return Edge;
}

@ObjectType()
class PageInfo implements Relay.PageInfo {
  @Field((type: any) => Boolean)
  hasNextPage!: boolean;

  @Field((type: any) => Boolean)
  hasPreviousPage!: boolean;

  @Field((type: any) => String, { nullable: true })
  startCursor!: string | null;

  @Field((type: any) => String, { nullable: true })
  endCursor!: string | null;
}
