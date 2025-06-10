// Functions mapping to tool calls
// Define one function per tool call - each tool call should have a matching function
// Parameters for a tool call are passed as an object to the corresponding function

export const get_weather = async ({
  location,
  unit,
}: {
  location: string;
  unit: string;
}) => {
  console.log("location", location);
  console.log("unit", unit);
  const res = await fetch(
    `/api/functions/get_weather?location=${location}&unit=${unit}`
  ).then((res) => res.json());

  console.log("executed get_weather function", res);

  return res;
};

export const get_joke = async () => {
  const res = await fetch(`/api/functions/get_joke`).then((res) => res.json());
  return res;
};

export const get_social_media_urls = async ({
  prompt,
}: {
  prompt: string;
}) => {
  console.log("prompt", prompt);
  const res = await fetch(`/api/functions/get_social_media_urls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  }).then((res) => res.json());

  console.log("executed get_social_media_urls function", res);

  return res;
};

export const scrape_social_media_stats = async ({
  url,
  platform,
  date_debut,
  date_fin,
}: {
  url: string;
  platform: string;
  date_debut: string;
  date_fin: string;
}) => {
  console.log("url", url, "platform", platform, "date_debut", date_debut, "date_fin", date_fin);
  const res = await fetch(`/api/functions/scrape_social_media_stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, platform, date_debut, date_fin }),
  }).then((res) => res.json());

  console.log("executed scrape_social_media_stats function", res);

  return res;
};

export const functionsMap = {
  get_weather: get_weather,
  get_joke: get_joke,
  get_social_media_urls: get_social_media_urls,
  scrape_social_media_stats: scrape_social_media_stats,
};
