import { ModelStatic, Model } from 'sequelize';

export interface Models {
	Tweet: ModelStatic<Model>;
	User: ModelStatic<Model>;
}
