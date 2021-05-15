type ConfigType = {
	database: string;
	url: string;
};

export interface ConfigInterface {
	development: ConfigType;
	production: ConfigType;
}

const config: ConfigInterface = {
	development: {
		database: 'dwitter',
		url: process.env.DEV_DATABASE_URL || '',
	},
	production: {
		database: 'dwitter',
		url: process.env.PROD_DATABASE_URL || '',
	},
};

export default config;
