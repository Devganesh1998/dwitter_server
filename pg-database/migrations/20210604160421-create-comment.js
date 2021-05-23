/* eslint-disable */
module.exports = {
	// @ts-ignore
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('comments', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			comment: {
				type: Sequelize.TEXT,
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
		await queryInterface.dropTable('comments');
	},
};
