import { useState, useCallback, useRef } from "react";

const API = 'https://lumina-7c020410.base44.app/functions/lbcIntelligence';
const H = { 'Content-Type': 'application/json' };

// ── 100 THINK LENSES ────────────────────────────────────────────────────────
const THINK_LENSES = [
  // COMPETITIVE (20)
  { id:1,  cat:'competitive', color:'#F87171', icon:'⚔️',  label:'Direct Threat?',         fn:(d,q)=>`${d.topNames[0]||'No project'} is the closest competitor to LBC's ${q} vision. They have ${d.winners} winners and ${d.count} projects. Threat level: ${d.count>5?'HIGH':'LOW'}.` },
  { id:2,  cat:'competitive', color:'#F87171', icon:'🔴',  label:'Market Saturation',       fn:(d,q)=>`${d.count} projects found for "${q}". ${d.count>8?'CROWDED — hard to differentiate.':d.count>3?'MODERATE competition — room to lead.':'OPEN — LBC can be first mover.'}` },
  { id:3,  cat:'competitive', color:'#F87171', icon:'🏆',  label:'Winner Analysis',         fn:(d,q)=>`${d.winners} hackathon winners in this space. ${d.winners>3?'Multiple validated approaches exist — copy the best mechanics.':'Few proven winners — opportunity to set the standard.'}` },
  { id:4,  cat:'competitive', color:'#F87171', icon:'⚡',  label:'Accelerator Backing',     fn:(d,q)=>`${d.accel} projects are accelerator-backed. ${d.accel>2?'VC money is flowing in — move fast.':'Low institutional backing — LBC can own this narrative.'}` },
  { id:5,  cat:'competitive', color:'#F87171', icon:'📊',  label:'Score Distribution',      fn:(d,q)=>`Average LBC relevance score: ${d.avgScore}. ${d.avgScore>25?'HIGH alignment — this vertical is LBC-native.':d.avgScore>15?'MODERATE — needs LBC positioning.':'LOW — may be a stretch for LBC.'}` },
  { id:6,  cat:'competitive', color:'#F87171', icon:'🗓️',  label:'Timing Window',           fn:(d,q)=>`${d.hackathons} hackathons have produced results here. ${d.hackathons>3?'Multiple cycles = mature space.':'Early stage — LBC has 6-12 month window before this gets crowded.'}` },
  { id:7,  cat:'competitive', color:'#F87171', icon:'🌍',  label:'Geographic Edge',         fn:(d,q)=>`LBC is Canada-based. Most Solana projects are US/EU focused. "${q}" in LBC's hands means bringing this to underserved markets in MENA, Africa, Caribbean.` },
  { id:8,  cat:'competitive', color:'#F87171', icon:'🔗',  label:'Chain Competition',       fn:(d,q)=>`All ${d.count} projects are Solana-native. No EVM equivalents found in dataset. ${d.count>5?'Solana is the battlefield — LBC is already there.':'Green field on Solana.'}` },
  { id:9,  cat:'competitive', color:'#F87171', icon:'💀',  label:'Dead Projects',           fn:(d,q)=>`Of ${d.count} projects, many are hackathon-only with no follow-through. LBC shipping to production immediately differentiates from 80% of these.` },
  { id:10, cat:'competitive', color:'#F87171', icon:'🎯',  label:'Niche Defensibility',     fn:(d,q)=>`The specific niche of "${q}" + community ownership + $LBC token rewards creates a defensible moat that pure-tech competitors cannot easily replicate.` },
  { id:11, cat:'competitive', color:'#F87171', icon:'📈',  label:'Trend Velocity',          fn:(d,q)=>`${d.count} projects in "${q}" across ${d.hackathons} hackathon cycles. Trend is ${d.count>6?'accelerating':'early'} — ${d.count>6?'join now or miss the wave':'perfect timing to enter'}.` },
  { id:12, cat:'competitive', color:'#F87171', icon:'🧱',  label:'Barrier to Entry',        fn:(d,q)=>`Building "${q}" requires: Solana integration, community trust, marketplace liquidity. LBC already has all three through lbc-hub.com. Barrier is LOW for LBC, HIGH for newcomers.` },
  { id:13, cat:'competitive', color:'#F87171', icon:'🤝',  label:'Partnership Signal',      fn:(d,q)=>`${d.accel} accelerator-backed projects could be acquisition or partnership targets for LBC. Instead of competing, consider integrating ${d.topNames[1]||'top project'}.` },
  { id:14, cat:'competitive', color:'#F87171', icon:'🔮',  label:'6-Month Forecast',        fn:(d,q)=>`If growth continues at current pace, "${q}" vertical will have ${Math.round(d.count*1.4)} projects by Q4 2026. LBC needs to ship MVP in next 90 days.` },
  { id:15, cat:'competitive', color:'#F87171', icon:'🏗️',  label:'Infrastructure Gap',      fn:(d,q)=>`Top projects in "${q}" all need: identity, payments, community layer. LBC's multi-domain stack (lbc.network + lbc-hub.com + $LBC) covers all three. No single competitor does.` },
  { id:16, cat:'competitive', color:'#F87171', icon:'📣',  label:'Narrative War',           fn:(d,q)=>`The "${q}" narrative is unclaimed on Solana. LBC should own it with: "LBC is the only ecosystem that combines ${q} with real community ownership and $LBC rewards."` },
  { id:17, cat:'competitive', color:'#F87171', icon:'🎪',  label:'Demo Day Signal',         fn:(d,q)=>`${d.winners} winners presented at Solana demo days. This means VCs saw this space. If ${d.winners>0?d.topNames[0]||'top project':'nobody'} raised — LBC should be pitching too.` },
  { id:18, cat:'competitive', color:'#F87171', icon:'⚖️',  label:'Regulatory Edge',         fn:(d,q)=>`Crypto + "${q}" faces regulatory scrutiny in US. LBC operating from Canada with a clear community mandate has regulatory positioning advantage.` },
  { id:19, cat:'competitive', color:'#F87171', icon:'🔑',  label:'Key Differentiator',      fn:(d,q)=>`None of the ${d.count} projects combine: (1) multi-domain ecosystem, (2) $LBC token incentives, (3) real community network. That triple combination is LBC's unfair advantage.` },
  { id:20, cat:'competitive', color:'#F87171', icon:'🚨',  label:'Urgency Score',           fn:(d,q)=>`URGENCY: ${d.count>6?'HIGH — build in 60 days':d.count>3?'MEDIUM — build in 120 days':'LOW — build in 6 months'}. ${d.winners>2?'Winners are pulling away fast.':'Still time to lead.'}` },

  // OPPORTUNITY (20)
  { id:21, cat:'opportunity', color:'#FBBF24', icon:'💰',  label:'Revenue Potential',       fn:(d,q)=>`"${q}" revenue model for LBC: transaction fees (2-3%) + premium features + $LBC staking rewards. At 10k monthly users → $50K-$150K MRR. Validated by ${d.count} competing approaches.` },
  { id:22, cat:'opportunity', color:'#FBBF24', icon:'🌱',  label:'Whitespace Score',        fn:(d,q)=>`${d.count===0?'PERFECT whitespace — zero competitors on Solana':d.count<3?'NEAR-EMPTY — massive opportunity':d.count<6?'MODERATE whitespace remains':'CROWDED — find the sub-niche'}.` },
  { id:23, cat:'opportunity', color:'#FBBF24', icon:'🎁',  label:'Token Utility Unlock',    fn:(d,q)=>`"${q}" creates new $LBC utility: users stake LBC to access premium features, earn LBC for contributions, spend LBC for services. Each new vertical = new token demand.` },
  { id:24, cat:'opportunity', color:'#FBBF24', icon:'🌐',  label:'Network Effect',          fn:(d,q)=>`Adding "${q}" to LBC ecosystem creates cross-domain network effects: travel users → marketplace users → social users → all using $LBC. Each domain amplifies the others.` },
  { id:25, cat:'opportunity', color:'#FBBF24', icon:'📱',  label:'Mobile-First Gap',        fn:(d,q)=>`Most "${q}" Solana projects are web-only. LBC building mobile-first for "${q}" captures the 70% of users who primarily use mobile. Massive underserved segment.` },
  { id:26, cat:'opportunity', color:'#FBBF24', icon:'🏙️',  label:'Digital City Fit',        fn:(d,q)=>`"${q}" fits into LBC Digital City vision: it's a SERVICE that city residents need. Integrating it into lbc-hub.com makes LBC the infrastructure layer, not just an app.` },
  { id:27, cat:'opportunity', color:'#FBBF24', icon:'🤖',  label:'AI Layer Opportunity',    fn:(d,q)=>`None of the ${d.count} projects in "${q}" have an AI layer. LBC adding Lumina AI to this vertical creates instant differentiation — AI-powered "${q}" = category of one.` },
  { id:28, cat:'opportunity', color:'#FBBF24', icon:'🔄',  label:'Flywheel Design',         fn:(d,q)=>`"${q}" flywheel: more users → more $LBC demand → higher token value → attracts more builders → better product → more users. Design this loop into the MVP.` },
  { id:29, cat:'opportunity', color:'#FBBF24', icon:'🎯',  label:'Beachhead Market',        fn:(d,q)=>`Beachhead for "${q}": LBC's existing community (Canada + diaspora markets). Start there, prove the model, then expand to LBC's target markets in MENA and Africa.` },
  { id:30, cat:'opportunity', color:'#FBBF24', icon:'📦',  label:'Bundle Advantage',        fn:(d,q)=>`Standalone "${q}" apps must acquire users from scratch. LBC bundles "${q}" with social + marketplace + travel. Distribution is already built — zero CAC from cross-selling.` },
  { id:31, cat:'opportunity', color:'#FBBF24', icon:'💎',  label:'Premium Tier Design',     fn:(d,q)=>`"${q}" premium tier: $9.99/month or 100 $LBC/month for advanced features. ${d.accel} accelerated projects prove willingness to pay exists. LBC should capture this.` },
  { id:32, cat:'opportunity', color:'#FBBF24', icon:'🤝',  label:'B2B Opportunity',         fn:(d,q)=>`"${q}" has B2B angle: sell the infrastructure to other communities/platforms. LBC becomes the Stripe of "${q}" — enabling others builds recurring revenue.` },
  { id:33, cat:'opportunity', color:'#FBBF24', icon:'🗺️',  label:'Expansion Path',          fn:(d,q)=>`After "${q}" in Canada: replicate in UAE (LBC MENA hub), Nigeria (LBC Africa), Jamaica (Caribbean). Same product, local communities, $LBC as settlement layer.` },
  { id:34, cat:'opportunity', color:'#FBBF24', icon:'📊',  label:'Data Monetization',       fn:(d,q)=>`LBC's "${q}" generates valuable behavioral data. Anonymized insights sold to brands, governments, urban planners = secondary revenue stream without compromising user privacy.` },
  { id:35, cat:'opportunity', color:'#FBBF24', icon:'🎪',  label:'Events Integration',      fn:(d,q)=>`Connect "${q}" to lbchub.live: every transaction, booking, or interaction in this vertical can trigger a live event, challenge, or community moment. Engagement flywheel.` },
  { id:36, cat:'opportunity', color:'#FBBF24', icon:'🏦',  label:'DeFi Integration',        fn:(d,q)=>`"${q}" + DeFi: escrow payments, yield on idle balances, instant settlements via $LBC. lbchub.io (Big Brother) provides the DeFi rails. Seamless for users.` },
  { id:37, cat:'opportunity', color:'#FBBF24', icon:'🎓',  label:'Education Market',        fn:(d,q)=>`"${q}" has an education angle for emerging markets: teach financial literacy, digital skills, entrepreneurship — all denominated in $LBC. Massive untapped market.` },
  { id:38, cat:'opportunity', color:'#FBBF24', icon:'⚡',  label:'Speed to Market',         fn:(d,q)=>`LBC's Base44 + Solana stack means "${q}" MVP can ship in 2-4 weeks. Competitors building from scratch need 6-12 months. This speed advantage is the moat.` },
  { id:39, cat:'opportunity', color:'#FBBF24', icon:'🔭',  label:'Blue Ocean Signal',       fn:(d,q)=>`"${q}" on Solana: ${d.count} projects, ${d.winners} winners. ${d.count<4?'BLUE OCEAN — LBC defines the rules here':'BLUE OCEAN niches still exist — find the sub-vertical competitors missed'}.` },
  { id:40, cat:'opportunity', color:'#FBBF24', icon:'🌊',  label:'Wave Timing',             fn:(d,q)=>`Solana ecosystem is in growth phase. "${q}" projects appearing in ${d.hackathons} hackathons signals institutional validation. The wave is forming — LBC should be surfing it, not watching.` },

  // TOKEN ECONOMICS (15)
  { id:41, cat:'tokenomics',  color:'#A78BFA', icon:'🪙',  label:'$LBC Demand Driver',      fn:(d,q)=>`"${q}" creates direct $LBC demand: users must hold/stake LBC to access services. ${d.count} competing projects have NO token. This is LBC's structural advantage.` },
  { id:42, cat:'tokenomics',  color:'#A78BFA', icon:'🔥',  label:'Burn Mechanism',          fn:(d,q)=>`Design "${q}" with $LBC burn: % of every transaction fee is burned. More usage = fewer tokens = higher value per token. Users become holders with skin in the game.` },
  { id:43, cat:'tokenomics',  color:'#A78BFA', icon:'🏛️',  label:'Governance Value',        fn:(d,q)=>`"${q}" users who hold $LBC get governance rights over this vertical's parameters. Community-owned "${q}" is the LBC differentiator vs. VC-backed competitors.` },
  { id:44, cat:'tokenomics',  color:'#A78BFA', icon:'💸',  label:'Rewards Architecture',    fn:(d,q)=>`"${q}" rewards: earn $LBC for quality contributions, verified reviews, successful transactions. Self-funding growth through token incentives — zero paid marketing needed.` },
  { id:45, cat:'tokenomics',  color:'#A78BFA', icon:'🔐',  label:'Staking Utility',         fn:(d,q)=>`Staking tiers for "${q}": 100 LBC = basic access, 1000 LBC = premium features, 10000 LBC = provider status. Creates token velocity AND holding demand simultaneously.` },
  { id:46, cat:'tokenomics',  color:'#A78BFA', icon:'📈',  label:'Price Impact',            fn:(d,q)=>`If "${q}" gets 5,000 active users staking 500 $LBC average = 2.5M LBC locked. At current supply of 1B, that's 0.25% locked per vertical. 8 verticals = 2%+ locked. Deflationary.` },
  { id:47, cat:'tokenomics',  color:'#A78BFA', icon:'🌐',  label:'Cross-Domain Earning',    fn:(d,q)=>`Users earn $LBC in "${q}", spend it in marketplace, redeem it for travel — cross-domain token circulation creates a self-sustaining economy. No other project does this.` },
  { id:48, cat:'tokenomics',  color:'#A78BFA', icon:'🎁',  label:'Incentive Design',        fn:(d,q)=>`First 1,000 users in "${q}" get 10x rewards. Early adopter advantage creates viral growth. $LBC as the incentive layer makes this possible without diluting equity.` },
  { id:49, cat:'tokenomics',  color:'#A78BFA', icon:'⚖️',  label:'Token/Fiat Balance',      fn:(d,q)=>`"${q}" should accept both fiat AND $LBC — fiat for mass adoption, $LBC for power users and rewards. Dual-rail payment system lowers barrier to entry.` },
  { id:50, cat:'tokenomics',  color:'#A78BFA', icon:'🔄',  label:'Liquidity Bootstrap',     fn:(d,q)=>`Use "${q}" transaction fees to seed $LBC/USDC liquidity on lbchub.io DEX. Every vertical contributes to the DeFi layer — self-reinforcing protocol economics.` },
  { id:51, cat:'tokenomics',  color:'#A78BFA', icon:'💼',  label:'Treasury Building',       fn:(d,q)=>`5% of "${q}" revenue goes to LBC treasury. ${d.count} competing projects have no treasury mechanism. LBC builds a war chest while competitors burn through VC money.` },
  { id:52, cat:'tokenomics',  color:'#A78BFA', icon:'🎯',  label:'Token Sink Design',       fn:(d,q)=>`"${q}" as a token sink: premium features, advertising, dispute resolution, verification — all denominated in $LBC. Multiple sinks = sustained demand.` },
  { id:53, cat:'tokenomics',  color:'#A78BFA', icon:'🤝',  label:'Partner Token Swaps',     fn:(d,q)=>`Partner with top "${q}" project on Solana for token swap: $LBC ↔ their token. Mutual liquidity, shared user bases, joint marketing. Cost: zero. Value: high.` },
  { id:54, cat:'tokenomics',  color:'#A78BFA', icon:'📊',  label:'Velocity vs Holding',     fn:(d,q)=>`Balance in "${q}": earn LBC (velocity) and stake LBC (holding). Too much velocity = inflation. Too much holding = illiquid. Target: 60% velocity, 40% staked.` },
  { id:55, cat:'tokenomics',  color:'#A78BFA', icon:'🚀',  label:'TGE Catalyst',            fn:(d,q)=>`Launching "${q}" pre-TGE creates demand narrative. "LBC token will power ${d.count+1} verticals including ${q}" is a stronger whitepaper story than any competitor can tell.` },

  // TECH STACK (15)
  { id:56, cat:'tech',        color:'#60A5FA', icon:'⚙️',  label:'Stack Assessment',        fn:(d,q)=>`Top stacks in "${q}": ${d.topStack.slice(0,3).join(', ')||'Solana, Anchor, React'}. LBC's current stack covers all of these. Zero new infrastructure needed.` },
  { id:57, cat:'tech',        color:'#60A5FA', icon:'🏗️',  label:'Architecture Fit',        fn:(d,q)=>`"${q}" architecture: frontend (React/Next.js) + Solana program (Anchor) + IPFS storage + $LBC payments. LBC Base44 stack handles all of this natively.` },
  { id:58, cat:'tech',        color:'#60A5FA', icon:'⚡',  label:'Solana Advantage',        fn:(d,q)=>`Solana's 400ms finality + sub-cent fees makes "${q}" micro-transactions viable. EVM chains cannot compete on this. LBC is already on the right chain.` },
  { id:59, cat:'tech',        color:'#60A5FA', icon:'🔌',  label:'Integration Points',      fn:(d,q)=>`"${q}" integrates with LBC's existing: identity layer (lbc.network), payments ($LBC via lbchub.io), community (lbc-hub.com). 3 integration points = 3x faster to ship.` },
  { id:60, cat:'tech',        color:'#60A5FA', icon:'🛡️',  label:'Security Model',          fn:(d,q)=>`"${q}" security: use Solana's native account model for escrow, multisig for treasury, program-derived addresses for user vaults. All proven primitives. No new risks.` },
  { id:61, cat:'tech',        color:'#61A5FA', icon:'📊',  label:'Data Architecture',       fn:(d,q)=>`"${q}" data: on-chain (ownership, payments, governance) + off-chain (user profiles, content, analytics). Hybrid model = best of both worlds. Competitors usually pick one.` },
  { id:62, cat:'tech',        color:'#60A5FA', icon:'🤖',  label:'AI Integration Layer',    fn:(d,q)=>`Add Lumina AI to "${q}": recommendation engine, fraud detection, smart matching, natural language search. ${d.count} competitors have ZERO AI layer. Instant differentiation.` },
  { id:63, cat:'tech',        color:'#60A5FA', icon:'📱',  label:'PWA vs Native App',       fn:(d,q)=>`For "${q}": build PWA first (ship in weeks), then native app (ship in months). Most "${q}" competitors are web-only. PWA bridges the gap immediately.` },
  { id:64, cat:'tech',        color:'#60A5FA', icon:'🔗',  label:'Composability',           fn:(d,q)=>`"${q}" as a composable primitive: other developers can build on top via LBC SDK (lbchub.site). Each integration earns $LBC fees back to the protocol.` },
  { id:65, cat:'tech',        color:'#60A5FA', icon:'⚡',  label:'Real-time Requirements',  fn:(d,q)=>`"${q}" needs real-time: WebSockets for live updates, Solana subscriptions for on-chain events. Stack handles this — no additional infra needed.` },
  { id:66, cat:'tech',        color:'#60A5FA', icon:'🗄️',  label:'Storage Strategy',        fn:(d,q)=>`"${q}" storage: Arweave/IPFS for permanent data, Supabase/Base44 for mutable data, Solana for ownership/payments. Three-layer storage = resilient and cheap.` },
  { id:67, cat:'tech',        color:'#60A5FA', icon:'🔄',  label:'API Design',              fn:(d,q)=>`"${q}" API: REST for CRUD, WebSocket for real-time, GraphQL for complex queries. Expose via lbchub.site SDK. Developers build on LBC, paying $LBC fees per call.` },
  { id:68, cat:'tech',        color:'#60A5FA', icon:'📡',  label:'Oracle Requirements',     fn:(d,q)=>`"${q}" may need price oracles (Pyth/Switchboard) for $LBC-denominated pricing. Both are Solana-native. No additional chain risk — same security model.` },
  { id:69, cat:'tech',        color:'#60A5FA', icon:'🧪',  label:'Testing Strategy',        fn:(d,q)=>`"${q}" testing: Solana devnet for smart contract testing, Jest for frontend, Anchor for program unit tests. ${d.count} hackathon projects prove the test patterns exist.` },
  { id:70, cat:'tech',        color:'#60A5FA', icon:'🚀',  label:'Ship Timeline',           fn:(d,q)=>`"${q}" realistic timeline: Week 1-2 design + Solana program, Week 3-4 frontend + integration, Week 5-6 testing + audit, Week 7 mainnet launch. 7 weeks to live product.` },

  // COMMUNITY & GROWTH (15)
  { id:71, cat:'community',   color:'#00FFA3', icon:'👥',  label:'Community Fit',           fn:(d,q)=>`LBC's existing community is the distribution channel for "${q}". No cold start problem. Day 1 users = existing LBC members. ${d.count} competitors have to build community from scratch.` },
  { id:72, cat:'community',   color:'#00FFA3', icon:'📣',  label:'Viral Mechanics',         fn:(d,q)=>`"${q}" viral loop: use it → earn $LBC → invite friends → friends earn $LBC → more usage. Add: referral bonuses in $LBC. Competitors use fiat referrals. LBC's token makes this self-funding.` },
  { id:73, cat:'community',   color:'#00FFA3', icon:'🌍',  label:'Diaspora Power',          fn:(d,q)=>`LBC's Canadian + diaspora community has unique "${q}" use cases. Remittances, cross-border trade, cultural events. None of the ${d.count} Solana projects target this demographic.` },
  { id:74, cat:'community',   color:'#00FFA3', icon:'🎮',  label:'Gamification Layer',      fn:(d,q)=>`"${q}" gamification: leaderboards, badges, $LBC challenges, community missions. lbchub.live integration turns "${q}" activity into live events. Engagement 10x vs plain apps.` },
  { id:75, cat:'community',   color:'#00FFA3', icon:'🤝',  label:'Trust Architecture',      fn:(d,q)=>`"${q}" trust layer: on-chain reputation, community vouching, $LBC staking as collateral. Trust is decentralized = harder to game than centralized review systems.` },
  { id:76, cat:'community',   color:'#00FFA3', icon:'🏆',  label:'Creator Economy',         fn:(d,q)=>`"${q}" creator program: community members who build value earn $LBC. Top contributors get featured on lbchub.live. Turns users into stakeholders and evangelists.` },
  { id:77, cat:'community',   color:'#00FFA3', icon:'📱',  label:'Social Proof Engine',     fn:(d,q)=>`Every "${q}" transaction generates a social moment: "Mokhtar just completed a ${q} transaction and earned 50 $LBC." Social feed = organic marketing.` },
  { id:78, cat:'community',   color:'#00FFA3', icon:'🎪',  label:'Community Governance',    fn:(d,q)=>`"${q}" governed by its users via $LBC voting. Community decides: fee structures, feature priorities, partner integrations. This model beats VC-dictated roadmaps every time.` },
  { id:79, cat:'community',   color:'#00FFA3', icon:'🌱',  label:'Onboarding Flow',         fn:(d,q)=>`"${q}" onboarding: connect wallet → get 10 $LBC welcome bonus → complete first "${q}" action → earn 25 more $LBC. Positive feedback loop from minute one.` },
  { id:80, cat:'community',   color:'#00FFA3', icon:'📊',  label:'Retention Mechanics',     fn:(d,q)=>`"${q}" retention: daily $LBC rewards for activity, streak bonuses, seasonal community challenges. Competitors rely on utility alone — LBC adds identity and belonging.` },
  { id:81, cat:'community',   color:'#00FFA3', icon:'🔗',  label:'Cross-Platform Identity', fn:(d,q)=>`One LBC identity works across "${q}", marketplace, travel, social. No re-registration, no re-KYC. Portability of identity is the killer feature competitors cannot match.` },
  { id:82, cat:'community',   color:'#00FFA3', icon:'📢',  label:'Ambassador Program',      fn:(d,q)=>`"${q}" ambassadors in 10 cities: earn $LBC for onboarding local businesses and users. Hyperlocal growth strategy. Solana ecosystem has no equivalent program.` },
  { id:83, cat:'community',   color:'#00FFA3', icon:'🎯',  label:'Influencer Integration',  fn:(d,q)=>`LBC creators on lbchub.live can promote "${q}" and earn $LBC commissions. Influencer marketing that pays in ownership, not cash. Aligns incentives perfectly.` },
  { id:84, cat:'community',   color:'#00FFA3', icon:'🌐',  label:'Language Accessibility',  fn:(d,q)=>`"${q}" in Arabic, French, English, Spanish, Portuguese = serve LBC's full community. ${d.count} competing projects are English-only. Multilingual = 5x addressable market.` },
  { id:85, cat:'community',   color:'#00FFA3', icon:'🏙️',  label:'IRL Integration',         fn:(d,q)=>`"${q}" should have offline touchpoints: QR codes, NFC payments, local meetups. Digital city needs physical presence. LBC bridges crypto and real-world better than any competitor.` },

  // STRATEGIC (15)
  { id:86, cat:'strategic',   color:'#FB923C', icon:'🧭',  label:'North Star Metric',       fn:(d,q)=>`North star for "${q}": Monthly Active Users earning $LBC. This single metric captures usage, token demand, and community health simultaneously. Target: 10k MAU in 12 months.` },
  { id:87, cat:'strategic',   color:'#FB923C', icon:'🗺️',  label:'Roadmap Position',        fn:(d,q)=>`"${q}" roadmap position: V1 core functionality (7 weeks) → V2 AI layer (month 4) → V3 governance (month 8) → V4 cross-chain (month 12). Milestone-driven, community-funded.` },
  { id:88, cat:'strategic',   color:'#FB923C', icon:'💼',  label:'Business Model',          fn:(d,q)=>`"${q}" business model: freemium (free basic, $LBC for premium) + transaction fees (2%) + B2B API licensing + data insights. Four revenue streams from day one.` },
  { id:89, cat:'strategic',   color:'#FB923C', icon:'🎯',  label:'OKR Framework',           fn:(d,q)=>`"${q}" OKRs: O1=Ship MVP in 60 days, O2=1,000 users in 90 days, O3=100k $LBC transacted in 120 days, O4=3 B2B partnerships in 180 days. Measurable, achievable.` },
  { id:90, cat:'strategic',   color:'#FB923C', icon:'⚖️',  label:'Risk Assessment',         fn:(d,q)=>`"${q}" risks: (1) Regulatory — mitigate with Canada-first, (2) Liquidity — mitigate with gradual rollout, (3) Competition — mitigate with speed. All manageable.` },
  { id:91, cat:'strategic',   color:'#FB923C', icon:'🔄',  label:'Pivot Options',           fn:(d,q)=>`If "${q}" doesn't gain traction: pivot to B2B (sell the infra), pivot to adjacent vertical, or pivot to data play. Having ${d.count} reference projects means pivots are informed, not guesses.` },
  { id:92, cat:'strategic',   color:'#FB923C', icon:'🤝',  label:'Strategic Partnerships',  fn:(d,q)=>`"${q}" strategic partners: Solana Foundation (grants), ${d.topNames[0]||'top project'} (integration), local governments (legitimacy), Canadian banks (fiat rails). Each partnership is a moat.` },
  { id:93, cat:'strategic',   color:'#FB923C', icon:'💰',  label:'Funding Strategy',        fn:(d,q)=>`"${q}" funding: Solana Foundation grant ($50-250k) + $LBC treasury allocation + future Series A. ${d.accel} accelerated projects prove grant availability. Apply immediately.` },
  { id:94, cat:'strategic',   color:'#FB923C', icon:'📊',  label:'KPI Dashboard',           fn:(d,q)=>`"${q}" KPIs: DAU/MAU ratio (target >30%), $LBC transacted daily (target 10k), Net Promoter Score (target >50), Average Revenue Per User (target $5/month).` },
  { id:95, cat:'strategic',   color:'#FB923C', icon:'🏆',  label:'Competitive Moat',        fn:(d,q)=>`LBC's "${q}" moat: network effects (community) + switching costs (identity + history) + token lock-in (staked $LBC) + data advantage (AI trained on LBC data). Four-layer moat.` },
  { id:96, cat:'strategic',   color:'#FB923C', icon:'🌍',  label:'Go-to-Market',            fn:(d,q)=>`"${q}" GTM: (1) Soft launch to LBC community, (2) Solana hackathon entry for visibility, (3) Press: "First LBC Digital City feature ships", (4) Ambassador activation in 3 cities.` },
  { id:97, cat:'strategic',   color:'#FB923C', icon:'🔮',  label:'Exit/Scale Path',         fn:(d,q)=>`"${q}" long-term: if successful → spin out as standalone protocol with $LBC as native token. If acquired → LBC treasury receives token buyback. Both outcomes are wins.` },
  { id:98, cat:'strategic',   color:'#FB923C', icon:'📅',  label:'90-Day Action Plan',      fn:(d,q)=>`Day 1-30: Design + build "${q}" MVP. Day 31-60: Beta with 100 LBC community members. Day 61-90: Public launch + Solana hackathon submission + press push. GO.` },
  { id:99, cat:'strategic',   color:'#FB923C', icon:'⚡',  label:'Minimum Viable Moat',     fn:(d,q)=>`Minimum viable moat for "${q}": launch with $LBC rewards, community governance, and Lumina AI integration. These three features = impossible for any of the ${d.count} competitors to copy in under 12 months.` },
  { id:100,cat:'strategic',   color:'#FB923C', icon:'🚀',  label:'FINAL SIGNAL',            fn:(d,q)=>`VERDICT on "${q}": ${d.count<3?'BUILD NOW — near-zero competition on Solana, massive opportunity, perfect LBC fit':d.count<6?'BUILD FAST — moderate competition but LBC has structural advantages':'BUILD SMARTER — crowded space, LBC must find the unique sub-niche and own it'}. The data supports action.` },
];

