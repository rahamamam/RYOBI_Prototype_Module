import type { Scenario } from './types';

/**
 * Four scenarios the pipeline can run. Each one is a complete data object;
 * the engine derives every API artifact from it. The first is the walkthrough
 * used in the report's Solution Design section — the other three exist to show
 * that the pipeline is a general mechanism, not a single scripted demo.
 */
export const scenarios: Scenario[] = [
  {
    id: 'community-health',
    label: 'Community Health · TikTok',
    tagline: 'A comment spike that a dashboard reads as applause.',
    pillar: 'Community Health',
    platforms: ['tiktok'],
    cadence: 'daily',
    endpoints: [
      '/v3/analytics/profiles/ryobi/community-health?platform=tiktok',
      '/v3/listening/topics?ids=ryobi,one-plus-battery,dewalt',
      '/v3/analytics/competitors/share-of-voice',
    ],
    metrics: [
      { key: 'comments', value: 1840, wow: '+42%', note: 'ONE+ compatibility demo (Tue)' },
      { key: 'dm_volume', value: 312, wow: '+18%' },
      { key: 'engagement_rate', value: 0.058, wow: '+3.1%' },
      { key: 'median_first_response', value: '6h12m', note: 'target 4h' },
    ],
    listening: {
      topics: ['RYOBI', 'ONE+ battery', 'DEWALT'],
      mentions: 412,
      sentiment: { positive: 0.71, neutral: 0.22, negative: 0.07 },
      sampleComments: [
        'will this run my older ONE+?',
        'where can I get this in Canada?',
        'does the compact battery fit the drill?',
      ],
    },
    competitors: {
      shareOfVoice: { RYOBI: 0.34, DEWALT: 0.28, MILWAUKEE: 0.21 },
      trend: 'DEWALT rising on the same keyword cluster',
    },
    dashboardReading: 'Comments +42% week over week — a win.',
    finding: {
      whatMoved:
        'TikTok comment volume +42% WoW, concentrated on Tuesday\u2019s ONE+ compatibility demo.',
      whyItMoved:
        '~60% of the lift is questions rather than praise \u2014 split between battery compatibility and where to buy.',
      whatItMeans:
        'A purchase-intent signal is being read as an engagement win, and it exposes a content gap. Sentiment is positive but unresolved, and unanswered purchase questions decay within hours.',
      actions: [
        'Prioritise the flagged high-intent comments in the Sprout inbox this morning',
        'Brief a compatibility tutorial for this week\u2019s content slot',
        'Watch DEWALT share of voice on the same keyword cluster',
      ],
      severity: 'opportunity',
    },
    baseConfidence: 0.86,
    manualHours: 3.5,
    channel: '#marketing-daily',
    deliveredAt: '07:52',
  },
  {
    id: 'competitor-launch',
    label: 'Competitive Intelligence · Cross-platform',
    tagline: 'A competitor campaign detected outside RYOBI\u2019s owned channels.',
    pillar: 'Awareness',
    platforms: ['instagram', 'tiktok'],
    cadence: 'daily',
    endpoints: [
      '/v3/listening/topics?ids=dewalt,weekendbuild,cordless',
      '/v3/analytics/competitors/share-of-voice?window=72h',
      '/v3/listening/spike-alerts',
    ],
    metrics: [
      { key: 'competitor_posts_72h', value: 1200, wow: '+890%', note: '#WeekendBuild creator posts' },
      { key: 'ryobi_sov', value: 0.34, wow: '-2.0pp' },
      { key: 'category_conversation', value: 5820, wow: '+27%' },
      { key: 'spike_alerts_fired', value: 3 },
    ],
    listening: {
      topics: ['DEWALT', '#WeekendBuild', 'cordless drill', 'RYOBI'],
      mentions: 1612,
      sentiment: { positive: 0.64, neutral: 0.29, negative: 0.07 },
      sampleComments: [
        'everyone is doing the weekend build thing now',
        'is there a ryobi version of this challenge?',
        'my whole garage is one battery system already',
      ],
    },
    competitors: {
      shareOfVoice: { RYOBI: 0.34, DEWALT: 0.31, MILWAUKEE: 0.2 },
      trend: 'DEWALT +3.0pp in 72 hours, entirely creator-driven',
    },
    dashboardReading: 'Category mentions +27% — the market is active.',
    finding: {
      whatMoved:
        'DEWALT launched a coordinated #WeekendBuild UGC push \u2014 roughly 1,200 creator posts across Instagram and TikTok in 72 hours.',
      whyItMoved:
        'Listening flagged a synchronised volume surge entirely outside RYOBI\u2019s owned channels, so none of it would appear in native platform analytics.',
      whatItMeans:
        'This is a share-of-voice contest, not a content contest. RYOBI still leads at 34%, but the gap closed 3 points in three days and the lever being pulled is creator recruitment rather than paid reach.',
      actions: [
        'Draft a ONE+ ecosystem response angle for human review \u2014 do not mirror the format',
        'Add #WeekendBuild to the listening watchlist with a spike alert',
        'Brief the three advocates already posting ONE+ build content',
      ],
      severity: 'watch',
    },
    baseConfidence: 0.79,
    manualHours: 4.25,
    channel: '#marketing-competitive',
    deliveredAt: '07:52',
  },
  {
    id: 'format-decline',
    label: 'Performance Anomaly · Facebook',
    tagline: 'A second week of decline where the format, not the audience, changed.',
    pillar: 'Content Performance',
    platforms: ['facebook'],
    cadence: 'weekly',
    endpoints: [
      '/v3/analytics/profiles/ryobi/content-performance?platform=facebook',
      '/v3/analytics/posts?group_by=format&window=14d',
      '/v3/analytics/audience/retention',
    ],
    metrics: [
      { key: 'engagement_rate', value: 0.021, wow: '-4.0%', note: 'second consecutive week' },
      { key: 'static_image_posts', value: 11, note: '68% of output' },
      { key: 'video_retention_index', value: 3.0, note: '3x static on same audience' },
      { key: 'net_new_followers', value: 0, wow: 'flat 3 weeks' },
    ],
    listening: {
      topics: ['RYOBI', 'tool review', 'how-to'],
      mentions: 188,
      sentiment: { positive: 0.66, neutral: 0.28, negative: 0.06 },
      sampleComments: [
        'the build videos are way better than the product shots',
        'show it actually cutting something',
        'more how-to please',
      ],
    },
    competitors: {
      shareOfVoice: { RYOBI: 0.33, DEWALT: 0.29, MILWAUKEE: 0.22 },
      trend: 'stable — no competitor action explains the decline',
    },
    dashboardReading: 'Facebook engagement -4% — the platform is declining.',
    finding: {
      whatMoved:
        'Facebook engagement is down 4% for a second consecutive week, while reach holds steady.',
      whyItMoved:
        'The decline is concentrated entirely in single-image posts, which are 68% of Facebook output. Video and how-to formats retain roughly 3x longer on the same audience, and no competitor movement explains the drop.',
      whatItMeans:
        'The variable that changed is format, not platform decay and not the audience. Reach holding while follower growth is flat also indicates content recirculating inside the existing base rather than reaching new people.',
      actions: [
        'Shift two weekly static posts to short-form video',
        'A/B a how-to format against the current baseline before reallocating budget',
        'Test a lookalike-audience boost on the top-performing video',
      ],
      severity: 'alert',
    },
    baseConfidence: 0.83,
    manualHours: 2.75,
    channel: '#marketing-weekly',
    deliveredAt: '08:05',
  },
  {
    id: 'monthly-strategic',
    label: 'Strategic Synthesis · Monthly',
    tagline: 'The cross-period read that justifies routing to a larger model.',
    pillar: 'Awareness',
    platforms: ['cross'],
    cadence: 'monthly',
    endpoints: [
      '/v3/analytics/profiles/ryobi/all-pillars?window=30d',
      '/v3/listening/topics/trends?window=90d',
      '/v3/analytics/competitors/share-of-voice?window=30d',
      '/v3/listening/advocates',
    ],
    metrics: [
      { key: 'quiet_cordless_mentions', value: 2410, wow: '+310% MoM' },
      { key: 'ecosystem_framing_share', value: 0.28, wow: '+9pp' },
      { key: 'beginner_question_ratio', value: '5:1', note: 'questions vs. beginner content' },
      { key: 'advocates_identified', value: 3 },
    ],
    listening: {
      topics: ['quiet cordless', 'ONE+ ecosystem', 'first tool', 'yard build'],
      mentions: 8940,
      sentiment: { positive: 0.73, neutral: 0.21, negative: 0.06 },
      sampleComments: [
        'the noise level is the reason I went cordless',
        'which drill should I start with?',
        'already invested in one battery system so I stay',
      ],
    },
    competitors: {
      shareOfVoice: { RYOBI: 0.34, DEWALT: 0.28, MILWAUKEE: 0.21 },
      trend: 'RYOBI holds a defensible #1 on the value / price-performance cluster',
    },
    dashboardReading: 'Mentions up across the board — a good month.',
    finding: {
      whatMoved:
        'Three slow-moving narratives converged this month: "quiet cordless" is up 3.1x MoM, battery-ecosystem loyalty framing is up 9 points, and beginner questions outpace beginner content 5:1.',
      whyItMoved:
        'None of these are visible in a single day of data. They only surface when 30 days of listening are read against 90 days of trend history \u2014 which is why this run routes to the larger model rather than the digest model.',
      whatItMeans:
        'Two of the three are first-mover openings with low competitor coverage, and the third is an unserved audience already in the comments. Together they suggest leading the next campaign with the ONE+ ecosystem promise rather than single-tool specs.',
      actions: [
        'Commission a decibel-comparison reel to claim the "quiet cordless" opening',
        'Lead the next campaign with the ONE+ ecosystem promise',
        'Launch a "first tool" beginner series and tag it for a dedicated highlight',
        'Have a human open a relationship with the three identified advocates',
      ],
      severity: 'opportunity',
    },
    baseConfidence: 0.75,
    manualHours: 9.0,
    channel: '#marketing-strategy',
    deliveredAt: '09:00',
  },
];

export const scenarioById = (id: string): Scenario =>
  scenarios.find((s) => s.id === id) ?? scenarios[0];
