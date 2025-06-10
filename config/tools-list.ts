// List of tools available to the assistant
// No need to include the top-level wrapper object as it is added in lib/tools/tools.ts
// More information on function calling: https://platform.openai.com/docs/guides/function-calling

export const toolsList = [
	{
		name: 'get_weather',
		description: 'Get the weather for a given location',
		parameters: {
			location: {
				type: 'string',
				description: 'Location to get weather for',
			},
			unit: {
				type: 'string',
				description: 'Unit to get weather in',
				enum: ['celsius', 'fahrenheit'],
			},
		},
	},
	{
		name: 'get_joke',
		description: 'Get a programming joke',
		parameters: {},
	},
	{
		name: 'scrape_social_media_stats',
		description:
			"Scraper les statistiques d'un profil de réseau social. L'API retourne automatiquement tous les posts disponibles avec leurs dates.",
		parameters: {
			url: {
				type: 'string',
				description:
					"L'URL complète du profil de réseau social à scraper (ex: https://www.tiktok.com/@streammaxfr)",
			},
			platform: {
				type: 'string',
				description:
					'Le nom de la plateforme (TikTok, Instagram, Twitter, Facebook, YouTube)',
			},
		},
	},
]
