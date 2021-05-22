/* eslint-disable */
module.exports = {
	// @ts-ignore
	up: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.bulkInsert(
				'tweets',
				[
					{
            tweetId: '6f7e7834-9ba9-445b-933e-3052f58e4ff2',
						tweet: 'Many touch typists also use keyboard shortcuts or hotkeys when typing on a computer. This allows them to edit their document without having to take their hands off the keyboard to use a mouse. An example of a keyboard shortcut is pressing the Ctrl key plus the S key to save a document as they type, or the Ctrl key plus the Z key to undo a mistake. Many experienced typists can feel or sense when they have made an error and can hit the Backspace key and make the correction with no increase in time between keystrokes.',
						userId: '32f4cafa-3d75-4b5f-9438-fa8fbaf61032',
            likes: 4,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
            tweetId: '3cd6ef27-4964-49d9-87f6-7309fa514f25',
						tweet: 'A late 20th century trend in typing, primarily used with devices with small keyboards (such as PDAs and Smartphones), is thumbing or thumb typing. This can be accomplished using one or both thumbs. Similar to desktop keyboards and input devices, if a user overuses keys which need hard presses and/or have small and unergonomic layouts, it could cause thumb tendonitis or other repetitive strain injury.',
						userId: '32f4cafa-3d75-4b5f-9438-fa8fbaf61032',
            likes: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
					},
          {
            tweetId: 'f99a1713-6a22-44c4-b1a3-b20046cc297c',
            tweet: 'The bikers rode down the long and narrow path to reach the city park. When they reached a good spot to rest, they began to look for signs of spring. The sun was bright, and a lot of bright red and blue blooms proved to all that warm spring days were the very best. Spring rides were planned. They had a burger at the lake and then rode farther up the mountain. As one rider started to get off his bike, he slipped and fell. One of the other bikers saw him fall but could do nothing to help him. Neither the boy nor the bike got hurt. After a brief stop, everyone was ready to go on. All the bikers enjoyed the nice view when they came to the top. All the roads far below them looked like ribbons. A dozen or so boats could be seen on the lake. It was very quiet and peaceful and no one wished to leave. As they set out on their return, they all enjoyed the ease of pedaling.',
            likes: 4423,
            userId: '27756a4d-0ff0-4f84-a1c4-13b3155dfa40',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            tweetId: '1e87d2b4-118f-4640-b169-db579472dfaf',
            likes: 384728738273,
            tweet: "Being human makes us susceptible to the onset of feelings. The role of these emotions varies. Some of them are useful while others may be harmful. The use of social media for self-expression has reached a point that it makes us feel we can say anything. This begins when we see people expressing anything and everything that come to mind. When we see everyone else voicing their likes and dislikes, their irritations and desires we tend to imitate what they do. And because many engage in this, we think that it is normal and healthy. However, when we get used to unbridled self-expression, we come to believe that all feelings are valid. We become convinced that in real life, we should also act on our emotions and our impulses. Using social media this way erodes our ability to regulate our actions and reactions. To illustrate, when something small irritates us we think that it's okay to feel this way. But isn't it better to foster one's patience and resilience instead of immediately complaining? Or when we develop an attraction to someone despite that person being in a relationship, and because social media has conditioned us that all feelings can be expressed",
            userId: 'e026baf0-bfe5-458e-a367-ea31ac07aedf',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            tweetId: 'da59ff98-673c-415c-96d8-94b66883cf90',
            likes: 287328738273,
            tweet: "we should also act on our emotions and our impulses. Using social media this way erodes our ability to regulate our actions and reactions. To illustrate, when something small irritates us we think that it's okay to feel this way. But isn't it better to foster one's patience and resilience instead of immediately complaining? Or when we develop an attraction to someone despite that person being in a relationship, and because social media has conditioned us that all feelings can be expressed, we tend to think that acting on this attraction is okay. Not all feelings deserve expression. We find ourselves creating our own problems when we let our present emotions control our actions.",
            userId: '193212e6-16dc-4375-8c86-d9708db74856',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            tweetId: '10ed93ef-667a-4ae9-ab61-cd481d1c230d',
            tweet: "The bikers rode down the long and narrow path to reach the city park. When they reached a good spot to rest, they began to look for signs of spring. The sun was bright, and a lot of bright red and blue blooms proved to all that warm spring days were the very best. Spring rides were planned. They had a burger at the lake and then rode farther up the mountain. As one rider started to get off his bike, he slipped and fell. One of the other bikers saw him fall but could do nothing to help him. Neither the boy nor the bike got hurt.",
            userId: '27756a4d-0ff0-4f84-a1c4-13b3155dfa40',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
				],
				{}
			);
		} catch (error) {
			console.error(error);
		}
	},

	// @ts-ignore
	down: async (queryInterface) => {
		await queryInterface.bulkDelete('tweets', null, {});
	},
};
