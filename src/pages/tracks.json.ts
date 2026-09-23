import { getCollection } from 'astro:content';

export async function GET() {
  const tracks = await getCollection('tracks');
  
  const payload = tracks
    .sort((a, b) => a.data.name.localeCompare(b.data.name))
    .map((track) => ({
      id: track.id,
      ...track.data,
    }));

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
