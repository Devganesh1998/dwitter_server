import { Sequelize } from 'sequelize';
import configFac, { configInterface } from '../config/config';

const env = process.env.NODE_ENV || 'development';
const config = configFac[env as keyof configInterface];

const db = new Sequelize(config.url, config);

export { Sequelize, db };
