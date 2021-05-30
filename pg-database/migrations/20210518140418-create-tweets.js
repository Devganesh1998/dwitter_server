/* eslint-disable */
module.exports = {
	// @ts-ignore
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('tweets', {
			tweetId: {
				primaryKey: true,
				type: Sequelize.UUID,
				validate: { isUUID: 4 },
				defaultValue: Sequelize.UUIDV4,
			},
			tweet: {
				allowNull: false,
				type: Sequelize.TEXT,
			},
			likes: {
				type: Sequelize.BIGINT,
				defaultValue: 0,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	// @ts-ignore
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('tweets');
	},
};
