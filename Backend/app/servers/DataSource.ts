import { env } from 'process';
import { DataSource } from 'typeorm';
import { AuditLogin } from '../graphql/models/AuditLogin';
import { Menu } from '../graphql/models/Menu';
import { MenuItem } from '../graphql/models/MenuItem';
import { Module } from '../graphql/models/Module';
import { Product } from '../graphql/models/Product';
import { Role } from '../graphql/models/Role';

import { User } from '../graphql/models/User';

export const dataSource = new DataSource({
  type: 'mongodb',
  url: env.DATABASE_URL_TYPE_ORM,
  authSource: 'admin',
  entities: [
    User,
    Menu,
    MenuItem,
    Module,
    Role,
    AuditLogin,
    Product
  ],
  synchronize: true,
  logger: 'advanced-console',
  logging: 'all',
  dropSchema: false,
  cache: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //connectTimeoutMS: 50000,
  //socketTimeoutMS: 50000,
});

export const UserRepository = dataSource.getMongoRepository(User);
export const MenuRepository = dataSource.getMongoRepository(Menu);
export const MenuItemRepository = dataSource.getMongoRepository(MenuItem);
export const ModuleRepository = dataSource.getMongoRepository(Module);
export const RoleRepository = dataSource.getMongoRepository(Role);
export const AuditLoginRepository = dataSource.getMongoRepository(AuditLogin);
export const ProductRepository = dataSource.getMongoRepository(Product);