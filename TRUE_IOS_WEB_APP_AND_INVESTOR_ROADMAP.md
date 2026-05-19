# True iOS + Web App Roadmap and Health Investor Plan

Date: May 19, 2026  
Product working name: VitaPilot  
Current state: Vite React demo at `health-ai-assistant-app`, useful as a product prototype and UX sketch, not yet the final production architecture.

## 1. Strategic Call

We should build this into two real products on one shared intelligence layer:

1. A true iOS app for daily use, HealthKit, notifications, haptics, camera/menu scanning, widgets, local context, and offline-friendly coaching.
2. A premium web app for onboarding, planning, investor demos, admin tooling, local partner ops, content/evidence management, and users who prefer desktop planning.

The current Vite demo should not become the final production app by itself. It is good for validating product surfaces, language, and IA. The next version should be a production-grade shared TypeScript platform with native mobile where it matters.

Recommendation:

- Mobile: Expo React Native with Expo Router.
- Web: Next.js.
- Shared domain layer: TypeScript package for health types, plan logic, safety rules, Supabase client adapters, and AI prompt contracts.
- Backend: Supabase Postgres/Auth/Storage/Edge Functions.
- AI layer: Edge Functions or a small API service that owns model calls, safety checks, retrieval, personalization, and audit logs.

Why this architecture:

- Expo/React Native gives us real iOS behavior: HealthKit bridges, push notifications, camera, haptics, widgets later, App Store path, and native feel.
- Next.js gives us a serious web product and fundraising-grade demo surface.
- Supabase gives us fast auth, Postgres, RLS, storage, edge functions, and a real backend without hiring a backend team too early.
- Shared TypeScript keeps the product logic from splitting into two separate brains.

## 2. What "True iOS App" Means

The iOS app should not feel like a website wrapped in a phone. It needs native behaviors:

- App Store install.
- Apple sign-in.
- HealthKit permission flow and Apple Health reads.
- Native push notifications.
- Camera-based meal/menu capture.
- Local notifications for plan timing.
- Haptics for completed actions and plan swaps.
- Biometric unlock for sensitive health profile access.
- iOS widgets for "next useful action."
- Eventually Apple Watch companion surfaces.

Relevant constraints:

