/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';
import * as SequelizeStatic from 'sequelize';
import { Sequelize, DataTypes } from 'sequelize';
import { UserInstance, UserCreationAttributes } from './interfaces/User';
import configFac, { ConfigInterface } from '../config/config';

const env = process.env.NODE_ENV || 'development';
export interface SequelizeModels {
	Product: SequelizeStatic.Model<UserInstance, UserCreationAttributes>;
}

class Database {
	private _basename: string;

	private _models: SequelizeModels;

	private _sequelize: Sequelize;

	constructor() {
		this._basename = path.basename(module.filename);
		const config = configFac[env as keyof ConfigInterface];

		this._sequelize = new SequelizeStatic.Sequelize(config.url, config);
		this._models = {} as any;

		fs.readdirSync(__dirname)
			.filter((file: string) => file !== this._basename && file !== 'interfaces')
			.forEach((file: string) => {
				(async () => {
					const { default: modelCons } = await import(path.join(__dirname, file));
					const model = modelCons(this._sequelize, DataTypes);
					this._models[(model as any).name] = model;
				})();
			});

		Object.keys(this._models).forEach((modelName: string) => {
			if (typeof this._models[modelName].associate === 'function') {
				this._models[modelName].associate(this._models);
			}
		});
	}

	getModels() {
		return this._models;
	}

	getSequelize() {
		return this._sequelize;
	}
}

const database = new Database();
export const models = database.getModels();
export const db = database.getSequelize();
