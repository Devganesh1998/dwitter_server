import { Model, Optional } from 'sequelize';

export interface HashTagUserAttributes {
    hashtagUserId: string;
    userId?: string;
    hashtag?: string;
}

export type HashTagUserCreationAttributes = Optional<HashTagUserAttributes, 'hashtagUserId'>;

export interface HashTagUserInstance
    extends Model<HashTagUserAttributes, HashTagUserCreationAttributes>,
        HashTagUserAttributes {
    createdAt: Date;
    updatedAt: Date;
}
