/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';
import * as SequelizeStatic from 'sequelize';
import { Sequelize, DataTypes } from 'sequelize';
import { Models } from './interfaces/common';
import configFac from '../config/config';
import { ConfigInterface } from '../../types';

const env = process.env.NODE_ENV || 'development';

class Database {
    private _basename: string;

    private _models: Models;

    private _sequelize: Sequelize;

    constructor() {
        this._basename = path.basename(module.filename);
        const config = configFac[env as keyof ConfigInterface];

        this._sequelize = new SequelizeStatic.Sequelize(config.url, config);
        this._models = {} as any;

        fs.readdirSync(__dirname)
            .filter((file: string) => file !== this._basename && file !== 'interfaces')
            .forEach((file: string) => {
                // eslint-disable-next-line global-require,import/no-dynamic-require,@typescript-eslint/no-var-requires
                const { default: modelCons } = require(path.join(__dirname, file));
                const model = modelCons(this._sequelize, DataTypes);
                this._models[(model as any).name] = model;
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
