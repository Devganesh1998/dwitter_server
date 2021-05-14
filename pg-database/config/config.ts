type configType = {
	database: string;
	url: string;
};

export interface configInterface {
	development: configType;
	production: configType;
}

const config: configInterface = {
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