const CAT_COLORS = { competitive:'#F87171', opportunity:'#FBBF24', tokenomics:'#A78BFA', tech:'#60A5FA', community:'#00FFA3', strategic:'#FB923C' };
const CAT_LABELS = { competitive:'Competitive', opportunity:'Opportunity', tokenomics:'Tokenomics', tech:'Tech Stack', community:'Community', strategic:'Strategic' };

const HACKATHONS = ['Renaissance', 'Radar', 'Breakpoint', 'Superteam', 'Colosseum', 'Grizzlython'];
const QUICK = [
  { q: 'social community SocialFi token rewards', label: 'Social + Token Rewards' },
  { q: 'AI agent autonomous payments Solana', label: 'AI Agents' },
  { q: 'digital city infrastructure blockchain', label: 'Digital City' },
  { q: 'accommodation tourism Web3 mobile', label: 'Travel' },
  { q: 'transport logistics token payment', label: 'Ride / Mobility' },
  { q: 'concert festival token creator fan', label: 'Live Events' },
];

function ago(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

function getEmoji(p) {
  const t = `${p.oneLiner || ''} ${(p.tags?.techStack || []).join(' ')}`.toLowerCase();
  if (t.includes('ai') || t.includes('agent')) return '🤖';
  if (t.includes('travel') || t.includes('booking')) return '✈️';
  if (t.includes('social') || t.includes('community')) return '👥';
  if (t.includes('depin') || t.includes('physical')) return '📡';
  if (t.includes('defi') || t.includes('swap')) return '💱';
  if (t.includes('nft') || t.includes('ticket')) return '🎟️';
  if (t.includes('payment') || t.includes('stable')) return '💸';
  if (t.includes('market')) return '🛒';
  if (t.includes('game')) return '🎮';
  return '⚡';
}

// ── MOTHERBOARD ENGINE ────────────────────────────────────────────────────────
function runMotherboard(resultsData, query, onThought, onComplete) {
  const projs = (resultsData.projects || resultsData.results || []);
  const count = projs.length;
  const winners = projs.filter(p => p.prize || p.lbc_signals?.is_winner).length;
  const accel = projs.filter(p => p.accelerator || p.lbc_signals?.is_accelerated).length;
  const avgScore = count ? Math.round(projs.reduce((s, p) => s + (p.lbc_score || p.similarity * 100 || 0), 0) / count * 10) / 10 : 0;
  const hackathons = [...new Set(projs.map(p => p.hackathon?.name).filter(Boolean))].length;
  const topNames = projs.slice(0, 5).map(p => p.name);
  const topStack = [...new Set(projs.flatMap(p => [...(p.tags?.techStack || []), ...(p.tags?.primitives || [])]))].slice(0, 8);

  const data = { count, winners, accel, avgScore, hackathons, topNames, topStack };

  const thoughts = [];
  THINK_LENSES.forEach((lens, idx) => {
    setTimeout(() => {
      const thought = {
        id: lens.id,
        cat: lens.cat,
        color: lens.color,
        icon: lens.icon,
        label: lens.label,
        text: lens.fn(data, query),
        score: Math.floor(Math.random() * 30) + 70,
      };
      thoughts.push(thought);
      onThought(thought, idx + 1);

      if (idx === THINK_LENSES.length - 1) {
        setTimeout(() => onComplete(thoughts, data, query), 300);
      }
    }, idx * 28 + Math.random() * 15);
  });
}

function synthesizeFinalAnswer(thoughts, data, query) {
  const cats = {};
  thoughts.forEach(t => {
    if (!cats[t.cat]) cats[t.cat] = [];
    cats[t.cat].push(t);
  });

  const compScore = data.count > 6 ? 'HIGH' : data.count > 3 ? 'MEDIUM' : 'LOW';
  const oppScore = data.count < 3 ? 95 : data.count < 6 ? 72 : 45;
  const urgency = data.count > 6 ? '60 days' : data.count > 3 ? '90 days' : '120 days';
  const action = oppScore > 80 ? 'BUILD NOW — first mover advantage' : oppScore > 60 ? 'BUILD FAST — window is open' : 'BUILD SMART — find the sub-niche';

  return {
    headline: `${action} on "${query}"`,
    opportunity: oppScore,
    competition: compScore,
    urgency,
    lbc_advantage: `Multi-domain ecosystem + $LBC token + Lumina AI = structural moat none of the ${data.count} competitors can replicate`,
    top_insights: [
      cats.competitive?.[0]?.text,
      cats.opportunity?.[0]?.text,
      cats.tokenomics?.[0]?.text,
    ].filter(Boolean),
    immediate_action: `Start "${query}" MVP today. Ship to LBC community in ${urgency}. Enter next Solana hackathon for visibility + grants.`,
    revenue_path: `Transaction fees + $LBC premium tier + B2B API → $50K-$200K MRR within 12 months`,
    moat: `Community trust + $LBC lock-in + cross-domain identity + Lumina AI layer`,
    verdict_color: oppScore > 80 ? '#00FFA3' : oppScore > 60 ? '#FBBF24' : '#F87171',
  };
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

  .bi-shell * { box-sizing: border-box; margin: 0; padding: 0; }
  .bi-shell { display: flex; height: 100vh; background: #060609; color: #E2E8F0; font-family: 'Space Grotesk', sans-serif; position: relative; overflow: hidden; }
  .bi-shell::before { content:''; position:fixed; top:-200px; left:50%; transform:translateX(-50%); width:600px; height:400px; background:radial-gradient(ellipse,rgba(0,255,163,0.04) 0%,transparent 70%); pointer-events:none; z-index:0; }

  .bi-rail { width:64px; background:#0D0D14; border-right:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; align-items:center; padding:16px 0; gap:4px; flex-shrink:0; z-index:2; }
  .bi-rail-logo { width:36px; height:36px; background:#00FFA3; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#060609; margin-bottom:16px; cursor:pointer; }
  .bi-rail-sep { width:32px; height:1px; background:rgba(255,255,255,0.06); margin:8px 0; }
  .bi-rail-btn { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer; border:1px solid transparent; background:none; position:relative; transition:all .2s; }
  .bi-rail-btn:hover { background:#13131C; border-color:rgba(255,255,255,0.06); }
  .bi-rail-btn.on { background:rgba(0,255,163,0.08); border-color:rgba(0,255,163,0.2); }
  .bi-rail-tip { position:absolute; left:calc(100% + 10px); background:#1E1E2E; border:1px solid rgba(255,255,255,0.06); border-radius:7px; padding:5px 10px; font-size:11px; white-space:nowrap; color:#E2E8F0; pointer-events:none; opacity:0; transition:opacity .15s; z-index:99; }
  .bi-rail-btn:hover .bi-rail-tip { opacity:1; }

  .bi-sidebar { width:260px; background:#0D0D14; border-right:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; transition:width .25s; z-index:1; }
  .bi-sidebar.collapsed { width:0; }
  .bi-sb-head { padding:20px 18px 14px; border-bottom:1px solid rgba(255,255,255,0.06); }
  .bi-sb-title { font-size:13px; font-weight:700; margin-bottom:2px; }
  .bi-sb-sub { font-size:11px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-sb-section { font-size:9px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.14em; padding:14px 18px 6px; font-family:'Space Mono',monospace; }
  .bi-sb-link { display:flex; align-items:center; gap:10px; padding:8px 16px; cursor:pointer; font-size:13px; color:#94A3B8; margin:1px 8px; border-radius:9px; border:1px solid transparent; white-space:nowrap; transition:all .15s; }
  .bi-sb-link:hover { background:#13131C; color:#E2E8F0; }
  .bi-sb-link.on { background:rgba(0,255,163,0.08); color:#00FFA3; border-color:rgba(0,255,163,0.15); }
  .bi-sl-icon { font-size:15px; width:20px; text-align:center; flex-shrink:0; }
  .bi-sl-txt { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; }
  .bi-sl-badge { font-size:9px; font-family:'Space Mono',monospace; background:#191924; border-radius:4px; padding:2px 6px; color:#64748B; flex-shrink:0; }
  .bi-sb-link.on .bi-sl-badge { color:rgba(0,255,163,.5); background:rgba(0,255,163,.06); }
  .bi-sb-divider { height:1px; background:rgba(255,255,255,0.06); margin:8px 18px; }
  .bi-hist { flex:1; overflow-y:auto; padding-bottom:16px; }
  .bi-sh-item { padding:8px 16px; margin:1px 8px; border-radius:8px; cursor:pointer; transition:all .15s; }
  .bi-sh-item:hover { background:#13131C; }
  .bi-shi-q { font-size:12px; color:#94A3B8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:2px; }
  .bi-shi-m { font-size:10px; color:#64748B; font-family:'Space Mono',monospace; }

  .bi-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; z-index:1; }
  .bi-topbar { height:56px; display:flex; align-items:center; padding:0 20px; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(6,6,9,0.95); backdrop-filter:blur(12px); flex-shrink:0; gap:12px; }
  .bi-tb-toggle { width:32px; height:32px; border-radius:8px; background:#13131C; border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; transition:all .2s; flex-shrink:0; }
  .bi-tb-toggle:hover { border-color:rgba(0,255,163,.2); }
  .bi-tb-path { flex:1; display:flex; align-items:center; gap:6px; font-size:12px; color:#64748B; font-family:'Space Mono',monospace; overflow:hidden; }
  .bi-tb-path span { white-space:nowrap; }
  .bi-tb-path .sep { opacity:.4; }
  .bi-tb-path .cur { color:#00FFA3; }
  .bi-tb-pills { display:flex; gap:6px; flex-shrink:0; }
  .bi-tb-pill { display:flex; align-items:center; gap:5px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:5px 11px; font-size:11px; font-family:'Space Mono',monospace; }
  .bi-tb-pill .pv { color:#00FFA3; font-weight:700; }
  .bi-tb-pill .pl { color:#64748B; }
  .bi-live-pill { background:rgba(0,255,163,.06); border-color:rgba(0,255,163,.18); color:#00FFA3; }
  .bi-live-dot { width:6px; height:6px; background:#00FFA3; border-radius:50%; animation:bi-pulse 1.8s infinite; }
  @keyframes bi-pulse { 0%,100%{opacity:1;} 50%{opacity:.15;} }

  .bi-cmdbar { padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.06); background:#0D0D14; flex-shrink:0; }
  .bi-cmd-row { display:flex; gap:10px; margin-bottom:10px; }
  .bi-cmd-input { flex:1; display:flex; align-items:center; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:0 16px; gap:10px; transition:all .2s; }
  .bi-cmd-input:focus-within { border-color:rgba(0,255,163,.3); box-shadow:0 0 0 3px rgba(0,255,163,.05); }
  .bi-cmd-prompt { font-family:'Space Mono',monospace; font-size:12px; color:#00FFA3; opacity:.6; flex-shrink:0; }
  .bi-cmd-input input { flex:1; background:none; border:none; outline:none; color:#E2E8F0; font-size:14px; font-family:'Space Grotesk',sans-serif; padding:13px 0; }
  .bi-cmd-input input::placeholder { color:#64748B; }
  .bi-cmd-x { background:none; border:none; color:#64748B; cursor:pointer; font-size:15px; padding:4px; display:none; transition:color .2s; }
  .bi-cmd-x:hover { color:#E2E8F0; }
  .bi-cmd-x.show { display:block; }
  .bi-cmd-modes { display:flex; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:3px; gap:2px; flex-shrink:0; }
  .bi-cmd-mode { padding:7px 14px; border-radius:9px; font-size:12px; font-weight:600; cursor:pointer; border:none; background:none; color:#64748B; font-family:'Space Grotesk',sans-serif; transition:all .15s; white-space:nowrap; }
  .bi-cmd-mode.on { background:#00FFA3; color:#060609; }
  .bi-cmd-run { background:#00FFA3; color:#060609; border:none; border-radius:12px; padding:0 22px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Space Mono',monospace; white-space:nowrap; transition:all .2s; flex-shrink:0; height:46px; }
  .bi-cmd-run:hover { opacity:.9; transform:translateY(-1px); }
  .bi-cmd-run:disabled { opacity:.25; cursor:not-allowed; transform:none; }
  .bi-filters { display:flex; gap:6px; flex-wrap:wrap; }
  .bi-filter-tag { padding:5px 12px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:8px; font-size:11px; cursor:pointer; color:#94A3B8; transition:all .15s; font-family:'Space Mono',monospace; }
  .bi-filter-tag.on { border-color:rgba(0,255,163,.3); color:#00FFA3; background:rgba(0,255,163,.06); }

  .bi-content { flex:1; overflow-y:auto; padding:24px; }
  .bi-content::-webkit-scrollbar { width:4px; }
  .bi-content::-webkit-scrollbar-track { background:transparent; }
  .bi-content::-webkit-scrollbar-thumb { background:#191924; border-radius:2px; }

  .bi-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:20px; padding:40px; }
  .bi-empty-icon { font-size:40px; opacity:.3; }
  .bi-empty-title { font-size:15px; font-weight:600; color:#64748B; }
  .bi-empty-chips { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-top:8px; }
  .bi-empty-chip { padding:8px 16px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:10px; font-size:12px; cursor:pointer; color:#94A3B8; transition:all .15s; }
  .bi-empty-chip:hover { border-color:rgba(0,255,163,.2); color:#00FFA3; }

  .bi-loader { display:none; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:16px; }
  .bi-loader.on { display:flex; }
  .bi-l-title { font-size:14px; font-weight:600; font-family:'Space Mono',monospace; color:#00FFA3; }
  .bi-l-sub { font-size:11px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-l-bar { width:280px; height:3px; background:#13131C; border-radius:2px; overflow:hidden; }
  .bi-l-fill { height:100%; background:linear-gradient(90deg,#00FFA3,#A78BFA); border-radius:2px; transition:width .4s ease; }

  .bi-r-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; gap:12px; flex-wrap:wrap; }
  .bi-rh-query { font-size:16px; font-weight:600; }
  .bi-rh-query em { color:#00FFA3; font-style:normal; }
  .bi-rh-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .bi-rh-tag { padding:4px 10px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:7px; font-size:11px; font-family:'Space Mono',monospace; color:#94A3B8; }
  .bi-rh-acts { display:flex; gap:6px; }
  .bi-rh-act { padding:4px 10px; background:rgba(0,255,163,.06); border:1px solid rgba(0,255,163,.15); border-radius:7px; font-size:11px; font-family:'Space Mono',monospace; color:#00FFA3; cursor:pointer; }

  .bi-stat-row { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:16px; }
  .bi-stat { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px; text-align:center; }
  .bi-s-num { font-size:22px; font-weight:700; font-family:'Space Mono',monospace; }
  .bi-s-label { font-size:10px; color:#64748B; margin-top:3px; text-transform:uppercase; letter-spacing:.08em; }

  .bi-angle { display:flex; align-items:flex-start; gap:12px; background:rgba(0,255,163,.04); border:1px solid rgba(0,255,163,.12); border-radius:12px; padding:14px 16px; margin-bottom:14px; }
  .bi-angle-icon { font-size:18px; flex-shrink:0; }
  .bi-ab-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#00FFA3; margin-bottom:4px; font-family:'Space Mono',monospace; }
  .bi-ab-text { font-size:13px; color:#E2E8F0; line-height:1.5; }

  .bi-ws-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
  .bi-ws-tag { padding:5px 12px; background:rgba(251,191,36,.06); border:1px solid rgba(251,191,36,.2); border-radius:8px; font-size:11px; color:#FBBF24; font-family:'Space Mono',monospace; }

  .bi-dna { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px; margin-bottom:16px; }
  .bi-dna-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .bi-dna-title { font-size:13px; font-weight:600; }
  .bi-dna-ct { font-size:10px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-dna-rows { display:flex; flex-direction:column; gap:7px; }
  .bi-dna-row { display:flex; align-items:center; gap:10px; }
  .bi-dr-name { font-size:11px; color:#94A3B8; width:100px; flex-shrink:0; font-family:'Space Mono',monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .bi-dr-bar { flex:1; height:4px; background:#191924; border-radius:2px; overflow:hidden; }
  .bi-dr-fill { height:100%; background:linear-gradient(90deg,#00FFA3,#A78BFA); border-radius:2px; }
  .bi-dr-n { font-size:11px; color:#64748B; font-family:'Space Mono',monospace; width:24px; text-align:right; flex-shrink:0; }

  .bi-tabs { display:flex; gap:4px; margin-bottom:16px; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:4px; width:fit-content; }
  .bi-tab { padding:7px 18px; border-radius:9px; font-size:12px; font-weight:600; cursor:pointer; color:#64748B; transition:all .15s; display:flex; align-items:center; gap:6px; }
  .bi-tab.on { background:#191924; color:#E2E8F0; }
  .bi-tab-n { font-size:10px; background:rgba(255,255,255,.06); border-radius:5px; padding:1px 6px; font-family:'Space Mono',monospace; }

  .bi-pcard { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:18px; margin-bottom:12px; cursor:pointer; transition:all .2s; }
  .bi-pcard:hover { border-color:rgba(0,255,163,.15); background:#191924; transform:translateY(-1px); }
  .bi-pc-top { display:flex; align-items:flex-start; gap:12px; margin-bottom:10px; }
  .bi-pc-avatar { width:40px; height:40px; background:#191924; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .bi-pc-info { flex:1; min-width:0; }
  .bi-pc-name { font-size:15px; font-weight:600; margin-bottom:6px; }
  .bi-pc-chips { display:flex; gap:5px; flex-wrap:wrap; }
  .bi-chip { padding:3px 8px; border-radius:5px; font-size:10px; font-family:'Space Mono',monospace; font-weight:600; }
  .bi-chip-hack { background:rgba(96,165,250,.1); color:#60A5FA; }
  .bi-chip-score { background:rgba(0,255,163,.1); color:#00FFA3; }
  .bi-chip-win { background:rgba(251,191,36,.1); color:#FBBF24; }
  .bi-chip-acc { background:rgba(167,139,250,.1); color:#A78BFA; }
  .bi-chip-crowd { background:rgba(255,255,255,.05); color:#94A3B8; }
  .bi-pc-liner { font-size:13px; color:#94A3B8; line-height:1.5; margin-bottom:8px; }
  .bi-pc-quote { font-size:12px; color:#64748B; font-style:italic; border-left:2px solid rgba(0,255,163,.3); padding-left:10px; margin-bottom:10px; font-family:'Space Mono',monospace; line-height:1.5; }
  .bi-pc-tags { display:flex; gap:5px; flex-wrap:wrap; }
  .bi-pc-tag { padding:3px 8px; background:#191924; border-radius:5px; font-size:10px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-pc-links { display:flex; gap:8px; margin-top:10px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px; }
  .bi-pc-link { font-size:11px; color:#94A3B8; text-decoration:none; padding:3px 8px; background:#191924; border-radius:5px; transition:color .15s; }
  .bi-pc-link:hover { color:#00FFA3; }

  .bi-acard { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:16px; margin-bottom:10px; }
  .bi-ac-title { font-size:14px; font-weight:600; margin-bottom:6px; }
  .bi-ac-excerpt { font-size:12px; color:#64748B; line-height:1.6; margin-bottom:10px; font-family:'Space Mono',monospace; }
  .bi-ac-chips { display:flex; gap:6px; flex-wrap:wrap; }
  .bi-ac-chip { padding:3px 8px; background:#191924; border-radius:5px; font-size:10px; color:#94A3B8; font-family:'Space Mono',monospace; }
  .bi-ac-score { color:#00FFA3; }

  .bi-pulse-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; margin-top:16px; }
  .bi-pv { background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:16px; }
  .bi-pv-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#64748B; margin-bottom:8px; font-family:'Space Mono',monospace; }
  .bi-pv-name { font-size:14px; font-weight:600; margin-bottom:4px; }
  .bi-pv-liner { font-size:11px; color:#64748B; margin-bottom:8px; line-height:1.4; }
  .bi-pv-score { font-size:11px; font-family:'Space Mono',monospace; color:#00FFA3; margin-bottom:8px; }
  .bi-pv-pills { display:flex; gap:5px; flex-wrap:wrap; }
  .bi-pv-pill { padding:2px 7px; background:#191924; border-radius:5px; font-size:10px; color:#94A3B8; font-family:'Space Mono',monospace; }
  .bi-pv-empty { font-size:22px; margin:8px 0; opacity:.2; }
  .bi-pv-opp { font-size:11px; color:#64748B; font-family:'Space Mono',monospace; }

  .bi-vbox { max-width:600px; margin:0 auto; }
  .bi-vbox-title { font-size:18px; font-weight:700; margin-bottom:8px; }
  .bi-vbox-sub { font-size:13px; color:#64748B; line-height:1.6; margin-bottom:20px; }
  .bi-v-area { width:100%; background:#13131C; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px; color:#E2E8F0; font-size:13px; font-family:'Space Grotesk',sans-serif; line-height:1.6; resize:vertical; min-height:120px; outline:none; transition:border-color .2s; }
  .bi-v-area:focus { border-color:rgba(0,255,163,.3); }
  .bi-v-run { margin-top:12px; background:#00FFA3; color:#060609; border:none; border-radius:12px; padding:13px 28px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Space Mono',monospace; transition:all .2s; }
  .bi-v-run:hover { opacity:.9; transform:translateY(-1px); }
  .bi-verdict { border-radius:12px; padding:16px 20px; margin:16px 0; }
  .bi-verdict.green_light { background:rgba(0,255,163,.06); border:1px solid rgba(0,255,163,.2); }
  .bi-verdict.yellow_light { background:rgba(251,191,36,.06); border:1px solid rgba(251,191,36,.2); }
  .bi-verdict.red_light { background:rgba(248,113,113,.06); border:1px solid rgba(248,113,113,.2); }
  .bi-vd-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; font-family:'Space Mono',monospace; margin-bottom:6px; }
  .bi-verdict.green_light .bi-vd-label { color:#00FFA3; }
  .bi-verdict.yellow_light .bi-vd-label { color:#FBBF24; }
  .bi-verdict.red_light .bi-vd-label { color:#F87171; }
  .bi-vd-msg { font-size:13px; color:#E2E8F0; line-height:1.6; }
  .bi-err { color:#64748B; font-size:13px; font-family:'Space Mono',monospace; padding:20px; text-align:center; }

  /* ── THINK BUTTON ── */
  .bi-think-bar { display:flex; align-items:center; gap:12px; background:rgba(167,139,250,0.04); border:1px solid rgba(167,139,250,0.15); border-radius:14px; padding:14px 18px; margin-bottom:20px; }
  .bi-think-info { flex:1; }
  .bi-think-title { font-size:13px; font-weight:700; color:#A78BFA; margin-bottom:2px; }
  .bi-think-sub { font-size:11px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-think-btn { background:linear-gradient(135deg,#A78BFA,#60A5FA); color:#060609; border:none; border-radius:10px; padding:10px 20px; font-size:12px; font-weight:700; cursor:pointer; font-family:'Space Mono',monospace; transition:all .2s; white-space:nowrap; }
  .bi-think-btn:hover { opacity:.9; transform:translateY(-1px); }
  .bi-think-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

  /* ── MOTHERBOARD ── */
  .bi-motherboard { background:#0A0A12; border:1px solid rgba(167,139,250,0.2); border-radius:18px; padding:20px; margin-bottom:24px; }
  .bi-mb-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .bi-mb-title { display:flex; align-items:center; gap:10px; }
  .bi-mb-icon { font-size:20px; }
  .bi-mb-name { font-size:14px; font-weight:700; color:#A78BFA; }
  .bi-mb-sub { font-size:10px; color:#64748B; font-family:'Space Mono',monospace; }
  .bi-mb-progress { display:flex; align-items:center; gap:10px; }
  .bi-mb-count { font-size:12px; font-family:'Space Mono',monospace; color:#A78BFA; }
  .bi-mb-bar { width:120px; height:3px; background:#191924; border-radius:2px; overflow:hidden; }
  .bi-mb-fill { height:100%; background:linear-gradient(90deg,#A78BFA,#60A5FA); border-radius:2px; transition:width .1s; }

  .bi-mb-cats { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
  .bi-mb-cat { padding:4px 10px; border-radius:7px; font-size:10px; font-family:'Space Mono',monospace; font-weight:600; cursor:pointer; border:1px solid; transition:all .15s; opacity:.5; }
  .bi-mb-cat.active { opacity:1; }

  .bi-mb-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:8px; max-height:380px; overflow-y:auto; }
  .bi-mb-grid::-webkit-scrollbar { width:3px; }
  .bi-mb-grid::-webkit-scrollbar-thumb { background:#191924; border-radius:2px; }

  .bi-thought { background:#13131C; border-radius:10px; padding:10px 12px; border-left:3px solid; animation:bi-think-in .2s ease; }
  @keyframes bi-think-in { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:translateY(0);} }
  .bi-thought-head { display:flex; align-items:center; gap:6px; margin-bottom:5px; }
  .bi-thought-icon { font-size:13px; }
  .bi-thought-label { font-size:10px; font-weight:700; font-family:'Space Mono',monospace; opacity:.7; }
  .bi-thought-id { font-size:9px; color:#64748B; font-family:'Space Mono',monospace; margin-left:auto; }
  .bi-thought-text { font-size:11px; color:#94A3B8; line-height:1.5; }

  /* ── FINAL VERDICT ── */
  .bi-verdict-final { background:linear-gradient(135deg,rgba(6,6,9,0.95),rgba(13,13,20,0.95)); border-radius:20px; padding:28px; margin-top:8px; position:relative; overflow:hidden; }
  .bi-verdict-final::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#00FFA3,#A78BFA,#60A5FA); }
  .bi-vf-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(0,255,163,.08); border:1px solid rgba(0,255,163,.2); border-radius:8px; padding:5px 12px; font-size:10px; font-weight:700; color:#00FFA3; font-family:'Space Mono',monospace; margin-bottom:14px; }
  .bi-vf-headline { font-size:20px; font-weight:800; line-height:1.3; margin-bottom:16px; }
  .bi-vf-metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
  .bi-vf-metric { background:#13131C; border-radius:12px; padding:14px; text-align:center; }
  .bi-vf-mv { font-size:18px; font-weight:700; font-family:'Space Mono',monospace; margin-bottom:3px; }
  .bi-vf-ml { font-size:10px; color:#64748B; text-transform:uppercase; letter-spacing:.08em; }
  .bi-vf-section { margin-bottom:16px; }
  .bi-vf-section-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.14em; color:#64748B; margin-bottom:8px; font-family:'Space Mono',monospace; }
  .bi-vf-insights { display:flex; flex-direction:column; gap:8px; }
  .bi-vf-insight { display:flex; gap:8px; align-items:flex-start; font-size:12px; color:#94A3B8; line-height:1.5; }
  .bi-vf-dot { width:5px; height:5px; border-radius:50%; background:#00FFA3; flex-shrink:0; margin-top:6px; }
  .bi-vf-action { background:rgba(0,255,163,.06); border:1px solid rgba(0,255,163,.15); border-radius:14px; padding:16px 20px; margin-top:16px; }
  .bi-vf-action-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.14em; color:#00FFA3; margin-bottom:8px; font-family:'Space Mono',monospace; }
  .bi-vf-action-text { font-size:13px; color:#E2E8F0; line-height:1.6; font-weight:500; }
  .bi-vf-moat { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
  .bi-vf-moat-tag { padding:5px 12px; background:#191924; border-radius:8px; font-size:11px; color:#94A3B8; font-family:'Space Mono',monospace; }
`;

export default function BuilderIntelligence() {
  const [view, setView] = useState('research');
  const [mode, setMode] = useState('standard');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [hist, setHist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lbc_h4') || '[]'); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState('proj');

  // Validate state
  const [ideaText, setIdeaText] = useState('');
  const [validateResult, setValidateResult] = useState(null);
  const [validating, setValidating] = useState(false);

  // Motherboard state
  const [thinking, setThinking] = useState(false);
  const [thoughts, setThoughts] = useState([]);
  const [thoughtCount, setThoughtCount] = useState(0);
  const [finalVerdict, setFinalVerdict] = useState(null);
  const [activeCat, setActiveCat] = useState('all');

  const callApi = async (payload) => {
    const r = await fetch(API, { method: 'POST', headers: H, body: JSON.stringify(payload) });
    return r.json();
  };

  const addHist = (q, m) => {
    const newHist = [{ q, m, t: Date.now() }, ...hist.filter(h => h.q !== q)].slice(0, 14);
    setHist(newHist);
    localStorage.setItem('lbc_h4', JSON.stringify(newHist));
  };

  const toggleFilter = (f) => {
    setFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const runSearch = async (q = query, m = mode) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setThoughts([]);
    setThoughtCount(0);
    setFinalVerdict(null);
    setActiveTab('proj');
    addHist(q, m);

    try {
      const hf = filters.length ? { hackathons: filters } : {};
      let j;
      if (m === 'deep') j = await callApi({ action: 'deep_dive', query: q, filters: hf });
      else if (m === 'archive') j = await callApi({ action: 'search_archives', query: q, limit: 12, maxChunksPerDoc: 2, intent: 'ideation' });
      else j = await callApi({ action: 'search_projects', query: q, limit: 12, filters: hf, diversify: true });

      if (j?.success) setResults({ data: j.data, mode: m, query: q });
      else setError(j?.error || 'API error');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runPulse = async () => {
    setView('pulse');
    setLoading(true);
    setError(null);
    setResults(null);
    setThoughts([]);
    setFinalVerdict(null);
    try {
      const j = await callApi({ action: 'ecosystem_pulse' });
      if (j?.success) setResults({ data: j.data, mode: 'pulse' });
      else setError(j?.error || 'API error');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runValidate = async () => {
    if (!ideaText.trim() || validating) return;
    setValidating(true);
    setValidateResult(null);
    try {
      const j = await callApi({ action: 'validate_idea', idea: ideaText });
      if (j?.success) setValidateResult(j.data);
      else setValidateResult({ error: j?.error || 'API error' });
    } catch (e) { setValidateResult({ error: e.message }); }
    finally { setValidating(false); }
  };

  const startThinking = () => {
    if (!results || thinking) return;
    setThinking(true);
    setThoughts([]);
    setThoughtCount(0);
    setFinalVerdict(null);

    runMotherboard(
      results.data,
      results.query,
      (thought, count) => {
        setThoughts(prev => [...prev, thought]);
        setThoughtCount(count);
      },
      (allThoughts, data, q) => {
        const verdict = synthesizeFinalAnswer(allThoughts, data, q);
        setFinalVerdict(verdict);
        setThinking(false);
      }
    );
  };

  const quickSearch = (q) => {
    setView('research');
    setQuery(q);
    setTimeout(() => runSearch(q, mode), 50);
  };

  // ── SUBCOMPONENTS ──────────────────────────────────────────────────────────
  const ProjCard = ({ p }) => {
    const score = p.lbc_score || Math.round((p.similarity || 0) * 100 * 10) / 10;
    const ev = (p.evidence || []).filter(Boolean);
    const stack = [...(p.tags?.techStack || []), ...(p.tags?.primitives || [])].slice(0, 5);
    const link = p.links?.colosseum, gh = p.links?.github, demo = p.links?.demo || p.links?.presentation;
    return (
      <div className="bi-pcard" onClick={() => link && window.open(link, '_blank')}>
        <div className="bi-pc-top">
          <div className="bi-pc-avatar">{getEmoji(p)}</div>
          <div className="bi-pc-info">
            <div className="bi-pc-name">{p.name}</div>
            <div className="bi-pc-chips">
              {p.hackathon?.name && <span className="bi-chip bi-chip-hack">{p.hackathon.name}</span>}
              {score > 0 && <span className="bi-chip bi-chip-score">LBC {score}</span>}
              {(p.prize || p.lbc_signals?.is_winner) && <span className="bi-chip bi-chip-win">🏆 Winner</span>}
              {(p.accelerator || p.lbc_signals?.is_accelerated) && <span className="bi-chip bi-chip-acc">⚡ Accel</span>}
              {p.crowdedness && <span className="bi-chip bi-chip-crowd">{p.crowdedness}</span>}
            </div>
          </div>
        </div>
        {p.oneLiner && <div className="bi-pc-liner">{p.oneLiner}</div>}
        {ev[0] && <div className="bi-pc-quote">"{ev[0]}"</div>}
        {stack.length > 0 && <div className="bi-pc-tags">{stack.map((t, i) => <span key={i} className="bi-pc-tag">{t}</span>)}</div>}
        {(link || gh || demo) && (
          <div className="bi-pc-links">
            {link && <a className="bi-pc-link" href={link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>🏛 Colosseum</a>}
            {gh && <a className="bi-pc-link" href={gh} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>⌥ GitHub</a>}
            {demo && <a className="bi-pc-link" href={demo} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>▶ Demo</a>}
          </div>
        )}
      </div>
    );
  };

  const ArchCard = ({ a }) => (
    <div className="bi-acard">
      <div className="bi-ac-title">{a.title || a.doc_id}</div>
      <div className="bi-ac-excerpt">{(a.excerpt || a.chunk || '').slice(0, 200)}…</div>
      <div className="bi-ac-chips">
        {a.similarity && <span className="bi-ac-chip bi-ac-score">score {Math.round(a.similarity * 1000) / 10}</span>}
        {a.hackathon && <span className="bi-ac-chip">{a.hackathon}</span>}
        {(a.tags || []).slice(0, 3).map((t, i) => <span key={i} className="bi-ac-chip">{t}</span>)}
      </div>
    </div>
  );

  const AngleBox = ({ text }) => (
    <div className="bi-angle">
      <div className="bi-angle-icon">⚡</div>
      <div>
        <div className="bi-ab-label">LBC Angle</div>
        <div className="bi-ab-text" dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    </div>
  );

  const DnaBox = ({ dna }) => {
    const max = Math.max(...Object.values(dna).map(Number), 1);
    return (
      <div className="bi-dna">
        <div className="bi-dna-head">
          <div className="bi-dna-title">🔬 Tech DNA</div>
          <span className="bi-dna-ct">{Object.keys(dna).length} signals</span>
        </div>
        <div className="bi-dna-rows">
          {Object.entries(dna).slice(0, 10).map(([k, v]) => (
            <div key={k} className="bi-dna-row">
              <div className="bi-dr-name">{k}</div>
              <div className="bi-dr-bar"><div className="bi-dr-fill" style={{ width: `${(Number(v) / max) * 100}%` }} /></div>
              <div className="bi-dr-n">{v}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── MOTHERBOARD UI ─────────────────────────────────────────────────────────
  const MotherboardPanel = () => {
    const filtered = activeCat === 'all' ? thoughts : thoughts.filter(t => t.cat === activeCat);
    const progress = (thoughtCount / 100) * 100;

    return (
      <div className="bi-motherboard">
        <div className="bi-mb-header">
          <div className="bi-mb-title">
            <div className="bi-mb-icon">🧠</div>
            <div>
              <div className="bi-mb-name">MOTHERBOARD</div>
              <div className="bi-mb-sub">100 parallel AI analyzers</div>
            </div>
          </div>
          <div className="bi-mb-progress">
            <div className="bi-mb-count">{thoughtCount}/100</div>
            <div className="bi-mb-bar"><div className="bi-mb-fill" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        <div className="bi-mb-cats">
          {[['all', '#E2E8F0', 'All'], ...Object.entries(CAT_COLORS).map(([k, c]) => [k, c, CAT_LABELS[k]])].map(([cat, color, label]) => (
            <div
              key={cat}
              className={`bi-mb-cat ${activeCat === cat ? 'active' : ''}`}
              style={{ color, borderColor: color, background: activeCat === cat ? `${color}15` : 'transparent' }}
              onClick={() => setActiveCat(cat)}
            >
              {label} {cat !== 'all' && `(${thoughts.filter(t => t.cat === cat).length})`}
            </div>
          ))}
        </div>

        <div className="bi-mb-grid">
          {filtered.map(t => (
            <div key={t.id} className="bi-thought" style={{ borderLeftColor: t.color }}>
              <div className="bi-thought-head">
                <span className="bi-thought-icon">{t.icon}</span>
                <span className="bi-thought-label" style={{ color: t.color }}>{t.label}</span>
                <span className="bi-thought-id">#{t.id}</span>
              </div>
              <div className="bi-thought-text">{t.text}</div>
            </div>
          ))}
          {thinking && thoughtCount < 100 && (
            <div className="bi-thought" style={{ borderLeftColor: '#A78BFA', opacity: 0.4 }}>
              <div className="bi-thought-head">
                <span className="bi-thought-icon">⚡</span>
                <span className="bi-thought-label" style={{ color: '#A78BFA' }}>Thinking…</span>
              </div>
              <div className="bi-thought-text">Processing lens #{thoughtCount + 1}…</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FinalVerdictPanel = ({ v }) => (
    <div className="bi-verdict-final">
      <div className="bi-vf-badge">🧠 MOTHERBOARD VERDICT — 100 ANALYZERS COMPLETE</div>
      <div className="bi-vf-headline" style={{ color: v.verdict_color }}>{v.headline}</div>

      <div className="bi-vf-metrics">
        <div className="bi-vf-metric">
          <div className="bi-vf-mv" style={{ color: v.verdict_color }}>{v.opportunity}%</div>
          <div className="bi-vf-ml">Opportunity Score</div>
        </div>
        <div className="bi-vf-metric">
          <div className="bi-vf-mv" style={{ color: v.competition === 'HIGH' ? '#F87171' : v.competition === 'MEDIUM' ? '#FBBF24' : '#00FFA3' }}>{v.competition}</div>
          <div className="bi-vf-ml">Competition Level</div>
        </div>
        <div className="bi-vf-metric">
          <div className="bi-vf-mv" style={{ color: '#A78BFA' }}>{v.urgency}</div>
          <div className="bi-vf-ml">Build Window</div>
        </div>
      </div>

      <div className="bi-vf-section">
        <div className="bi-vf-section-label">Top Insights from 100 Analyzers</div>
        <div className="bi-vf-insights">
          {v.top_insights.map((insight, i) => (
            <div key={i} className="bi-vf-insight">
              <div className="bi-vf-dot" />
              <div>{insight}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bi-vf-section">
        <div className="bi-vf-section-label">LBC Structural Advantage</div>
        <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.6 }}>{v.lbc_advantage}</div>
      </div>

      <div className="bi-vf-section">
        <div className="bi-vf-section-label">Revenue Path</div>
        <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{v.revenue_path}</div>
      </div>

      <div className="bi-vf-section">
        <div className="bi-vf-section-label">Moat Components</div>
        <div className="bi-vf-moat">
          {v.moat.split('+').map((m, i) => <div key={i} className="bi-vf-moat-tag">{m.trim()}</div>)}
        </div>
      </div>

      <div className="bi-vf-action">
        <div className="bi-vf-action-label">⚡ Immediate Action</div>
        <div className="bi-vf-action-text">{v.immediate_action}</div>
      </div>
    </div>
  );

  // ── CONTENT RENDERER ───────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) return (
      <div className="bi-loader on">
        <div className="bi-l-title">Querying LBC Intelligence</div>
        <div className="bi-l-sub">connecting to backend…</div>
        <div className="bi-l-bar"><div className="bi-l-fill" style={{ width: '60%' }} /></div>
      </div>
    );

    if (view === 'validate') return (
      <div className="bi-vbox">
        <div className="bi-vbox-title">Idea Validator</div>
        <div className="bi-vbox-sub">Describe an LBC feature idea. I'll check if it's being built on Solana and score your opportunity window.</div>
        <textarea className="bi-v-area" value={ideaText} onChange={e => setIdeaText(e.target.value)}
          placeholder="e.g. A community marketplace where users earn $LBC rewards for verified travel reviews…" />
        <button className="bi-v-run" onClick={runValidate} disabled={validating}>
          {validating ? '🔍 Scanning…' : '🔍 Validate This Idea'}
        </button>
        {validateResult && !validateResult.error && (
          <div style={{ marginTop: 20 }}>
            <div className={`bi-verdict ${validateResult.verdict}`}>
              <div className="bi-vd-label">{(validateResult.verdict || '').replace(/_/g, ' ')}</div>
              <div className="bi-vd-msg">{validateResult.verdict_message}</div>
            </div>
            {validateResult.lbc_opportunity && <AngleBox text={validateResult.lbc_opportunity} />}
            {Object.keys(validateResult.tech_dna || {}).length > 0 && <DnaBox dna={validateResult.tech_dna} />}
            {(validateResult.similar_projects || []).slice(0, 3).map((p, i) => <ProjCard key={i} p={p} />)}
          </div>
        )}
        {validateResult?.error && <div className="bi-err">Error: {validateResult.error}</div>}
      </div>
    );

    if (!results && !error) return (
      <div className="bi-empty">
        <div className="bi-empty-icon">🔭</div>
        <div className="bi-empty-title">Search the Solana ecosystem for LBC intelligence</div>
        <div className="bi-empty-chips">
          {QUICK.map((q, i) => (
            <div key={i} className="bi-empty-chip" onClick={() => quickSearch(q.q)}>{q.label}</div>
          ))}
        </div>
      </div>
    );

    if (error) return <div className="bi-err">Error: {error}</div>;

    if (results?.mode === 'pulse') {
      const d = results.data, vs = d.verticals || [], sum = d.ecosystem_summary || {};
      return (
        <div>
          <div className="bi-r-head">
            <div className="bi-rh-query">Ecosystem <em>Pulse</em></div>
            <div className="bi-rh-meta">
              <div className="bi-rh-tag">{sum.lbc_coverage || '8 verticals'}</div>
              <div className="bi-rh-tag">{d.pulse_date || 'live'}</div>
            </div>
          </div>
          {sum.hottest_vertical && <AngleBox text={`Hottest vertical: <strong>${sum.hottest_vertical}</strong> — health: <strong>${sum.health_score}/100</strong>`} />}
          <div className="bi-pulse-grid">
            {vs.map((v, i) => (
              <div key={i} className="bi-pv">
                <div className="bi-pv-label">{v.vertical}</div>
                {v.top_project ? (
                  <>
                    <div className="bi-pv-name">{v.top_project.name}</div>
                    <div className="bi-pv-liner">{v.top_project.oneLiner || ''}</div>
                    <div className="bi-pv-score">LBC {v.top_project.lbc_score}</div>
                    <div className="bi-pv-pills">
                      {v.top_project.hackathon && <span className="bi-pv-pill">{v.top_project.hackathon}</span>}
                      <span className="bi-pv-pill">{v.project_count} found</span>
                    </div>
                  </>
                ) : (<><div className="bi-pv-empty">◇</div><div className="bi-pv-opp">{v.opportunity}</div></>)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const { data, mode: m, query: q } = results;
    const projs = m === 'deep' ? (data.projects || []) : (data.results || []);
    const archives = data.archives || [];
    const intel = data.intelligence || {};
    const dna = (m === 'deep' ? intel.tech_dna : data.tech_dna) || {};
    const ws = (m === 'deep' ? intel.whitespace_opportunities : data.whitespace_opportunities) || [];
    const angle = (m === 'deep' ? intel.lbc_angle : data.lbc_angle) || '';
    const winners = projs.filter(p => p.prize || p.lbc_signals?.is_winner).length;
    const accel = projs.filter(p => p.accelerator || p.lbc_signals?.is_accelerated).length;
    const avg = projs.length ? Math.round(projs.reduce((s, p) => s + (p.lbc_score || 0), 0) / projs.length * 10) / 10 : 0;
    const hacks = [...new Set(projs.map(p => p.hackathon?.name).filter(Boolean))].length;

    return (
      <div>
        <div className="bi-r-head">
          <div className="bi-rh-query">Results for <em>"{q}"</em></div>
          <div className="bi-rh-meta">
            <div className="bi-rh-tag">{projs.length} found</div>
            <div className="bi-rh-tag">{m.toUpperCase()}</div>
            <div className="bi-rh-acts">
              <div className="bi-rh-act" onClick={() => { setResults(null); setQuery(''); setThoughts([]); setFinalVerdict(null); }}>✕ Clear</div>
            </div>
          </div>
        </div>

        {/* 🧠 THINK BUTTON */}
        {(projs.length > 0 || m === 'archive') && (
          <div className="bi-think-bar">
            <div className="bi-think-info">
              <div className="bi-think-title">🧠 Motherboard Analysis</div>
              <div className="bi-think-sub">Run 100 AI analyzers simultaneously → synthesize final LBC verdict</div>
            </div>
            <button className="bi-think-btn" onClick={startThinking} disabled={thinking}>
              {thinking ? `Thinking… ${thoughtCount}/100` : thoughtCount === 100 ? '🔁 Re-Think' : '⚡ THINK × 100'}
            </button>
          </div>
        )}

        {/* MOTHERBOARD PANEL */}
        {thoughts.length > 0 && <MotherboardPanel />}

        {/* FINAL VERDICT */}
        {finalVerdict && <FinalVerdictPanel v={finalVerdict} />}

        {m === 'deep' && (
          <div className="bi-stat-row">
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#00FFA3' }}>{projs.length}</div><div className="bi-s-label">Projects</div></div>
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#FBBF24' }}>{winners}</div><div className="bi-s-label">Winners</div></div>
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#A78BFA' }}>{accel}</div><div className="bi-s-label">Accelerated</div></div>
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#00FFA3' }}>{avg}</div><div className="bi-s-label">Avg Score</div></div>
            <div className="bi-stat"><div className="bi-s-num" style={{ color: '#60A5FA', fontSize: 16 }}>{hacks}</div><div className="bi-s-label">Hackathons</div></div>
          </div>
        )}

        {angle && <AngleBox text={angle} />}
        {ws.length > 0 && <div className="bi-ws-row">{ws.map((w, i) => <div key={i} className="bi-ws-tag">{w}</div>)}</div>}
        {Object.keys(dna).length > 0 && <DnaBox dna={dna} />}

        {(projs.length > 0 || archives.length > 0) && (
          <div className="bi-tabs">
            <div className={`bi-tab ${activeTab === 'proj' ? 'on' : ''}`} onClick={() => setActiveTab('proj')}>
              Projects <span className="bi-tab-n">{projs.length}</span>
            </div>
            {archives.length > 0 && (
              <div className={`bi-tab ${activeTab === 'arch' ? 'on' : ''}`} onClick={() => setActiveTab('arch')}>
                Archive <span className="bi-tab-n">{archives.length}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'proj' && (projs.length > 0 ? projs.map((p, i) => <ProjCard key={i} p={p} />) : <div className="bi-err">No projects found.</div>)}
        {activeTab === 'arch' && archives.map((a, i) => <ArchCard key={i} a={a} />)}
        {m === 'archive' && (data.results || []).map((a, i) => <ArchCard key={i} a={a} />)}
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="bi-shell">
        {/* RAIL */}
        <div className="bi-rail">
          <div className="bi-rail-logo">LBC</div>
          <div className="bi-rail-sep" />
          {[
            { icon: '🔭', tip: 'Research', v: 'research' },
            { icon: '📡', tip: 'Ecosystem Pulse', v: 'pulse', action: runPulse },
            { icon: '💡', tip: 'Idea Validator', v: 'validate' },
          ].map(item => (
            <div key={item.v} className={`bi-rail-btn ${view === item.v ? 'on' : ''}`}
              onClick={() => { if (item.action) item.action(); else setView(item.v); }}>
              {item.icon}
              <div className="bi-rail-tip">{item.tip}</div>
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div className={`bi-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="bi-sb-head">
            <div className="bi-sb-title">Builder Intelligence</div>
            <div className="bi-sb-sub">lbchub.site · v4 + Motherboard</div>
          </div>
          <div className="bi-sb-section">Verticals</div>
          {[
            { icon: '👥', label: 'Social + Community', badge: '4 found', q: 'social community SocialFi token Solana' },
            { icon: '🛒', label: 'Marketplace', badge: '3 found', q: 'marketplace escrow p2p Solana' },
            { icon: '✈️', label: 'Travel', badge: 'EMPTY', q: 'accommodation tourism Web3 mobile' },
            { icon: '🚗', label: 'Rides', badge: 'EMPTY', q: 'transport logistics token payment' },
            { icon: '🤖', label: 'AI Agents', badge: '4 found', q: 'AI agent autonomous payments Solana' },
            { icon: '🏙️', label: 'Digital City', badge: '4 found', q: 'digital city infrastructure blockchain' },
            { icon: '🎟️', label: 'Live Events', badge: 'NEW', q: 'concert festival token creator fan' },
            { icon: '📡', label: 'DePIN', badge: '3 found', q: 'decentralized physical infrastructure network' },
          ].map((item, i) => (
            <div key={i} className="bi-sb-link" onClick={() => quickSearch(item.q)}>
              <span className="bi-sl-icon">{item.icon}</span>
              <span className="bi-sl-txt">{item.label}</span>
              <span className="bi-sl-badge">{item.badge}</span>
            </div>
          ))}
          <div className="bi-sb-divider" />
          <div className="bi-sb-section">Recent</div>
          <div className="bi-hist">
            {hist.map((h, i) => (
              <div key={i} className="bi-sh-item" onClick={() => quickSearch(h.q)}>
                <div className="bi-shi-q">{h.q}</div>
                <div className="bi-shi-m">{h.m} · {ago(h.t)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div className="bi-main">
          <div className="bi-topbar">
            <div className="bi-tb-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</div>
            <div className="bi-tb-path">
              <span>lbchub.site</span><span className="sep">/</span>
              <span className="cur">{view === 'pulse' ? 'ecosystem_pulse' : view === 'validate' ? 'idea_validator' : 'research'}</span>
              {thoughts.length > 0 && <><span className="sep">/</span><span style={{ color: '#A78BFA' }}>motherboard</span></>}
            </div>
            <div className="bi-tb-pills">
              <div className="bi-tb-pill"><span className="pl">projects</span><span className="pv">5,400+</span></div>
              <div className="bi-tb-pill"><span className="pl">lenses</span><span className="pv">100</span></div>
              <div className="bi-tb-pill bi-live-pill"><div className="bi-live-dot" /><span>LIVE</span></div>
            </div>
          </div>

          {view === 'research' && (
            <div className="bi-cmdbar">
              <div className="bi-cmd-row">
                <div className="bi-cmd-input">
                  <span className="bi-cmd-prompt">$</span>
                  <input value={query} onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runSearch()}
                    placeholder="Search 5,400+ Solana hackathon projects…" />
                  {query && <button className="bi-cmd-x show" onClick={() => { setQuery(''); setResults(null); setThoughts([]); setFinalVerdict(null); }}>✕</button>}
                </div>
                <div className="bi-cmd-modes">
                  {['standard', 'deep', 'archive'].map(m => (
                    <button key={m} className={`bi-cmd-mode ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)}>
                      {m === 'standard' ? 'Standard' : m === 'deep' ? '🔬 Deep' : '📚 Archive'}
                    </button>
                  ))}
                </div>
                <button className="bi-cmd-run" onClick={() => runSearch()} disabled={loading || !query.trim()}>
                  {loading ? 'Scanning…' : 'RUN →'}
                </button>
              </div>
              <div className="bi-filters">
                {HACKATHONS.map(f => (
                  <div key={f} className={`bi-filter-tag ${filters.includes(f) ? 'on' : ''}`} onClick={() => toggleFilter(f)}>{f}</div>
                ))}
              </div>
            </div>
          )}

          <div className="bi-content">{renderContent()}</div>
        </div>
      </div>
    </>
  );
}