- Apple states that HealthKit data sharing should be managed through system privacy settings and that apps using HealthKit must meet HealthKit privacy requirements and provide a privacy policy. Sources: [Apple HealthKit privacy](https://developer.apple.com/documentation/healthkit/protecting_user_privacy), [Apple HealthKit HIG](https://developer.apple.com/design/human-interface-guidelines/healthkit).
- App Store Review Guidelines restrict use of sensitive data such as health/medical data for targeted or behavioral advertising. Source: [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

## 3. What "True Web App" Means

The web app should not be a marketing site. It should be a companion product:

- Rich onboarding and goal setup.
- Weekly planning dashboard.
- Meal/workout/local event planning.
- Review of trends and progress.
- Account, privacy, integrations, and billing.
- Admin tools for local events, safety content, reviewed evidence, and support.
- Investor-demo mode with realistic mocked or seeded data.

The web app is also where we can move faster on information density while keeping the iOS app light and daily.

## 4. Recommended Monorepo Structure

Use a monorepo before the app gets messy:

```text
vitapilot/
  apps/
    ios/                 Expo React Native app
    web/                 Next.js web app
    admin/               Later: internal ops/admin app
  packages/
    core/                Shared domain types and plan logic
    ui/                  Shared tokens/components where practical
    data/                Supabase clients, generated DB types
    ai-contracts/        Prompt schemas, tool schemas, safety outputs
    evidence/            Reviewed guidance and trend labels
  supabase/
    migrations/
    functions/
    seed.sql
  docs/
    product/
    investor/
    safety/
```

Current Vite demo can be kept as `apps/prototype` or migrated into `apps/web`.

## 5. Supabase Role

Yes, set up Supabase, but only after the schema is intentionally designed.

First tables:

- `profiles`
- `health_preferences`
- `user_constraints`
- `daily_plans`
- `daily_actions`
- `check_ins`
- `meals`
- `workouts`
- `local_events`
- `saved_events`
- `assistant_threads`
- `assistant_messages`
- `safety_flags`
- `evidence_cards`

Rules:

- RLS on every user-owned table from day one.
- No model provider keys in the client.
- Edge Functions own AI calls.
- Store only what is needed.
- Do not store raw HealthKit data forever unless there is a real user value and explicit consent.

Supabase has official React Native Auth guidance, including Expo install notes. Source: [Supabase React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native).

## 6. Product Experience Thesis

The current demo is clean. The final app needs to be more ownable.

The differentiator should not be "pretty cards." Everyone has cards. The interface should feel like a living health instrument:

> A calm, high-trust command center that turns a messy human day into a few clear health moves.

Design principle:

- Not sci-fi.
- Not clinical.
- Not wellness beige.
- Not gamified shame.
- Not purple AI dashboard.
- Not content-library fitness app.

The style should be advanced because of behavior, motion, and information architecture, not loud decoration.

## 7. New Visual Language: "Health Terrain"

Design language proposal: Health Terrain.

Core idea:

- The app visualizes the day as terrain: energy, food, movement, recovery, and local opportunities are signals across a landscape.
- The user does not see a spreadsheet. They see a navigable day.

Signature UI patterns:

1. Daily Terrain Map  
   A horizontal time-based map of the day showing energy windows, meals, movement opportunities, stress pinch points, and local suggestions.

2. Decision Dock  
   A bottom/native dock with exactly three current moves: Eat, Move, Recover. The dock changes with time and feedback.

3. Adaptive Plan Cards  
   Cards are not generic rectangles. Each action has a compact signal strip: time, effort, confidence, evidence, and fallback.

4. Local Signal Radar  
   A map/list hybrid for run clubs, classes, markets, and recovery options, ranked by personal fit rather than proximity alone.

5. Coach Thread With State  
   The assistant is not a blank chat. It always knows the current plan and can edit it.

6. Re-entry Flow  
   When a user comes back after absence, the app visually lowers the plan difficulty and offers one small reset.

7. Evidence Labels  
   Health claims get small confidence labels: strong, mixed, early, hype-risk.

8. Action Physics  
   Completed actions compress into a daily trace, not confetti. Momentum feels grown-up.

## 8. Advanced UI Tech Choices

iOS:

- Expo React Native.
- React Native Reanimated for fluid motion.
- React Native Skia for health terrain visualizations.
- Expo Haptics for tactile feedback.
- Expo Notifications for daily timing.
- Camera/ImagePicker for meal/menu capture.
- HealthKit via a maintained React Native/Expo-compatible bridge.
- Native modules only where needed.

Web:

- Next.js.
- CSS variables/design tokens.
- Canvas/SVG for terrain map where needed.
- Mapbox, MapLibre, or Google Maps depending data/licensing.
- Server components for evidence/local/admin-heavy pages if useful.

Design system:

- Use fewer generic cards.
- Use dense but calm surfaces.
- 8px radius maximum for cards and controls.
- No generic AI gradients.
- No decorative blobs/orbs.
- Use real visual assets where useful: map tiles, menu photos, meal photos, user-local context.
- Palette: warm off-white, ink, chlorophyll green, cobalt, amber, coral, graphite. This prevents one-note wellness beige or purple-AI sameness.

## 9. Feature Roadmap

### Phase 0: Foundation, 1-2 Weeks

Goal: convert demo into a real technical foundation.

- Create monorepo.
- Create Expo iOS app.
- Create Next.js web app.
- Move shared types from current demo into `packages/core`.
- Set up Supabase project.
- Create initial migrations and RLS.
- Add auth.
- Add seeded mock profile and daily plan.
- Add design tokens.

Exit criteria:

- One user can sign in on web and iOS.
- Profile and daily plan load from Supabase.
- Build passes for iOS simulator and web.

### Phase 1: Core MVP, 4-6 Weeks

Goal: prove the daily decision loop.

- Onboarding.
- Profile/preferences.
- Today dashboard.
- Daily actions.
- Coach thread.
- Check-ins.
- Meal options.
- Workout options.
- Local event saves.
- Safety disclaimers and red/yellow/green guardrails.
- Basic web weekly planner.

Exit criteria:

- User can complete a full week with daily plan generation, edits, and check-ins.
- Retention instrumentation exists.
- No health data table is public without RLS.

### Phase 2: AI Planning Layer, 4-6 Weeks

Goal: make the app feel adaptive.

- Edge Function for plan generation.
- Structured output schemas for daily plans.
- Safety classifier before recommendations.
- Coach can edit actions.
- Trend validator MVP.
- "I fell off" re-entry flow.
- Feedback learning: too hard, too easy, liked, skipped, completed.

Exit criteria:

- AI can produce valid plans with typed actions.
- Unsafe prompts route to safe responses.
- Plan changes persist and affect future recommendations.

### Phase 3: iOS Native Depth, 4-8 Weeks

Goal: make it a true iOS health app.

- HealthKit permission screen.
- Read steps, workouts, sleep where available.
- Recovery-to-action translator.
- Push/local notifications.
- Camera menu/meal capture.
- Haptics.
- Lock sensitive profile behind biometrics.
- TestFlight beta.

Exit criteria:

- 100 TestFlight users can use HealthKit + daily plans.
- Users can ask "what should I do today?" and get context-aware answers.

### Phase 4: Local Wellness Wedge, 4-8 Weeks

Goal: build a moat that MyFitnessPal/Fitbod/generic chatbots do not have.

- Event ingestion from Google Places/Eventbrite/Meetup/manual partner submissions.
- Local recommendation scoring.
- Save/share event.
- Friend invite to event.
- Local partner admin.
- Quality and safety moderation.

Exit criteria:

- One launch city has enough inventory to make local recommendations useful.
- Users save or attend local events weekly.

### Phase 5: Investor-Ready Product, 8-12 Weeks

Goal: show traction and fundability.

- App Store/TestFlight proof.
- Web app proof.
- Analytics dashboard.
- Cohort retention.
- AI cost tracking.
- Privacy/security posture.
- Waitlist/acquisition funnel.
- Pitch deck.
- Product demo script.
- Advisory board.

Exit criteria:

- 500-2,000 beta users or a smaller high-retention cohort.
- Week 4 retention story.
- Clear willingness-to-pay signal.
- Investor narrative backed by usage data.

## 10. Metrics That Matter

The north-star metric should be:

> Weekly completed next-healthy actions per active user.

Supporting metrics:

- Activation: profile completed + first daily plan generated.
- D1, D7, D30 retention.
- Weekly active users.
- Plan completion rate.
- Plan edit rate.
- Assistant messages per active user.
- Re-entry success after 3+ days inactive.
- Meal recommendation save/use rate.
- Workout completion rate.
- Local event save/click/attendance proxy.
- HealthKit connection rate.
- Paid conversion.
- AI cost per active user.
- Safety escalation rate.

Investor metric target for pre-seed:

- 1,000+ waitlist users, or
- 500 beta users, or
- 100 highly engaged beta users with unusually strong retention, plus
- strong qualitative proof that the product changes daily decisions.

## 11. Health Investor Landscape

Current market reality:

- Digital health funding improved in 2025 but is bifurcated. Rock Health described 2025 as a "haves and have-nots" market, with U.S. digital health startups raising $14.2B across 482 deals and investors concentrating capital in stronger companies. Source: [Rock Health 2025 year-end funding](https://rockhealth.com/insights/2025-year-end-digital-health-funding-overview-a-tale-of-two-markets/).
- AI is no longer enough as a label. Rock Health reported that AI-enabled digital health startups captured a majority of digital health venture funding in H1 2025, but by 2026 AI is becoming table stakes. Sources: [Rock Health H1 2025](https://rockhealth.com/insights/h1-2025-market-overview-proof-in-the-pudding/), [Rock Health Q1 2026](https://rockhealth.com/insights/q1-2026-funding-overview-capital-continues-concentrating-and-four-other-market-signals/).
- SVB's 2025 healthtech report says provider operations captured 44% of healthtech funding, showing that healthcare investors are rewarding workflow-embedded AI more than vague consumer wellness. Source: [SVB Future of Healthtech 2025](https://www.svb.com/trends-insights/reports/healthtech-trends-report).
- Consumer health can still raise money, but the bar is higher: retention, trust, differentiated distribution, and clear expansion path matter.

Implication:

We should not pitch "AI wellness coach." That sounds generic. We should pitch:

> VitaPilot is the AI decision layer for everyday preventive health, starting with food, movement, recovery, and local action.

## 12. Fundraising Path

### Stage 1: Founder/Angel Capital

Amount: $100k-$300k  
Use: prototype to MVP, design system, initial Supabase/backend, iOS build, early beta.

Who:

- Angel investors in consumer apps.
- Health/wellness operators.
- Fitness founders.
- Local wellness entrepreneurs.
- AI product angels.

What they need to believe:

- The product has a distinctive wedge.
- The founder can ship.
- The design/product taste is unusually strong.

### Stage 2: Pre-Seed

Amount: $750k-$2M  
Use: small team, iOS/web MVP, AI planning engine, safety layer, local launch city, beta growth.

Ideal metrics:

- 500-2,000 beta users.
- D7 retention above typical wellness-app expectations.
- Clear evidence users complete actions, not just chat.
- Waitlist growth from short-form content.
- Early paid intent or preorders.
- Advisory board in nutrition, fitness, privacy, and behavior science.

Investor types:

- Digital health seed funds.
- Consumer subscription funds.
- AI application funds.
- Wellness/longevity angels.
- Strategic wellness partners.

### Stage 3: Seed

Amount: $3M-$6M  
Use: scale growth, improve AI, expand local inventory, launch paid subscription, hire engineering/design/growth.

Ideal metrics:

- 25k-100k users or very strong paid beta.
- Strong retention and conversion.
- CAC experiments working.
- AI unit economics understood.
- Safety/privacy program credible.
- One local-market playbook validated.

### Stage 4: Strategic / Series A

Amount: $8M-$15M+  
Use: category expansion, local partner marketplace, employer/corporate wellness pilots, deeper wearable integrations.

Who:

- Growth health funds.
- Consumer subscription investors.
- Strategic partners: wearables, fitness platforms, wellness benefit providers, grocery/food, local fitness networks.

## 13. What Investors Will Ask

1. Why will users open this daily?
2. Why is this not just ChatGPT with a wellness prompt?
3. Why will MyFitnessPal, Fitbit, Apple, Oura, WHOOP, or Noom not crush you?
4. What is the retention loop?
5. What is the moat?
6. How do you handle medical risk?
7. What data do you store?
8. What is your AI cost per user?
9. What is your beachhead?
10. Why now?
11. Is this consumer subscription, B2B wellness, marketplace, or healthcare?
12. What proves users will pay?

The answer:

- Daily decision loop.
- Cross-domain context memory.
- Local wellness layer.
- No-tracking/light-tracking UX.
- Health safety and evidence labels.
- Data moat around adherence patterns and real-world choices.
- Clear wedge before healthcare expansion.

## 14. Pitch Narrative

Slide 1: VitaPilot  
The AI health assistant for real life.

Slide 2: Problem  
People have trackers, apps, and health advice, but still do not know what to do today.

Slide 3: Market  
Consumer wellness is massive; AI and wearables are changing expectations; health investors are funding AI but demanding workflow and outcomes.

Slide 4: Insight  
The winning object is not the calorie, workout, or sleep score. It is the daily decision.

Slide 5: Product  
Food, movement, recovery, local action, and assistant edits in one adaptive daily plan.

Slide 6: Demo  
Show a real day: short sleep, restaurant dinner, 20-minute opening, local walk option, trend question.

Slide 7: Why It Wins  
Contextual decisions, no-tracking mode, local wedge, safety layer, wearable interpretation.

Slide 8: Business Model  
Freemium, Plus, Pro, local partners, later corporate/hybrid coaching.

Slide 9: Traction  
Waitlist, beta retention, completed actions, qualitative stories, paid intent.

Slide 10: Roadmap  
iOS, web, AI planning, HealthKit, local launch city, subscription.

Slide 11: Team / Advisors  
Product, AI, health safety, behavior design, privacy.

Slide 12: Raise  
Amount, runway, milestones.

## 15. Regulatory and Trust Path

Do not become a medical app at launch.

Positioning:

- Consumer wellness.
- General healthy lifestyle support.
- No diagnosis.
- No treatment.
- No medication advice.
- No eating-disorder or medical nutrition therapy.

FDA:

- FDA's general wellness guidance gives room for low-risk products that maintain or encourage a healthy lifestyle, but the product must avoid disease-treatment claims unless the company intentionally moves into regulated territory. Source: [FDA general wellness step 3](https://www.fda.gov/medical-devices/digital-health-center-excellence/step-3-software-function-intended-maintaining-or-encouraging-healthy-lifestyle).

FTC:

- The FTC Health Breach Notification Rule can apply to health apps and similar technologies, especially where apps collect health information and sync with devices/APIs. Source: [FTC Health Breach Notification Rule basics](https://www.ftc.gov/node/78112).

Privacy posture:

- Treat health-adjacent data as sensitive even if HIPAA does not apply.
- No selling health data.
- No targeted advertising based on health data.
- Clear deletion/export.
- Minimal retention.
- RLS and audit logs.
- Privacy policy before TestFlight scale.

## 16. Team Needed

MVP team:

- 1 product/design founder or product lead.
- 1 full-stack TypeScript engineer.
- 1 React Native/iOS engineer.
- 1 AI/backend engineer, can be same person early.
- Fractional registered dietitian.
- Fractional certified strength coach or physical therapist.
- Fractional privacy counsel.

Seed team:

- Head of product/design.
- Mobile engineer.
- Web/full-stack engineer.
- AI/backend engineer.
- Growth lead.
- Community/local partnerships lead.
- Health safety advisor network.

## 17. 90-Day Execution Plan

Weeks 1-2:

- Decide brand direction and product name.
- Create monorepo.
- Set up Supabase.
- Define schema and RLS.
- Create iOS shell and web shell.
- Port current prototype surfaces.

Weeks 3-4:

- Build onboarding.
- Build profile/preferences.
- Persist daily plan and actions.
- Build check-ins.
- Add basic auth.

Weeks 5-6:

- Build first AI plan Edge Function with structured output.
- Add safety pre-checks.
- Add assistant thread editing.
- Add simple trend validator.

Weeks 7-8:

- Add iOS HealthKit read path.
- Add push/local notifications.
- Add camera/menu capture placeholder.
- Improve UI to Health Terrain v1.

Weeks 9-10:

- Add local events MVP.
- Seed one local market.
- Build web weekly planner.
- Add analytics.

Weeks 11-12:

- TestFlight beta.
- User interviews.
- Retention review.
- Pitch deck.
- Investor CRM.

## 18. What To Build Next, Immediately

1. Create the monorepo.
2. Create Supabase schema and migrations.
3. Move current domain types into shared package.
4. Create Expo iOS app shell.
5. Create Next.js web shell.
6. Rebuild Today screen using the new Health Terrain direction.
7. Add auth/profile persistence.
8. Add first AI daily-plan function.

The key next product decision is the design system. The current demo has the right structure, but the next version needs a signature interaction. I recommend starting with Daily Terrain Map + Decision Dock. That will give the app a visual and behavioral identity competitors do not have.

## 19. Final Recommendation

Set up Supabase now, but do not just bolt it onto the demo.

The correct next move is to start the production foundation:

- Monorepo.
- Expo iOS.
- Next.js web.
- Supabase backend.
- Shared health intelligence package.
- Health Terrain design system.

The investor path is viable, but only if we prove this is not another wellness chatbot. The fundable company is a trusted daily decision layer for preventive health, with consumer traction first and optional healthcare-adjacent expansion later.

The phrase to keep repeating:

> We help people make the next healthy choice in the real world.

