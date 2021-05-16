import { ConfigInterface } from '../../types';

const config: ConfigInterface = {
	development: {
		database: 'dwitter',
		url: process.env.DEV_DATABASE_URL || '',
		dialect: 'postgres',
	},
	production: {
		database: 'dwitter',
		url: process.env.PROD_DATABASE_URL || '',
		dialect: 'postgres',
	},
};

export = config;
