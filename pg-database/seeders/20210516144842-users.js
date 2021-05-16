/* eslint-disable */
module.exports = {
	// @ts-ignore
	up: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.bulkInsert(
				'users',
				[
					{
						name: 'John Doe',
            userId: '32f4cafa-3d75-4b5f-9438-fa8fbaf61032',
						phoneNo: 9034342323,
						age: 23,
						dateOfBirth: '1998-10-15',
						countryCode: '+91',
						description: 'Hi Im John',
						userName: 'johndoe',
						gender: 'MALE',
						email: 'jhon@gmail.com',
						accountType: 'TRAIL',
						accountStatus: 'ENABLED',
						userType: 'EXTERNAL',
						password: '123456',
						isVerified: false,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
            userId: '27756a4d-0ff0-4f84-a1c4-13b3155dfa40',
						name: 'John Doe1',
						phoneNo: 90343423231,
						age: 23,
						dateOfBirth: '1998-10-15',
						countryCode: '+91',
						description: 'Hi Im John',
						userName: 'johndoe1',
						gender: 'MALE',
						email: 'jhon1@gmail.com',
						accountType: 'TRAIL',
						accountStatus: 'ENABLED',
						userType: 'EXTERNAL',
						password: '123456',
						isVerified: false,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
            userId: 'e026baf0-bfe5-458e-a367-ea31ac07aedf',
						name: 'John Doe',
						phoneNo: 90343423232,
						age: 23,
						dateOfBirth: '1998-10-15',
						countryCode: '+91',
						description: 'Hi Im John',
						userName: 'johndoe2',
						gender: 'MALE',
						email: 'jhon2@gmail.com',
						accountType: 'TRAIL',
						accountStatus: 'ENABLED',
						userType: 'EXTERNAL',
						password: '123456',
						isVerified: false,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
            userId: '193212e6-16dc-4375-8c86-d9708db74856',
            name: 'test',
						phoneNo: 111,
						age: 23,
						dateOfBirth: '1998-10-15',
						countryCode: '+91',
						description: 'Hi Im John',
						userName: 'test',
						gender: 'MALE',
						email: 'test@gmail.com',
						accountType: 'TRAIL',
						accountStatus: 'ENABLED',
						userType: 'INTERNAL',
						password: '123456',
						isVerified: false,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				{}
			);
		} catch (error) {
			console.log(error);
		}
	},

	// @ts-ignore
	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('users', null, { truncate: true });
	},
};
