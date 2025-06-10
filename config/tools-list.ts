// List of tools available to the assistant
// No need to include the top-level wrapper object as it is added in lib/tools/tools.ts
// More information on function calling: https://platform.openai.com/docs/guides/function-calling

export const toolsList = [
  {
    name: "get_weather",
    description: "Get the weather for a given location",
    parameters: {
      location: {
        type: "string",
        description: "Location to get weather for",
      },
      unit: {
        type: "string",
        description: "Unit to get weather in",
        enum: ["celsius", "fahrenheit"],
      },
    },
  },
  {
    name: "get_joke",
    description: "Get a programming joke",
    parameters: {},
  },
  {
    name: "get_social_media_urls",
    description: "Rechercher les URLs des profils de réseaux sociaux pour une personne, marque ou entreprise",
    parameters: {
      prompt: {
        type: "string",
        description: "Le nom de la personne, marque ou entreprise à rechercher sur les réseaux sociaux",
      },
    },
  },
  {
    name: "scrape_social_media_stats",
    description: "Scraper les statistiques d'un profil de réseau social entre deux dates. L'utilisateur peut fournir les informations dans ce format : URL, plateforme, date début, date fin (chacune sur une ligne séparée ou séparées par des espaces/virgules)",
    parameters: {
      url: {
        type: "string",
        description: "L'URL complète du profil de réseau social à scraper (ex: https://www.tiktok.com/@streammaxfr)",
      },
      platform: {
        type: "string",
        description: "Le nom de la plateforme (TikTok, Instagram, Twitter, Facebook, YouTube)",
      },
      date_debut: {
        type: "string",
        description: "Date de début au format 'day/month/year' (ex: '10/05/2025')",
      },
      date_fin: {
        type: "string",
        description: "Date de fin au format 'day/month/year' (ex: '10/06/2025')",
      },
    },
  },
];
