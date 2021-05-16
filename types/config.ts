/* eslint-disable @typescript-eslint/naming-convention */
import { Dialect } from 'sequelize';

export type ACCOUNT_TYPE = 'TRAIL' | 'PAID' | 'ADMIN';

export type ACCOUNT_STATUS = 'ENABLED' | 'DISABLED' | 'SUSPENDED';

export type USER_TYPE = 'INTERNAL' | 'EXTERNAL';

export type GENDER = 'MALE' | 'FEMALE' | 'OTHERS';

export type ConfigType = {
	database: string;
	url: string;
	dialect: Dialect;
};

export interface ConfigInterface {
	development: ConfigType;
	production: ConfigType;
}
