export function getHostLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    
    const map: Record<string, string> = {
      'overtake.gg': 'Overtake',
      'racedepartment.com': 'Overtake',
      'mediafire.com': 'MediaFire',
      'drive.google.com': 'Drive',
      'mega.nz': 'Mega',
      'patreon.com': 'Patreon',
      'gumroad.com': 'Gumroad',
      'github.com': 'GitHub',
    };

    for (const [domain, label] of Object.entries(map)) {
      if (host === domain || host.endsWith('.' + domain)) {
        return label;
      }
    }

    return host;
  } catch {
    return 'Link';
  }
}
