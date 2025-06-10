import { NextResponse } from 'next/server';

interface SocialMediaProfile {
  platform: string;
  url: string | null;
  username?: string;
  status: string;
}

async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function searchSocialMedia(query: string): Promise<SocialMediaProfile[]> {
  const profiles: SocialMediaProfile[] = [];
  const cleanQuery = query.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');

  // TikTok - Essayer différentes variations
  const tiktokVariations = [
    `@${cleanQuery}`,
    `@${query.replace(/\s+/g, '')}`,
    `@${query.replace(/\s+/g, '').toLowerCase()}fr`,
    `@${query.replace(/\s+/g, '').toLowerCase()}official`,
    `@stream${cleanQuery}`,
    `@${cleanQuery}fr`
  ];

  let tiktokFound = false;
  let tiktokUrl = null;
  let tiktokUsername = null;

  for (const variation of tiktokVariations) {
    const username = variation.replace('@', '');
    const url = `https://www.tiktok.com/@${username}`;
    
    if (await checkUrlExists(url)) {
      tiktokFound = true;
      tiktokUrl = url;
      tiktokUsername = variation;
      break;
    }
  }

  profiles.push({
    platform: 'TikTok',
    url: tiktokUrl,
    username: tiktokUsername || undefined,
    status: tiktokFound ? 'trouvé' : 'non trouvé'
  });

  // Instagram - Essayer différentes variations
  const instaVariations = [
    cleanQuery,
    query.replace(/\s+/g, ''),
    `${cleanQuery}official`,
    `${cleanQuery}fr`,
    `official${cleanQuery}`,
    query.replace(/\s+/g, '').toLowerCase()
  ];

  let instaFound = false;
  let instaUrl = null;
  let instaUsername = null;

  for (const variation of instaVariations) {
    const url = `https://www.instagram.com/${variation}`;
    
    if (await checkUrlExists(url)) {
      instaFound = true;
      instaUrl = url;
      instaUsername = variation;
      break;
    }
  }

  profiles.push({
    platform: 'Instagram',
    url: instaUrl,
    username: instaUsername || undefined,
    status: instaFound ? 'trouvé' : 'non trouvé'
  });

  // Twitter/X - Essayer différentes variations
  const twitterVariations = [
    cleanQuery,
    query.replace(/\s+/g, ''),
    `${cleanQuery}official`,
    `${cleanQuery}fr`,
    `official${cleanQuery}`
  ];

  let twitterFound = false;
  let twitterUrl = null;
  let twitterUsername = null;

  for (const variation of twitterVariations) {
    const url = `https://twitter.com/${variation}`;
    
    if (await checkUrlExists(url)) {
      twitterFound = true;
      twitterUrl = url;
      twitterUsername = variation;
      break;
    }
  }

  profiles.push({
    platform: 'Twitter/X',
    url: twitterUrl,
    username: twitterUsername || undefined,
    status: twitterFound ? 'trouvé' : 'non trouvé'
  });

  // Facebook - Essayer différentes variations
  const fbVariations = [
    cleanQuery,
    query.replace(/\s+/g, ''),
    `${cleanQuery}official`,
    `${cleanQuery}fr`,
    query.replace(/\s+/g, '').toLowerCase()
  ];

  let fbFound = false;
  let fbUrl = null;
  let fbUsername = null;

  for (const variation of fbVariations) {
    const url = `https://www.facebook.com/${variation}`;
    
    if (await checkUrlExists(url)) {
      fbFound = true;
      fbUrl = url;
      fbUsername = variation;
      break;
    }
  }

  profiles.push({
    platform: 'Facebook',
    url: fbUrl,
    username: fbUsername || undefined,
    status: fbFound ? 'trouvé' : 'non trouvé'
  });

  // YouTube - Essayer différentes variations
  const youtubeVariations = [
    cleanQuery,
    query.replace(/\s+/g, ''),
    `${cleanQuery}official`,
    `${cleanQuery}fr`,
    query.replace(/\s+/g, '').toLowerCase()
  ];

  let youtubeFound = false;
  let youtubeUrl = null;
  let youtubeUsername = null;

  for (const variation of youtubeVariations) {
    const url = `https://www.youtube.com/@${variation}`;
    
    if (await checkUrlExists(url)) {
      youtubeFound = true;
      youtubeUrl = url;
      youtubeUsername = variation;
      break;
    }
  }

  profiles.push({
    platform: 'YouTube',
    url: youtubeUrl,
    username: youtubeUsername || undefined,
    status: youtubeFound ? 'trouvé' : 'non trouvé'
  });

  return profiles;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Le prompt est requis' },
        { status: 400 }
      );
    }

    const socialMediaProfiles = await searchSocialMedia(prompt);

    // Formater la réponse
    const existingProfiles = socialMediaProfiles.filter(profile => profile.url !== null);
    const response = {
      message: `J'ai trouvé ${existingProfiles.length} profils de réseaux sociaux pour "${prompt}":`,
      profiles: socialMediaProfiles,
      totalFound: existingProfiles.length
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la recherche des réseaux sociaux:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche des réseaux sociaux' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Méthode GET non supportée. Utilisez POST avec un prompt.' },
    { status: 405 }
  );
} 