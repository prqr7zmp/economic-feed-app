import { useState, useEffect, useCallback } from "react";

const API = 'https://api.rss2json.com/v1/api.json?rss_url=';

const SOURCES = [
  { id: 'mofa',      label: '外務省',          en: 'MOFA Japan (Safety)',          region: 'Japan',         url: 'https://www.anzen.mofa.go.jp/rss/news.xml' },
  { id: 'boj',       label: '日本銀行',         en: 'Bank of Japan',                region: 'Japan',         url: 'https://www.boj.or.jp/rss/whatsnew.xml' },
  { id: 'meti',      label: '経済産業省',       en: 'METI Japan',                   region: 'Japan',         url: 'https://www.meti.go.jp/rss/whatsnew.rdf' },
  { id: 'cao',       label: '内閣府',           en: 'Cabinet Office Japan',         region: 'Japan',         url: 'https://www.cao.go.jp/rss/news.rdf' },
  { id: 'fed',       label: 'Federal Reserve', en: 'US Federal Reserve',           region: 'USA',           url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
  { id: 'treasury',  label: 'US Treasury',     en: 'Dept. of the Treasury',        region: 'USA',           url: 'https://home.treasury.gov/rss.xml' },
  { id: 'state',     label: 'State Dept.',     en: 'US Dept. of State',            region: 'USA',           url: 'https://www.state.gov/rss-feeds/press-releases/' },
  { id: 'chinadaily',label: 'China Daily',     en: 'China Daily (EN)',             region: 'China',         url: 'https://www.chinadaily.com.cn/rss/china_rss.xml' },
  { id: 'ecb',       label: 'ECB',             en: 'European Central Bank',        region: 'Europe',        url: 'https://www.ecb.europa.eu/press/pr/rss/pr.en.rss' },
  { id: 'ec',        label: 'EU Commission',   en: 'European Commission',          region: 'Europe',        url: 'https://ec.europa.eu/commission/presscorner/api/rss' },
  { id: 'boe',       label: 'Bank of England', en: 'Bank of England',              region: 'UK',            url: 'https://www.bankofengland.co.uk/rss/news' },
  { id: 'hmt',       label: 'HM Treasury',     en: 'UK HM Treasury',               region: 'UK',            url: 'https://www.gov.uk/government/organisations/hm-treasury.atom' },
  { id: 'imf',       label: 'IMF',             en: 'Intl. Monetary Fund',          region: 'International', url: 'https://www.imf.org/en/rss-list/feed?category=WHATSNEW' },
  { id: 'wb',        label: 'World Bank',      en: 'World Bank Blogs',             region: 'International', url: 'https://blogs.worldbank.org/rss' },
  { id: 'oecd',      label: 'OECD',            en: 'OECD Ecoscope Blog',           region: 'International', url: 'https://oecdecoscope.blog/feed/' },
  { id: 'wto',       label: 'WTO',             en: 'World Trade Organization',     region: 'International', url: 'https://www.wto.org/rss/english/news_e.rss' },
  { id: 'boc',       label: 'Bank of Canada',  en: 'CA Central Bank',              region: 'Canada',        url: 'https://www.bankofcanada.ca/feed/category/publications/news/' },
  { id: 'rba',       label: 'Reserve Bank AU', en: 'AU Reserve Bank',              region: 'Australia',     url: 'https://www.rba.gov.au/rss/rss-cb-media-releases.xml' },
];

const REGIONS = ['All', 'Japan', 'USA', 'China', 'Europe', 'UK', 'International', 'Canada', 'Australia'];

const RS = {
  Japan:         { bg: 'var(--color-background-danger)',   text: 'var(--color-text-danger)',   border: 'var(--color-border-danger)'   },
  USA:           { bg: 'var(--color-background-info)',     text: 'var(--color-text-info)',     border: 'var(--color-border-info)'     },
  China:         { bg: 'var(--color-background-danger)',   text: 'var(--color-text-danger)',   border: 'var(--color-border-danger)'   },
  Europe:        { bg: 'var(--color-background-warning)',  text: 'var(--color-text-warning)',  border: 'var(--color-border-warning)'  },
  UK:            { bg: 'var(--color-background-secondary)',text: 'var(--color-text-secondary)',border: 'var(--color-border-secondary)' },
  International: { bg: 'var(--color-background-success)',  text: 'var(--color-text-success)',  border: 'var(--color-border-success)'  },
  Canada:        { bg: 'var(--color-background-info)',     text: 'var(--color-text-info)',     border: 'var(--color-border-info)'     },
  Australia:     { bg: 'var(--color-background-warning)',  text: 'var(--color-text-warning)',  border: 'var(--color-border-warning)'  },
};

function fmtDate(s) {
  if (!s) return '';
  try {
    const d = new Date(s);
    if (isNaN(d)) return '';
    const diff = (Date.now() - d) / 1000;
    if (diff < 3600)  return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
  } catch { return ''; }
}

function decodeHtml(s) {
  return (s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}

async function fetchSource(src) {
  const r = await fetch(`${API}${encodeURIComponent(src.url)}&count=10`);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (j.status !== 'ok') throw new Error(j.message || 'feed error');
  return (j.items || []).slice(0, 10).map(it => ({
    id:       src.id + '::' + ((it.guid || it.link || it.title || '') + Math.random()),
    title:    decodeHtml(it.title || ''),
    link:     it.link || '',
    date:     it.pubDate || '',
    ts:       it.pubDate ? new Date(it.pubDate).getTime() : 0,
    desc:     stripHtml(it.description || it.content || ''),
    sourceId: src.id,
    source:   src.label,
    region:   src.region,
  }));
}

export default function App() {
  const [articles,  setArticles]  = useState([]);
  const [statuses,  setStatuses]  = useState({});
  const [filter,    setFilter]    = useState('All');
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async (sources = SOURCES) => {
    setStatuses(s => {
      const n = { ...s };
      sources.forEach(src => { n[src.id] = 'loading'; });
      return n;
    });

    await Promise.all(sources.map(async src => {
      try {
        const items = await fetchSource(src);
        setArticles(prev =>
          [...prev.filter(a => a.sourceId !== src.id), ...items].sort((a, b) => b.ts - a.ts)
        );
        setStatuses(s => ({ ...s, [src.id]: 'ok' }));
      } catch {
        setStatuses(s => ({ ...s, [src.id]: 'error' }));
      }
    }));

    setUpdatedAt(new Date());
  }, []);

  useEffect(() => { load(); }, [load]);

  const shown    = filter === 'All' ? articles : articles.filter(a => a.region === filter);
  const loading  = Object.values(statuses).some(s => s === 'loading');
  const okCount  = Object.values(statuses).filter(s => s === 'ok').length;
  const errCount = Object.values(statuses).filter(s => s === 'error').length;

  return (
    <div style={{ fontFamily: 'var(--font-sans)', maxWidth: 720, margin: '0 auto' }}>
      <h2 className="sr-only">
        Global Policy Intelligence Feed
      </h2>

      <style>{`
        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
        .chip { cursor: pointer; border: 0.5px solid var(--color-border-tertiary); background: transparent; font-family: var(--font-sans); font-size: 12px; padding: 4px 11px; border-radius: 20px; color: var(--color-text-secondary); transition: all 0.1s; }
        .chip:hover { border-color: var(--color-border-secondary); color: var(--color-text-primary); background: var(--color-background-secondary); }
        .chip.on { border-color: var(--color-border-primary); background: var(--color-background-secondary); color: var(--color-text-primary); font-weight: 500; }
        .chip:disabled { opacity: 0.4; cursor: default; }
        .art-link { text-decoration: none; color: var(--color-text-primary); font-size: 14px; font-weight: 500; line-height: 1.5; display: block; }
        .art-link:hover { color: var(--color-text-info); }
        .art-row { display: flex; flex-direction: column; gap: 0; }
        .art-item { padding: 14px 0; border-bottom: 0.5px solid var(--color-border-tertiary); display: flex; gap: 12px; align-items: flex-start; }
        .art-item:last-child { border-bottom: none; }
        .dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .pulse { animation: sk 1.4s ease-in-out infinite; }
        @keyframes sk { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.25; } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: '1rem 0 0.85rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Global Policy Intelligence
          </span>

          {loading && (
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
              取得中 {okCount}/{SOURCES.length}…
            </span>
          )}
          {!loading && updatedAt && (
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
              {okCount}/{SOURCES.length} ソース
              {errCount > 0 && (
                <span style={{ color: 'var(--color-text-danger)', marginLeft: 4 }}>· {errCount} 失敗</span>
              )}
              {' '}· {updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <button
            className="chip"
            style={{ marginLeft: 'auto' }}
            onClick={() => load()}
            disabled={loading}
          >
            {loading ? '読込中…' : '更新'}
          </button>
        </div>

        {/* Region filter chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {REGIONS.map(r => {
            const rs   = RS[r];
            const cnt  = r === 'All' ? articles.length : articles.filter(a => a.region === r).length;
            const isOn = filter === r;
            return (
              <button
                key={r}
                className={`chip${isOn ? ' on' : ''}`}
                onClick={() => setFilter(r)}
                style={isOn && rs ? { background: rs.bg, color: rs.text, borderColor: rs.border } : {}}
              >
                {r}
                {cnt > 0 && (
                  <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Article list (1列・時系列) ── */}
      <div style={{ padding: '0.5rem 0 1rem' }}>

        {/* Loading skeletons */}
        {articles.length === 0 && loading && [...Array(8)].map((_, i) => (
          <div key={i} className="pulse" style={{
            height: 72,
            background: 'var(--color-background-secondary)',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: 8,
          }} />
        ))}

        {/* Articles */}
        <div className="art-row">
          {shown.map(a => {
            const rs = RS[a.region] || RS.International;
            return (
              <div key={a.id} className="art-item">
                {/* Left accent bar */}
                <div style={{
                  width: 3,
                  flexShrink: 0,
                  alignSelf: 'stretch',
                  borderRadius: 2,
                  background: rs.border,
                  marginTop: 2,
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 500, padding: '1px 7px', borderRadius: 20,
                      background: rs.bg, color: rs.text,
                      fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', flexShrink: 0,
                    }}>
                      {a.region.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: 12, color: 'var(--color-text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {a.source}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 11, color: 'var(--color-text-tertiary)',
                      fontFamily: 'var(--font-mono)', flexShrink: 0,
                    }}>
                      {fmtDate(a.date)}
                    </span>
                  </div>

                  {/* Title */}
                  <a href={a.link} target="_blank" rel="noopener noreferrer" className="art-link">
                    {a.title || '(タイトルなし)'}
                  </a>

                  {/* Excerpt */}
                  {a.desc && (
                    <p style={{ margin: '5px 0 0', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      {a.desc}{a.desc.length >= 160 ? '…' : ''}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {!loading && shown.length === 0 && articles.length > 0 && (
          <div style={{
            padding: '2rem', textAlign: 'center',
            color: 'var(--color-text-secondary)', fontSize: 14,
          }}>
            このリージョンの記事はまだ読み込まれていません。
          </div>
        )}
      </div>

      {/* ── Source status footer ── */}
      <div style={{ paddingBottom: '1.5rem', borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '0.75rem' }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          ソース状態
          {errCount > 0 && (
            <span style={{ marginLeft: 8, color: 'var(--color-text-danger)', fontWeight: 400 }}>
              — 失敗したソースをクリックで再取得
            </span>
          )}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SOURCES.map(src => {
            const st    = statuses[src.id];
            const isErr = st === 'error';
            return (
              <div
                key={src.id}
                title={src.en + (isErr ? ' — クリックで再取得' : '')}
                onClick={() => isErr && load([src])}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontFamily: 'var(--font-mono)',
                  padding: '3px 9px', borderRadius: 20,
                  border: '0.5px solid var(--color-border-tertiary)',
                  background: st === 'ok'  ? 'var(--color-background-success)'
                            : isErr        ? 'var(--color-background-danger)'
                            :                'var(--color-background-secondary)',
                  color:      st === 'ok'  ? 'var(--color-text-success)'
                            : isErr        ? 'var(--color-text-danger)'
                            :                'var(--color-text-tertiary)',
                  cursor: isErr ? 'pointer' : 'default',
                }}
              >
                <span className="dot" style={{
                  background: st === 'ok' ? 'var(--color-text-success)'
                            : isErr       ? 'var(--color-text-danger)'
                            :               'var(--color-text-tertiary)',
                }} />
                {src.label}
                {st === 'loading' && ' …'}
                {isErr && ' ↺'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}