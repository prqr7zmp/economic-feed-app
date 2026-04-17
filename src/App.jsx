import { useState, useEffect, useCallback, useRef } from "react";

const API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// ─────────────────────────────────────────────
// ダッシュボード定義
// ─────────────────────────────────────────────
const DASHBOARDS = [
  {
    id: 'civil',
    label: '土木・建設',
    title: '土木・建設 Intelligence',
    sources: [
      { id: 'mlit_press',   label: '国交省 プレスリリース', en: 'MLIT Press Release',    region: '行政・政策',       url: 'https://www.mlit.go.jp/pressrelease.rdf' },
      { id: 'mlit_news',    label: '国交省 新着情報',       en: 'MLIT News',             region: '行政・政策',       url: 'https://www.mlit.go.jp/index.rdf' },
      { id: 'mlit_saigai',  label: '国交省 災害情報',       en: 'MLIT Disaster Info',    region: '行政・政策',       url: 'https://www.mlit.go.jp/saigai.rdf' },
      { id: 'mlit_imp',     label: '国交省 重要お知らせ',   en: 'MLIT Important Notice', region: '行政・政策',       url: 'https://www.mlit.go.jp/important.rdf' },
      { id: 'meti_c',       label: '経済産業省',            en: 'METI Japan',            region: '行政・政策',       url: 'https://www.meti.go.jp/ml_index_release_atom.xml' },
      { id: 'nikkei_civil', label: '日経xTECH 土木',       en: 'Nikkei xTECH Civil',    region: '建設・土木メディア', url: 'https://xtech.nikkei.com/rss/xtech-con.rdf' },
      { id: 'nikkei_build', label: '日経xTECH 建築',       en: 'Nikkei xTECH Building', region: '建設・土木メディア', url: 'https://xtech.nikkei.com/rss/xtech-bld.rdf' },
      { id: 'itmedia_c',    label: 'ITmedia NEWS',          en: 'ITmedia NEWS',          region: '技術・DX',         url: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml' },
      { id: 'ascii_c',      label: 'ASCII.jp',              en: 'ASCII.jp Technology',   region: '技術・DX',         url: 'https://ascii.jp/rss.xml' },
      { id: 'mynavi_c',     label: 'マイナビニュース IT',   en: 'Mynavi News IT',         region: '技術・DX',         url: 'https://news.mynavi.jp/rss/technology' },
      { id: 'fdma_press',   label: '消防庁 報道発表',       en: 'FDMA Press Release',    region: '防災・安全',       url: 'https://www.fdma.go.jp/pressrelease/houdou/index.xml' },
      { id: 'fdma_info',    label: '消防庁 お知らせ',       en: 'FDMA Info',             region: '防災・安全',       url: 'https://www.fdma.go.jp/pressrelease/info/index.xml' },
      { id: 'fdma_saigai',  label: '消防庁 災害情報',       en: 'FDMA Disaster Info',    region: '防災・安全',       url: 'https://www.fdma.go.jp/disaster/info/index.xml' },
    ],
    regions: ['All', '行政・政策', '建設・土木メディア', '技術・DX', '防災・安全'],
    rs: {
      '行政・政策':         { bg: 'var(--color-background-info)',    text: 'var(--color-text-info)',    border: 'var(--color-border-info)'    },
      '建設・土木メディア': { bg: 'var(--color-background-warning)', text: 'var(--color-text-warning)', border: 'var(--color-border-warning)' },
      '技術・DX':           { bg: 'var(--color-background-success)', text: 'var(--color-text-success)', border: 'var(--color-border-success)' },
      '防災・安全':         { bg: 'var(--color-background-danger)',  text: 'var(--color-text-danger)',  border: 'var(--color-border-danger)'  },
    },
  },
  {
    id: 'global',
    label: '国際・経済',
    title: 'Global Policy Intelligence',
    sources: [
      { id: 'mofa',       label: '外務省',          en: 'MOFA Japan (Safety)',      region: 'Japan',         url: 'https://www.anzen.mofa.go.jp/rss/news.xml' },
      { id: 'boj',        label: '日本銀行',         en: 'Bank of Japan',           region: 'Japan',         url: 'https://www.boj.or.jp/rss/whatsnew.xml' },
      { id: 'meti_g',     label: '経済産業省',       en: 'METI Japan',              region: 'Japan',         url: 'https://www.meti.go.jp/ml_index_release_atom.xml' },
      { id: 'cao',        label: '内閣府',           en: 'Cabinet Office Japan',    region: 'Japan',         url: 'https://www.cao.go.jp/rss/news.rdf' },
      { id: 'fed',        label: 'Federal Reserve', en: 'US Federal Reserve',      region: 'USA',           url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
      { id: 'treasury',   label: 'US Treasury',     en: 'Dept. of the Treasury',   region: 'USA',           url: 'https://home.treasury.gov/rss.xml' },
      { id: 'state',      label: 'State Dept.',     en: 'US Dept. of State',       region: 'USA',           url: 'https://www.state.gov/rss-feeds/press-releases/' },
      { id: 'chinadaily', label: 'China Daily',     en: 'China Daily (EN)',        region: 'China',         url: 'https://www.chinadaily.com.cn/rss/china_rss.xml' },
      { id: 'ecb',        label: 'ECB',             en: 'European Central Bank',   region: 'Europe',        url: 'https://www.ecb.europa.eu/press/pr/rss/pr.en.rss' },
      { id: 'ec',         label: 'EU Commission',   en: 'European Commission',     region: 'Europe',        url: 'https://ec.europa.eu/commission/presscorner/api/rss' },
      { id: 'boe',        label: 'Bank of England', en: 'Bank of England',         region: 'UK',            url: 'https://www.bankofengland.co.uk/rss/news' },
      { id: 'hmt',        label: 'HM Treasury',     en: 'UK HM Treasury',          region: 'UK',            url: 'https://www.gov.uk/government/organisations/hm-treasury.atom' },
      { id: 'imf',        label: 'IMF',             en: 'Intl. Monetary Fund',     region: 'International', url: 'https://www.imf.org/en/rss-list/feed?category=WHATSNEW' },
      { id: 'wb',         label: 'World Bank',      en: 'World Bank Blogs',        region: 'International', url: 'https://blogs.worldbank.org/rss' },
      { id: 'oecd',       label: 'OECD',            en: 'OECD Ecoscope Blog',      region: 'International', url: 'https://oecdecoscope.blog/feed/' },
      { id: 'wto',        label: 'WTO',             en: 'World Trade Organization',region: 'International', url: 'https://www.wto.org/rss/english/news_e.rss' },
      { id: 'boc',        label: 'Bank of Canada',  en: 'CA Central Bank',         region: 'Canada',        url: 'https://www.bankofcanada.ca/feed/category/publications/news/' },
      { id: 'rba',        label: 'Reserve Bank AU', en: 'AU Reserve Bank',         region: 'Australia',     url: 'https://www.rba.gov.au/rss/rss-cb-media-releases.xml' },
    ],
    regions: ['All', 'Japan', 'USA', 'China', 'Europe', 'UK', 'International', 'Canada', 'Australia'],
    rs: {
      Japan:         { bg: 'var(--color-background-danger)',    text: 'var(--color-text-danger)',    border: 'var(--color-border-danger)'    },
      USA:           { bg: 'var(--color-background-info)',      text: 'var(--color-text-info)',      border: 'var(--color-border-info)'      },
      China:         { bg: 'var(--color-background-danger)',    text: 'var(--color-text-danger)',    border: 'var(--color-border-danger)'    },
      Europe:        { bg: 'var(--color-background-warning)',   text: 'var(--color-text-warning)',   border: 'var(--color-border-warning)'   },
      UK:            { bg: 'var(--color-background-secondary)', text: 'var(--color-text-secondary)', border: 'var(--color-border-secondary)' },
      International: { bg: 'var(--color-background-success)',   text: 'var(--color-text-success)',   border: 'var(--color-border-success)'   },
      Canada:        { bg: 'var(--color-background-info)',      text: 'var(--color-text-info)',      border: 'var(--color-border-info)'      },
      Australia:     { bg: 'var(--color-background-warning)',   text: 'var(--color-text-warning)',   border: 'var(--color-border-warning)'   },
    },
  },
  {
    id: 'tech',
    label: '産業技術・IT',
    title: 'Tech & AI Intelligence',
    sources: [
      { id: 'openai',        label: 'OpenAI Blog',    en: 'OpenAI',               region: 'AI',          url: 'https://openai.com/blog/rss/' },
      { id: 'anthropic',     label: 'Anthropic',      en: 'Anthropic',            region: 'AI',          url: 'https://www.anthropic.com/rss.xml' },
      { id: 'google_ai',     label: 'Google AI',      en: 'Google AI Blog',       region: 'AI',          url: 'https://blog.google/technology/ai/rss/' },
      { id: 'deepmind',      label: 'DeepMind',       en: 'Google DeepMind',      region: 'AI',          url: 'https://deepmind.google/blog/rss.xml' },
      { id: 'msft_ai',       label: 'Microsoft AI',   en: 'Microsoft AI Blog',    region: 'AI',          url: 'https://blogs.microsoft.com/ai/feed/' },
      { id: 'mit_ai',        label: 'MIT AI News',    en: 'MIT News (AI)',        region: 'AI',          url: 'https://news.mit.edu/rss/topic/artificial-intelligence2' },
      { id: 'techcrunch_ai', label: 'TechCrunch AI',  en: 'TechCrunch AI',        region: 'AI Media',    url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
      { id: 'venturebeat',   label: 'VentureBeat AI', en: 'VentureBeat AI',       region: 'AI Media',    url: 'https://venturebeat.com/ai/feed/' },
      { id: 'wired_ai',      label: 'WIRED AI',       en: 'WIRED AI',             region: 'AI Media',    url: 'https://www.wired.com/feed/tag/ai/latest/rss' },
      { id: 'theregister',   label: 'The Register',   en: 'The Register (AI)',    region: 'AI Media',    url: 'https://www.theregister.com/emergent_tech/ai_ml/headlines.atom' },
      { id: 'itmedia_ai',    label: 'ITmedia AI+',    en: 'ITmedia AI+',          region: 'AI Japan',    url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml' },
      { id: 'nikkei_tech',   label: '日経XTECH',      en: 'Nikkei XTECH',         region: 'AI Japan',    url: 'https://xtech.nikkei.com/rss/xtech-it.rdf' },
      { id: 'zdnet_jp',      label: 'ZDNet Japan',    en: 'ZDNet Japan',          region: 'AI Japan',    url: 'https://japan.zdnet.com/rss/20.xml' },
      { id: 'ieee',          label: 'IEEE Spectrum',  en: 'IEEE Spectrum',        region: 'Tech Global', url: 'https://spectrum.ieee.org/rss/fulltext' },
      { id: 'mit_news',      label: 'MIT News',       en: 'MIT News (Tech)',      region: 'Tech Global', url: 'https://news.mit.edu/rss/topic/technology' },
      { id: 'nist',          label: 'NIST',           en: 'NIST',                 region: 'Tech Global', url: 'https://www.nist.gov/news-events/rss.xml' },
      { id: 'wef_tech',      label: 'WEF Technology', en: 'World Economic Forum', region: 'Tech Global', url: 'https://www.weforum.org/agenda/feed/rss/?topic=emerging-technologies' },
      { id: 'meti_t',        label: '経済産業省',      en: 'METI Japan',           region: 'Tech JP',     url: 'https://www.meti.go.jp/ml_index_release_atom.xml' },
      { id: 'itmedia_news',  label: 'ITmedia NEWS',   en: 'ITmedia NEWS',         region: 'Tech JP',     url: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml' },
      { id: 'itmedia_enter', label: 'ITmedia Enterprise', en: 'ITmedia Enterprise', region: 'Tech JP',   url: 'https://rss.itmedia.co.jp/rss/2.0/enterprise.xml' },
      { id: 'ascii_tech',    label: 'ASCII.jp',       en: 'ASCII.jp Technology',  region: 'Tech JP',     url: 'https://ascii.jp/rss.xml' },
      { id: 'mynavi_tech',   label: 'マイナビニュース', en: 'Mynavi News IT',       region: 'Tech JP',     url: 'https://news.mynavi.jp/rss/technology' },
      { id: 'impress',       label: 'Impress Watch',  en: 'Impress Watch',        region: 'Tech JP',     url: 'https://www.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf' },
    ],
    regions: ['All', 'AI', 'AI Japan', 'AI Media', 'Tech Global', 'Tech JP'],
    rs: {
      'AI':          { bg: 'var(--color-background-info)',      text: 'var(--color-text-info)',      border: 'var(--color-border-info)'      },
      'AI Japan':    { bg: 'var(--color-background-danger)',    text: 'var(--color-text-danger)',    border: 'var(--color-border-danger)'    },
      'AI Media':    { bg: 'var(--color-background-secondary)', text: 'var(--color-text-secondary)', border: 'var(--color-border-secondary)' },
      'Tech Global': { bg: 'var(--color-background-success)',   text: 'var(--color-text-success)',   border: 'var(--color-border-success)'   },
      'Tech JP':     { bg: 'var(--color-background-warning)',   text: 'var(--color-text-warning)',   border: 'var(--color-border-warning)'   },
    },
  },
];

// ─────────────────────────────────────────────
// ユーティリティ
// ─────────────────────────────────────────────
function fmtDate(s) {
  if (!s) return '';
  try {
    const d = new Date(s);
    if (isNaN(d)) return '';
    const diff = (Date.now() - d) / 1000;
    if (diff < 3600)      return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400)     return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}日前`;
    return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
  } catch { return ''; }
}

function decodeHtml(s) {
  return (s || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim();
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

// ─────────────────────────────────────────────
// ダッシュボード単体（各タブの中身）
// ─────────────────────────────────────────────
function Dashboard({ dash }) {
  const [articles,  setArticles]  = useState([]);
  const [statuses,  setStatuses]  = useState({});
  const [filter,    setFilter]    = useState('All');
  const [updatedAt, setUpdatedAt] = useState(null);
  const loadedRef = useRef(false);

  const load = useCallback(async (sources = dash.sources) => {
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
  }, [dash]);

  // タブが初めて表示されたときだけ自動ロード
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      load();
    }
  }, [load]);

  const shown    = filter === 'All' ? articles : articles.filter(a => a.region === filter);
  const loading  = Object.values(statuses).some(s => s === 'loading');
  const okCount  = Object.values(statuses).filter(s => s === 'ok').length;
  const errCount = Object.values(statuses).filter(s => s === 'error').length;
  const { rs, regions, sources, title } = dash;

  const fallbackRs = Object.values(rs)[0];

  return (
    <div>
      {/* ── サブヘッダー（タイトル・ステータス・更新ボタン）── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {title}
        </span>
        {loading && (
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
            取得中 {okCount}/{sources.length}…
          </span>
        )}
        {!loading && updatedAt && (
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
            {okCount}/{sources.length} ソース
            {errCount > 0 && <span style={{ color: 'var(--color-text-danger)', marginLeft: 4 }}>· {errCount} 失敗</span>}
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

      {/* ── カテゴリフィルター ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
        {regions.map(r => {
          const rst  = rs[r];
          const cnt  = r === 'All' ? articles.length : articles.filter(a => a.region === r).length;
          const isOn = filter === r;
          return (
            <button
              key={r}
              className={`chip${isOn ? ' on' : ''}`}
              onClick={() => setFilter(r)}
              style={isOn && rst ? { background: rst.bg, color: rst.text, borderColor: rst.border } : {}}
            >
              {r}
              {cnt > 0 && <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.7, fontFamily: 'var(--font-mono)' }}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* ── 記事一覧 ── */}
      <div style={{ padding: '0.5rem 0 1rem' }}>
        {articles.length === 0 && loading && [...Array(6)].map((_, i) => (
          <div key={i} className="pulse" style={{
            height: 72, background: 'var(--color-background-secondary)',
            borderRadius: 'var(--border-radius-md)', marginBottom: 8,
          }} />
        ))}

        <div className="art-row">
          {shown.map(a => {
            const rst = rs[a.region] || fallbackRs;
            return (
              <div key={a.id} className="art-item">
                <div style={{ width: 3, flexShrink: 0, alignSelf: 'stretch', borderRadius: 2, background: rst.border, marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 500, padding: '1px 7px', borderRadius: 20,
                      background: rst.bg, color: rst.text,
                      fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', flexShrink: 0,
                    }}>
                      {a.region}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.source}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                      {fmtDate(a.date)}
                    </span>
                  </div>
                  <a href={a.link} target="_blank" rel="noopener noreferrer" className="art-link">
                    {a.title || '(タイトルなし)'}
                  </a>
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

        {!loading && shown.length === 0 && articles.length > 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 14 }}>
            このカテゴリの記事はまだ読み込まれていません。
          </div>
        )}
      </div>

      {/* ── ソース状態フッター ── */}
      <div style={{ paddingBottom: '1.5rem', borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '0.75rem' }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          ソース状態
          {errCount > 0 && <span style={{ marginLeft: 8, color: 'var(--color-text-danger)', fontWeight: 400 }}>— 失敗したソースをクリックで再取得</span>}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {sources.map(src => {
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
                  background: st === 'ok' ? 'var(--color-background-success)' : isErr ? 'var(--color-background-danger)' : 'var(--color-background-secondary)',
                  color:      st === 'ok' ? 'var(--color-text-success)'       : isErr ? 'var(--color-text-danger)'       : 'var(--color-text-tertiary)',
                  cursor: isErr ? 'pointer' : 'default',
                }}
              >
                <span className="dot" style={{ background: st === 'ok' ? 'var(--color-text-success)' : isErr ? 'var(--color-text-danger)' : 'var(--color-text-tertiary)' }} />
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

// ─────────────────────────────────────────────
// メインアプリ（タブ切り替え）
// ─────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('civil');

  const TAB_COLORS = {
    civil:  'var(--color-border-warning)',
    global: 'var(--color-border-success)',
    tech:   'var(--color-border-info)',
  };

  return (
    <div style={{ fontFamily: 'var(--font-sans)', maxWidth: 720, margin: '0 auto' }}>
      <h2 className="sr-only">Intelligence Hub</h2>

      <style>{`
        .sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
        .chip { cursor:pointer; border:0.5px solid var(--color-border-tertiary); background:transparent; font-family:var(--font-sans); font-size:12px; padding:4px 11px; border-radius:20px; color:var(--color-text-secondary); transition:all 0.1s; }
        .chip:hover { border-color:var(--color-border-secondary); color:var(--color-text-primary); background:var(--color-background-secondary); }
        .chip.on { border-color:var(--color-border-primary); background:var(--color-background-secondary); color:var(--color-text-primary); font-weight:500; }
        .chip:disabled { opacity:0.4; cursor:default; }
        .art-link { text-decoration:none; color:var(--color-text-primary); font-size:14px; font-weight:500; line-height:1.5; display:block; }
        .art-link:hover { color:var(--color-text-info); }
        .art-row { display:flex; flex-direction:column; gap:0; }
        .art-item { padding:14px 0; border-bottom:0.5px solid var(--color-border-tertiary); display:flex; gap:12px; align-items:flex-start; }
        .art-item:last-child { border-bottom:none; }
        .dot { width:6px; height:6px; border-radius:50%; display:inline-block; flex-shrink:0; }
        .pulse { animation:sk 1.4s ease-in-out infinite; }
        @keyframes sk { 0%,100%{ opacity:0.55; } 50%{ opacity:0.25; } }
        .tab-btn { cursor:pointer; background:transparent; border:none; font-family:var(--font-sans); font-size:14px; font-weight:500; padding:10px 4px; color:var(--color-text-tertiary); border-bottom:2px solid transparent; transition:all 0.15s; }
        .tab-btn:hover { color:var(--color-text-secondary); }
        .tab-btn.active { color:var(--color-text-primary); }
      `}</style>

      {/* ── タブナビ ── */}
      <div style={{
        display: 'flex', gap: 24,
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        marginBottom: 0,
        padding: '0.75rem 0 0',
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)', alignSelf: 'center', marginRight: 4, letterSpacing: '0.05em' }}>
          INTEL
        </div>
        {DASHBOARDS.map(d => (
          <button
            key={d.id}
            className={`tab-btn${activeTab === d.id ? ' active' : ''}`}
            onClick={() => setActiveTab(d.id)}
            style={activeTab === d.id ? { borderBottomColor: TAB_COLORS[d.id], color: 'var(--color-text-primary)' } : {}}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* ── ダッシュボード本体（keepMounted で状態を保持）── */}
      {DASHBOARDS.map(d => (
        <div key={d.id} style={{ display: activeTab === d.id ? 'block' : 'none', paddingTop: '1rem' }}>
          <Dashboard dash={d} />
        </div>
      ))}
    </div>
  );
}