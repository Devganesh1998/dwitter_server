import { Model, Optional } from 'sequelize';

export interface HashTagAttributes {
    hashtag: string;
    description: string;
    category: string;
    followersCount?: number;
    createdBy?: string;
}

export type HashTagCreationAttributes = Optional<HashTagAttributes, 'hashtag'>;

export interface HashTagInstance
    extends Model<HashTagAttributes, HashTagCreationAttributes>,
        HashTagAttributes {
    createdAt: Date;
    updatedAt: Date;
}
