import type { Dialect } from '../types';

/**
 * Philippine Startup Week booth content (MOB-086) — Tagalog and Cebuano pulled
 * verbatim from already-reviewed, already-shipped lesson "reviewer" stages
 * (`src/content/{tagalog,cebuano}/stage-1..3/unit-*.json`), not newly written, so
 * nothing here needs a fresh translation review before the booth. No audio clips:
 * these are full phrases, and the bundled bucket audio only covers single words
 * (`src/audio/useWordAudio.ts`), so the mascot demo is text + typewriter only.
 *
 * Ilocano has no bundled content in this repo — its lessons are seeded straight into
 * Supabase. Pulled via the HQ dashboard's course-editor (same `courses` table, session
 * access as Alex) from Stage 0 lessons 101001-103, not the raw unreviewed linguistics
 * CSV. `audioKeys` may exist on some words but aren't confirmed present in R2, so every
 * phrase here is treated as text-only, matching Tagalog/Cebuano.
 */
export interface BoothPhrase {
  id: string;
  dialect: Dialect;
  /** The target-language phrase, shown to the learner first. */
  target: string;
  /** English gloss — the "answer" in both the translator and the guessing game. */
  english: string;
}

export const BOOTH_PHRASES: BoothPhrase[] = [
  // Tagalog — 25
  { id: 'tgl-01', dialect: 'tagalog', target: 'Magandang umaga po', english: 'Good morning (polite)' },
  { id: 'tgl-02', dialect: 'tagalog', target: 'Magandang hapon po', english: 'Good afternoon (polite)' },
  { id: 'tgl-03', dialect: 'tagalog', target: 'Magandang gabi po', english: 'Good evening (polite)' },
  { id: 'tgl-04', dialect: 'tagalog', target: 'Ako si Juan.', english: 'I am Juan.' },
  { id: 'tgl-05', dialect: 'tagalog', target: 'Taga-saan ka?', english: 'Where are you from?' },
  { id: 'tgl-06', dialect: 'tagalog', target: 'Taga-Pilipinas ako.', english: 'I am from the Philippines.' },
  { id: 'tgl-07', dialect: 'tagalog', target: 'Salamat po.', english: 'Thank you (polite).' },
  { id: 'tgl-08', dialect: 'tagalog', target: 'Maraming salamat', english: 'Thank you very much' },
  { id: 'tgl-09', dialect: 'tagalog', target: 'Walang anuman', english: "You're welcome" },
  { id: 'tgl-10', dialect: 'tagalog', target: 'Ingat po', english: 'Take care (polite)' },
  { id: 'tgl-11', dialect: 'tagalog', target: 'Para po!', english: 'Stop, please!' },
  { id: 'tgl-12', dialect: 'tagalog', target: 'Bayad po.', english: 'Here is the payment.' },
  { id: 'tgl-13', dialect: 'tagalog', target: 'Sukli po.', english: 'Change, please.' },
  { id: 'tgl-14', dialect: 'tagalog', target: 'Magkano ito?', english: 'How much is this?' },
  { id: 'tgl-15', dialect: 'tagalog', target: 'Bili ako ng saging.', english: "I'm buying bananas." },
  { id: 'tgl-16', dialect: 'tagalog', target: 'Isang kilo ng mangga.', english: 'One kilo of mangoes.' },
  { id: 'tgl-17', dialect: 'tagalog', target: 'Pwede po bang tumawad?', english: 'Can I ask for a discount?' },
  { id: 'tgl-18', dialect: 'tagalog', target: 'Ang nanay ko.', english: 'My mother.' },
  { id: 'tgl-19', dialect: 'tagalog', target: 'Ang bahay ko.', english: 'My house.' },
  { id: 'tgl-20', dialect: 'tagalog', target: 'Anong oras na?', english: 'What time is it?' },
  { id: 'tgl-21', dialect: 'tagalog', target: 'Kain tayo!', english: "Let's eat!" },
  { id: 'tgl-22', dialect: 'tagalog', target: 'Malapit lang ba?', english: 'Is it just near?' },
  { id: 'tgl-23', dialect: 'tagalog', target: 'Lumiko sa kanan.', english: 'Turn right.' },
  { id: 'tgl-24', dialect: 'tagalog', target: 'Diretso lang.', english: 'Go straight.' },
  { id: 'tgl-25', dialect: 'tagalog', target: 'Ayos lang.', english: "It's okay." },

  // Cebuano — 25
  { id: 'ceb-01', dialect: 'cebuano', target: 'Maayong buntag', english: 'Good morning' },
  { id: 'ceb-02', dialect: 'cebuano', target: 'Maayong udto', english: 'Good noon' },
  { id: 'ceb-03', dialect: 'cebuano', target: 'Maayong hapon', english: 'Good afternoon' },
  { id: 'ceb-04', dialect: 'cebuano', target: 'Maayong gabii', english: 'Good evening' },
  { id: 'ceb-05', dialect: 'cebuano', target: 'Unsay imong ngalan?', english: 'What is your name?' },
  { id: 'ceb-06', dialect: 'cebuano', target: 'Taga-diin ka?', english: 'Where are you from?' },
  { id: 'ceb-07', dialect: 'cebuano', target: 'Taga-Sugbo ako.', english: 'I am from Cebu.' },
  { id: 'ceb-08', dialect: 'cebuano', target: 'Ingat ka', english: 'Take care' },
  { id: 'ceb-09', dialect: 'cebuano', target: 'Salamat po.', english: 'Thank you (polite).' },
  { id: 'ceb-10', dialect: 'cebuano', target: 'Asa ka paingon?', english: 'Where are you heading?' },
  { id: 'ceb-11', dialect: 'cebuano', target: 'Sakay ko.', english: "I'm riding." },
  { id: 'ceb-12', dialect: 'cebuano', target: 'Para po!', english: 'Stop, please!' },
  { id: 'ceb-13', dialect: 'cebuano', target: 'Bayad po.', english: 'Here is the payment.' },
  { id: 'ceb-14', dialect: 'cebuano', target: 'Pila ni?', english: 'How much is this?' },
  { id: 'ceb-15', dialect: 'cebuano', target: 'Barato ra.', english: 'It is cheap.' },
  { id: 'ceb-16', dialect: 'cebuano', target: 'Mahal kaayo.', english: 'It is very expensive.' },
  { id: 'ceb-17', dialect: 'cebuano', target: 'Pwede pamura?', english: 'Can it be cheaper?' },
  { id: 'ceb-18', dialect: 'cebuano', target: 'Mopalit ko ug isda.', english: 'I will buy fish.' },
  { id: 'ceb-19', dialect: 'cebuano', target: 'Gusto ko mokaon.', english: 'I want to eat.' },
  { id: 'ceb-20', dialect: 'cebuano', target: 'Gusto ko og tubig.', english: 'I want water.' },
  { id: 'ceb-21', dialect: 'cebuano', target: 'Mangaon na ta!', english: "Let's eat now!" },
  { id: 'ceb-22', dialect: 'cebuano', target: 'Unsa nang orasa?', english: 'What time is it?' },
  { id: 'ceb-23', dialect: 'cebuano', target: 'Init ang panahon.', english: 'The weather is hot.' },
  { id: 'ceb-24', dialect: 'cebuano', target: 'Asa ang merkado?', english: 'Where is the market?' },
  { id: 'ceb-25', dialect: 'cebuano', target: 'Diretso lang.', english: 'Just go straight.' },

  // Ilocano — 25 (12 reviewer words + 13 Kamusta/Recap lines, pulled via HQ course-editor
  // from Stage 0 lessons 101001-101003: vowels, consonants/'ng', glottal stop)
  { id: 'ilo-01', dialect: 'ilocano', target: 'wen', english: 'yes' },
  { id: 'ilo-02', dialect: 'ilocano', target: 'lima', english: 'five' },
  { id: 'ilo-03', dialect: 'ilocano', target: 'talo', english: 'three' },
  { id: 'ilo-04', dialect: 'ilocano', target: 'aso', english: 'dog' },
  { id: 'ilo-05', dialect: 'ilocano', target: 'ngipen', english: 'tooth' },
  { id: 'ilo-06', dialect: 'ilocano', target: 'ngan', english: 'to eat' },
  { id: 'ilo-07', dialect: 'ilocano', target: 'kayo', english: 'tree' },
  { id: 'ilo-08', dialect: 'ilocano', target: 'balay', english: 'house' },
  { id: 'ilo-09', dialect: 'ilocano', target: 'bata', english: 'gown / robe' },
  { id: 'ilo-10', dialect: 'ilocano', target: "bata'", english: 'to snuff out / extinguish' },
  { id: 'ilo-11', dialect: 'ilocano', target: 'baba', english: 'down / below' },
  { id: 'ilo-12', dialect: 'ilocano', target: "baba'", english: 'to lower / descend' },
  { id: 'ilo-13', dialect: 'ilocano', target: 'Kablaaw! Siak ni Wika, ti gayyemmo iti daytoy a panagbasa.', english: 'Hello! I am Wika, your friend on this reading journey.' },
  { id: 'ilo-14', dialect: 'ilocano', target: 'Wen, agadal tayo iti pagsasao nga Ilocano.', english: 'Yes, we are going to study the Ilocano language.' },
  { id: 'ilo-15', dialect: 'ilocano', target: 'Denggem a naimbag dagiti bokales tayo.', english: 'Listen carefully to our vowels.' },
  { id: 'ilo-16', dialect: 'ilocano', target: 'Naimbag ti panagbasa yo! Ammomon dagiti bokales ti Ilocano.', english: 'Great reading! You now know the Ilocano vowels.' },
  { id: 'ilo-17', dialect: 'ilocano', target: 'Agbiag! Agkita tayo manen iti sumaruno a leksion.', english: 'Long live! See you again in the next lesson.' },
  { id: 'ilo-18', dialect: 'ilocano', target: 'Kablaaw! Naragsakak a makatungtongka.', english: 'Greetings! I am happy to talk with you.' },
  { id: 'ilo-19', dialect: 'ilocano', target: 'Dadduma a konsonante iti Ilocano ket naiduma bassit.', english: 'Some consonants in Ilocano are a bit different.' },
  { id: 'ilo-20', dialect: 'ilocano', target: "Naimbag a trabaho! Nasursuroyon ti 'ng' sound.", english: "Good work! You have learned the 'ng' sound." },
  { id: 'ilo-21', dialect: 'ilocano', target: 'Naimbag nga aldaw! Siak ni Wika.', english: 'Good day! I am Wika.' },
  { id: 'ilo-22', dialect: 'ilocano', target: 'Denggem ket paliiwem daytoy baro a uni.', english: 'Listen and notice this new sound.' },
  { id: 'ilo-23', dialect: 'ilocano', target: 'Agyamanak! Nalaingka nga agdenggeg.', english: 'Thank you! You are good at listening.' },
  { id: 'ilo-24', dialect: 'ilocano', target: 'Addaan ti abilidadmo a mangngeg ti impit.', english: 'You now have the ability to hear the glottal stop.' },
  { id: 'ilo-25', dialect: 'ilocano', target: 'Agbiag ti lumalay-at a pigsam!', english: 'Long live your growing strength!' },
];
