import { connectionFromArraySlice } from 'graphql-relay';
import { ObjectId } from 'mongodb';
import { Arg, Args, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { MenuItemRepository, MenuRepository, ModuleRepository, RoleRepository, UserRepository } from '../../servers/DataSource';
import { removeEmptyStringElements } from '../../types';
import { NewMenuItem } from '../inputs/NewMenuItem';
import { IContext } from '../interfaces/IContext';
import { Menu } from '../models/Menu';
import { MenuItem, MenuItemConnection } from '../models/MenuItem';
import { Module } from '../models/Module';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { ConnectionArgs } from '../pagination/relaySpecs';


@Resolver(MenuItem)
export class MenuItemResolver {
  @InjectRepository(MenuItem)
  private repository = MenuItemRepository;

  @InjectRepository(Role)
  private repositoryRole = RoleRepository;

  @InjectRepository(User)
  private repositoryUser = UserRepository;

  @InjectRepository(Module)
  private repositoryModule = ModuleRepository;

  @InjectRepository(Menu)
  private repositoryMenu = MenuRepository;

  @Query(() => MenuItem, { nullable: true })
  async getMenuItem(@Arg('id', () => String) id: string) {
    const result = await this.repository.findOneBy(id);
    return result;
  }

  @Query(() => MenuItemConnection)
  async getAllMenuItem(
    @Args() args: ConnectionArgs,
    @Arg('allData', () => Boolean) allData: Boolean,
    @Arg('orderCreated', () => Boolean) orderCreated: Boolean,
    @Arg('menuId', () => String, { nullable: true }) menuId: String,
  ): Promise<MenuItemConnection> {
    let result;
    if (allData) {
      if (orderCreated) {
        if (menuId) {
          result = await this.repository.findBy({
            where: { menuId },
            order: { createdAt: 'DESC' },
          });
        } else {
          result = await this.repository.findBy({
            order: { createdAt: 'DESC' },
          });
        }
      } else {
        if (menuId) {
          result = await this.repository.findBy({ where: { menuId } });
        } else {
          result = await this.repository.find();
        }
      }
    } else {
      if (orderCreated) {
        if (menuId) {
          result = await this.repository.findBy({
            where: {
              menuId,
              active: true,
            },
            order: { createdAt: 'DESC' },
          });
        } else {
          result = await this.repository.findBy({
            where: {
              active: true,
            },
            order: { createdAt: 'DESC' },
          });
        }
      } else {
        if (menuId) {
          result = await this.repository.findBy({
            where: {
              menuId,
              active: true,
            },
          });
        } else {
          result = await this.repository.findBy({
            where: {
              active: true,
            },
          });
        }
      }
    }
    let resultConn = new MenuItemConnection();
    let resultConnection = connectionFromArraySlice(result, args, {
      sliceStart: 0,
      arrayLength: result.length,
    });
    resultConn = { ...resultConnection, totalCount: result.length };
    return resultConn;
  }

  @Mutation(() => MenuItem)
  async createMenuItem(
    @Arg('data') data: NewMenuItem,
    @Ctx() context: IContext
  ): Promise<MenuItem> {
    let dataProcess: NewMenuItem = removeEmptyStringElements(data);
    let createdByUserId = context?.user?.authorization?.id;
    const model = await this.repository.create({
      ...dataProcess,
      active: true,
      version: 0,
      createdByUserId,
    });
    let result = await this.repository.save(model);
    return result;
  }

  @Mutation(() => MenuItem)
  async updateMenuItem(
    @Arg('data') data: NewMenuItem,
    @Arg('id', () => String) id: string,
    @Ctx() context: IContext
  ): Promise<MenuItem | null> {
    let dataProcess = removeEmptyStringElements(data);
    let updatedByUserId = context?.user?.authorization?.id;
    let result = await this.repository.findOneBy(id);
    result = await this.repository.save({
      _id: new ObjectId(id),
      ...result,
      ...dataProcess,
      version: (result?.version as number) + 1,
      updatedByUserId,
    });
    return result;
  }

  @Mutation(() => Boolean)
  async changeActiveMenuItem(
    @Arg('active', () => Boolean) active: boolean,
    @Arg('id', () => String) id: string,
    @Ctx() context: IContext
  ): Promise<Boolean | null> {
    let updatedByUserId = context?.user?.authorization?.id;
    let result = await this.repository.findOneBy(id);
    result = await this.repository.save({
      _id: new ObjectId(id),
      ...result,
      active: active,
      version: (result?.version as number) + 1,
      updatedByUserId,
    });
    if (result.id) {
      return true;
    } else {
      return false;
    }
  }

  @Mutation(() => Boolean)
  async deleteMenuItem(
    @Arg('id', () => String) id: string,
    @Ctx() context: IContext
  ): Promise<Boolean | null> {
    let data = await this.repository.findOneBy(id);
    let result = await this.repository.deleteOne({ _id: new ObjectId(id) });
    return result?.result?.ok === 1 ?? true;
  }

  @FieldResolver((_type: any) => User, { nullable: true })
  async createdByUser(@Root() data: MenuItem) {
    let id = data.createdByUserId;
    if (id !== null && id !== undefined) {
      const result = await this.repositoryUser.findOneBy(id);
      return result;
    }
    return null;
  }

  @FieldResolver((_type: any) => User, { nullable: true })
  async updatedByUser(@Root() data: MenuItem) {
    let id = data.updatedByUserId;
    if (id !== null && id !== undefined) {
      const result = await this.repositoryUser.findOneBy(id);
      return result;
    }
    return null;
  }

  @FieldResolver((_type: any) => Menu, { nullable: true })
  async menu(@Root() data: MenuItem) {
    let id = data.menuId;
    if (id !== null && id !== undefined) {
      const result = await this.repositoryMenu.findOneBy(id);
      return result;
    }
    return null;
  }

  @FieldResolver((_type: any) => Module, { nullable: true })
  async module(@Root() data: MenuItem) {
    let id = data.moduleId;
    if (id !== null && id !== undefined) {
      const result = await this.repositoryModule.findOneBy(id);
      return result;
    }
    return null;
  }

  @FieldResolver((_type: any) => [Role], { nullable: true })
  async roles(@Root() data: MenuItem) {
    let ids = data.rolesId;
    if (ids !== null && ids !== undefined) {
      let dataIds: any[] = [];
      ids.forEach(async (id: any) => {
        dataIds.push(new ObjectId(id));
      });
      const result = await this.repositoryRole.findBy({ where: { _id: { $in: dataIds } } });
      return result;
    }
    return null;
  }
}
