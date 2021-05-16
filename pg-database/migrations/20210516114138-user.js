/* eslint-disable */
// @ts-nocheck
export const ACCOUNT_TYPE = {
	TRAIL: 'TRAIL',
	PAID: 'PAID',
	ADMIN: 'ADMIN',
};

export const ACCOUNT_STATUS = {
	ENABLED: 'ENABLED',
	DISABLED: 'DISABLED',
	SUSPENDED: 'SUSPENDED',
};

export const USER_TYPE = {
	INTERNAL: 'INTERNAL',
	EXTERNAL: 'EXTERNAL',
};

export const GENDER = {
	MALE: 'MALE',
	FEMALE: 'FEMALE',
	OTHERS: 'OTHERS',
};

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('users', {
			userId: {
				primaryKey: true,
				type: Sequelize.UUID,
				allowNull: false,
				validate: { isUUID: 4 },
				defaultValue: Sequelize.UUIDV4,
			},
			name: {
				type: Sequelize.STRING,
			},
			phoneNo: {
				type: Sequelize.INTEGER,
				unique: true,
			},
			age: {
				type: Sequelize.INTEGER,
			},
			followersCount: {
				type: Sequelize.BIGINT({ unsigned: true }),
				defaultValue: 0,
			},
			followingCount: {
				type: Sequelize.BIGINT({ unsigned: true }),
				defaultValue: 0,
			},
			dateOfBirth: {
				type: Sequelize.DATEONLY,
			},
			countryCode: {
				type: Sequelize.STRING(20),
			},
			description: {
				type: Sequelize.TEXT({ length: 'medium' }),
				defaultValue: '',
			},
			profileImgUrl: {
				type: Sequelize.TEXT({ length: 'medium' }),
				validate: { isUrl: true },
				defaultValue:
					'https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png',
			},
			posterImgUrl: {
				type: Sequelize.TEXT({ length: 'medium' }),
				validate: { isUrl: true },
				defaultValue:
					'https://fastcode.space/wp-content/uploads/2019/11/Starry-Glamour-Dream-Earth-Beautiful-Purple-Blue-Gradient-Background-Poster-Illustration-0.jpg',
			},
			userName: {
				unique: true,
				type: Sequelize.STRING,
			},
			gender: {
				type: Sequelize.ENUM(...Object.keys(GENDER)),
			},
			email: {
				unique: true,
				type: Sequelize.STRING,
				validate: { isEmail: true },
			},
			accountType: {
				allowNull: false,
				type: Sequelize.ENUM(...Object.keys(ACCOUNT_TYPE)),
				defaultValue: ACCOUNT_TYPE.TRAIL,
			},
			accountStatus: {
				allowNull: false,
				type: Sequelize.ENUM(...Object.keys(ACCOUNT_STATUS)),
				defaultValue: ACCOUNT_STATUS.ENABLED,
			},
			userType: {
				allowNull: false,
				type: Sequelize.ENUM(...Object.keys(USER_TYPE)),
				defaultValue: USER_TYPE.EXTERNAL,
			},
			password: {
				allowNull: false,
				type: Sequelize.TEXT({ length: 'medium' }),
			},
			isVerified: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('users');
	},
};
