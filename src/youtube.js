const players = new Map();
let apiReady;

function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiReady) return apiReady;
  apiReady = new Promise((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      apiReady = null;
      script.remove();
      reject(new Error('YouTube player could not load. Reload to try again.'));
    };
    document.head.append(script);
  });
  return apiReady;
}

export async function mountYouTubePlayers(root) {
  const pending = [...root.querySelectorAll('iframe[data-youtube-src]')]
    .filter(frame => frame.isConnected && !players.has(frame))
    .map(frame => {
      const record = { frame, player: null };
      players.set(frame, record);
      return record;
    });
  if (!pending.length) return;
  let api;
  try {
    api = await loadYouTubeAPI();
  } catch (error) {
    pending.forEach(record => { if (players.get(record.frame) === record) players.delete(record.frame); });
    throw error;
  }
  for (const record of pending) {
    const { frame } = record;
    if (players.get(frame) !== record) continue;
    if (!frame.isConnected) { players.delete(frame); continue; }
    // Attach controls before the iframe loads, then mute as soon as it is ready.
    frame.src = frame.dataset.youtubeSrc;
    record.player = new api.Player(frame, {
      events: {
        onReady(event) {
          if (players.get(frame) === record && frame.isConnected) event.target.mute();
        }
      }
    });
  }
}

export function unmountYouTubePlayers(root) {
  for (const [frame, record] of players) {
    if (root && !root.contains(frame)) continue;
    players.delete(frame);
    record.player?.destroy();
    frame.remove();
  }
}
