/* eslint-disable */
module.exports = {
	// @ts-ignore
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('hashtags', {
			hashtag: {
        primaryKey: true,
        type: Sequelize.STRING,
        allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
			},
      followersCount: {
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
		await queryInterface.dropTable('hashtags');
	},
};
