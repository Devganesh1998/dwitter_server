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
				validate: { isUUID: 4 },
				defaultValue: Sequelize.UUIDV4,
			},
			name: {
				type: Sequelize.STRING,
			},
			phoneNo: {
				type: Sequelize.BIGINT,
				unique: true,
			},
			age: {
				type: Sequelize.INTEGER,
			},
			followersCount: {
				type: Sequelize.BIGINT,
				defaultValue: 0,
			},
			followingCount: {
				type: Sequelize.BIGINT,
				defaultValue: 0,
			},
			clientIp: {
				type: dataTypes.STRING,
			},
			dateOfBirth: {
				type: Sequelize.DATEONLY,
			},
			countryCode: {
				type: Sequelize.STRING(20),
			},
			description: {
				type: Sequelize.TEXT,
				defaultValue: '',
			},
			profileImgUrl: {
				type: Sequelize.TEXT,
				validate: { isUrl: true },
				defaultValue:
					'https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png',
			},
			posterImgUrl: {
				type: Sequelize.TEXT,
				validate: { isUrl: true },
				defaultValue:
					'https://fastcode.space/wp-content/uploads/2019/11/Starry-Glamour-Dream-Earth-Beautiful-Purple-Blue-Gradient-Background-Poster-Illustration-0.jpg',
			},
			userName: {
				unique: true,
				type: Sequelize.STRING,
				allowNull: false,
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
				type: Sequelize.TEXT,
			},
			isVerified: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date(),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date(),
			},
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('users');
	},
};
