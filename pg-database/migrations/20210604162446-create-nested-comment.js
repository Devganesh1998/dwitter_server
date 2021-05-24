/* eslint-disable */
module.exports = {
	// @ts-ignore
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('nested_comments', {
			nestedCommentId: {
				primaryKey: true,
				type: Sequelize.UUID,
				validate: { isUUID: 4 },
				defaultValue: Sequelize.UUIDV4,
			},
			level: {
				type: Sequelize.INTEGER,
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
		await queryInterface.dropTable('nested_comments');
	},
};
