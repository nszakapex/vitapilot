insert into public.local_events (
  source,
  external_id,
  title,
  event_type,
  distance_label,
  price_label,
  fit_reason,
  location_label
) values
  ('seed', 'beginner-run-walk-denver', 'Beginner run/walk meetup', 'Run club', '1.1 mi', 'Free', 'Low-pressure pace and a coffee stop after.', 'Denver, CO'),
  ('seed', 'highlands-farmers-market', 'Highlands farmers market', 'Food', '2.4 mi', 'Free entry', 'Good for a two-meal prep plan under budget.', 'Denver, CO'),
  ('seed', 'intro-mobility-class', 'Intro mobility class', 'Recovery', '0.8 mi', '$12', 'Matches shoulder stiffness and recovery goals.', 'Denver, CO')
on conflict (source, external_id) do update set
  title = excluded.title,
  event_type = excluded.event_type,
  distance_label = excluded.distance_label,
  price_label = excluded.price_label,
  fit_reason = excluded.fit_reason,
  location_label = excluded.location_label;

insert into public.evidence_cards (
  slug,
  title,
  evidence_level,
  summary
) values
  ('protein-forward-meals', 'Protein-forward meals', 'strong', 'Protein can support satiety and muscle maintenance when targets are personalized and food quality is preserved.'),
  ('low-recovery-training', 'Lower intensity after poor sleep', 'practical', 'Reducing workout intensity after short sleep is a practical wellness adjustment, not a medical rule.'),
  ('health-trend-validator', 'Social health trend validation', 'mixed', 'Many trends contain useful behavior cues but require evidence labels and safety boundaries.')
on conflict (slug) do update set
  title = excluded.title,
  evidence_level = excluded.evidence_level,
  summary = excluded.summary;
