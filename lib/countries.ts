// Mirrored from mobile app: lib/data/countries.ts
// Source of truth: VeloWedding/lib/data/countries.ts — keep in sync manually

export type CountryDoc = {
  code: string;
  flag: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'complex';
  arrivalDays: string;
  keyDoc: string;
  steps: string[];
  notes?: string;
  officialUrl?: string;
};

export const COUNTRIES: CountryDoc[] = [
  {
    code: 'US', flag: '🇺🇸', name: 'United States', difficulty: 'complex', arrivalDays: '5–7 working days before',
    keyDoc: 'Atto Notorio + Nulla Osta',
    steps: [
      'Obtain Atto Notorio at the nearest Italian Consulate in the US (bring 2 witnesses, passports, birth certificates)',
      'Have all documents apostilled by the Secretary of State of your state',
      'Translate documents into Italian by a certified translator',
      'Arrive in Italy 5–7 working days before the ceremony',
      'Obtain Nulla Osta at the US Embassy in Italy (Rome, Milan, Florence, Naples, Venice or Palermo)',
      'Sign Declaration of Intention to Marry at the local Comune (Ufficio di Stato Civile)',
      'Civil banns waived for non-residents — proceed to ceremony',
    ],
    notes: 'The Atto Notorio must be obtained no earlier than 3 months before the wedding date or it will expire. Women previously married need to be single for 300+ days.',
    officialUrl: 'https://it.usembassy.gov/getting-married-in-italy/',
  },
  {
    code: 'GB', flag: '🇬🇧', name: 'United Kingdom', difficulty: 'medium', arrivalDays: '1–3 working days before',
    keyDoc: 'Certificate of No Impediment (CNI)',
    steps: [
      'Obtain a Certificate of No Impediment (CNI) from your local register office in England/Wales, or Scotland/Northern Ireland equivalent',
      'Have the CNI apostilled at the Foreign, Commonwealth & Development Office (FCDO)',
      'Obtain Nulla Osta at the UK Embassy in Rome before the ceremony',
      'Translate all documents into Italian',
      'Arrive 1–3 days before and sign Declaration of Intention to Marry at the Comune',
    ],
    notes: 'Post-Brexit (2021) the process is similar but allow extra time for embassy appointments. The CNI is valid for 3–6 months depending on the issuing office.',
    officialUrl: 'https://www.gov.uk/marriages-civil-partnerships/getting-married-abroad',
  },
  {
    code: 'DE', flag: '🇩🇪', name: 'Germany', difficulty: 'easy', arrivalDays: '1–3 working days before',
    keyDoc: 'Ehefähigkeitszeugnis (Certificate of No Impediment)',
    steps: [
      'Obtain Ehefähigkeitszeugnis from your local Standesamt (registry office) in Germany',
      'Have it apostilled at the competent authority in your German state (Landgericht)',
      'Translate into Italian by a certified translator',
      'Arrive 1–3 days before and sign Declaration of Intention to Marry at the Comune',
    ],
    notes: 'Germany has a bilateral agreement with Italy making this relatively straightforward. One of the easier processes for EU citizens.',
    officialUrl: 'https://www.auswaertiges-amt.de/en/visa-service/konsularisches/eheschliessung-node',
  },
  {
    code: 'AU', flag: '🇦🇺', name: 'Australia', difficulty: 'complex', arrivalDays: '5–7 working days before',
    keyDoc: 'Atto Notorio (obtained in Australia)',
    steps: [
      'Obtain Atto Notorio from the Italian Embassy or Consulate in Australia (state where you reside)',
      'Have Australian documents apostilled by the Department of Foreign Affairs and Trade (DFAT)',
      'Translate all documents into Italian',
      'Arrive 5–7 working days before ceremony',
      'Sign Declaration of Intention to Marry at the Comune with an interpreter',
    ],
    notes: 'It is strongly recommended to obtain the Atto Notorio in Australia before departure — requesting it in Italy from a court can have long waiting times.',
    officialUrl: 'https://italy.embassy.gov.au/files/rome/MARRIAGE%20IN%20ITALY.pdf',
  },
  {
    code: 'FR', flag: '🇫🇷', name: 'France', difficulty: 'easy', arrivalDays: '1–3 working days before',
    keyDoc: 'Certificat de Capacité Matrimoniale',
    steps: [
      'Obtain Certificat de Capacité Matrimoniale from your local mairie (town hall) in France',
      'Have it apostilled at the French competent authority',
      'Translate into Italian',
      'Arrive 1–3 days before and sign Declaration of Intention to Marry at the Comune',
    ],
    notes: 'As an EU country with similar civil law traditions, France has one of the simpler processes.',
    officialUrl: 'https://it.diplomatie.gouv.fr/fr/etat-civil/mariage-t',
  },
  {
    code: 'NL', flag: '🇳🇱', name: 'Netherlands', difficulty: 'easy', arrivalDays: '1–3 working days before',
    keyDoc: 'Internationale Uittreksel (Multi-language extract)',
    steps: [
      'Obtain international multi-language extract from your local gemeente (municipality)',
      'This document is already valid across EU — no apostille needed for EU countries',
      'Obtain Nulla Osta from the Dutch Embassy in Rome (or consulate in Milan)',
      'Arrive 1–3 days before and sign Declaration at the Comune',
    ],
    notes: 'The Netherlands uses the CIEC multilingual form which simplifies the process significantly within EU.',
  },
  {
    code: 'SE', flag: '🇸🇪', name: 'Sweden', difficulty: 'easy', arrivalDays: '1–3 working days before',
    keyDoc: 'Äktenskapscertifikat / Intyg om äktenskapshinder saknas',
    steps: [
      'Obtain a certificate of no impediment from Skatteverket (Swedish Tax Agency)',
      'Have it apostilled by the Swedish government',
      'Translate into Italian',
      'Obtain Nulla Osta from the Swedish Embassy in Rome',
      'Arrive 1–3 days before and sign Declaration at the Comune',
    ],
    notes: 'Sweden is a non-EU but Schengen country. The process is straightforward and similar to other Nordic countries.',
  },
  {
    code: 'NO', flag: '🇳🇴', name: 'Norway', difficulty: 'easy', arrivalDays: '1–3 working days before',
    keyDoc: 'Ekteskapsattest',
    steps: [
      'Obtain Ekteskapsattest (certificate of no impediment) from Statsforvalteren (County Governor)',
      'Have it apostilled',
      'Translate into Italian',
      'Obtain Nulla Osta from the Norwegian Embassy in Rome',
      'Arrive 1–3 days before and sign Declaration at the Comune',
    ],
  },
  {
    code: 'DK', flag: '🇩🇰', name: 'Denmark', difficulty: 'easy', arrivalDays: '1–3 working days before',
    keyDoc: 'Prøvelsesattest',
    steps: [
      'Obtain Prøvelsesattest from your local church or civil registry in Denmark',
      'Have it apostilled',
      'Translate into Italian',
      'Obtain Nulla Osta from the Danish Embassy in Rome',
      'Arrive 1–3 days before and sign Declaration at the Comune',
    ],
  },
  {
    code: 'BE', flag: '🇧🇪', name: 'Belgium', difficulty: 'medium', arrivalDays: '1–3 working days before',
    keyDoc: 'Nulla Osta from Belgian Embassy',
    steps: [
      'Obtain Nulla Osta from the Belgian Embassy in Rome (requires birth certificates and proof of single status)',
      'Translate and legalise all documents from Belgium with a certified translator',
      'Use certified true copies (not originals) for Belgian documents',
      'Arrive 1–3 days before and sign Declaration at the Comune',
    ],
    notes: 'Belgium requires a legalised translation of the Nulla Osta before submission to the town hall.',
  },
  {
    code: 'CH', flag: '🇨🇭', name: 'Switzerland', difficulty: 'easy', arrivalDays: '1–3 working days before',
    keyDoc: 'Ehefähigkeitszeugnis / Certificat de capacité matrimoniale',
    steps: [
      'Obtain certificate from your local Zivilstandsamt (civil registry office) in Switzerland',
      'Have it apostilled',
      'Translate into Italian',
      'Obtain Nulla Osta from the Swiss Embassy in Rome',
      'Arrive 1–3 days before and sign Declaration at the Comune',
    ],
    notes: 'Switzerland has cantons — check specific requirements with your local Zivilstandsamt as they may vary slightly.',
  },
  {
    code: 'AT', flag: '🇦🇹', name: 'Austria', difficulty: 'easy', arrivalDays: '1–3 working days before',
    keyDoc: 'Ehefähigkeitszeugnis',
    steps: [
      'Obtain Ehefähigkeitszeugnis from your local Standesamt in Austria',
      'Have it apostilled',
      'Translate into Italian',
      'Sign Declaration at the Comune (often just the town hall fee — one of the simplest processes)',
    ],
    notes: 'Austria has a bilateral agreement with Italy. Among the easiest countries — sometimes only the town hall fee applies.',
  },
  {
    code: 'CA', flag: '🇨🇦', name: 'Canada', difficulty: 'complex', arrivalDays: '5–7 working days before',
    keyDoc: 'Atto Notorio + Nulla Osta',
    steps: [
      'Obtain Atto Notorio from the Italian Consulate in Canada (varies by province)',
      'Have Canadian documents apostilled at Global Affairs Canada',
      'Translate into Italian',
      'Arrive 5–7 working days before ceremony',
      'Obtain Nulla Osta at the nearest Italian Embassy or at a Canadian consulate in Italy',
      'Sign Declaration at the Comune',
    ],
    notes: 'Canada is a federal state — requirements may vary by province. Quebec residents may have additional civil law considerations.',
    officialUrl: 'https://www.italyincanada.esteri.it',
  },
  {
    code: 'IE', flag: '🇮🇪', name: 'Ireland', difficulty: 'medium', arrivalDays: '1–3 working days before',
    keyDoc: 'Certificate of Freedom to Marry',
    steps: [
      'Obtain Certificate of Freedom to Marry from the General Register Office (GRO) in Ireland',
      'Have it apostilled at the Department of Foreign Affairs in Dublin',
      'Translate into Italian',
      'Obtain Nulla Osta from the Irish Embassy in Rome',
      'Arrive 1–3 days before and sign Declaration at the Comune',
    ],
  },
  {
    code: 'NZ', flag: '🇳🇿', name: 'New Zealand', difficulty: 'medium', arrivalDays: '3–5 working days before',
    keyDoc: 'Certificate of No Impediment',
    steps: [
      'Obtain Certificate of No Impediment from the Department of Internal Affairs (Births, Deaths & Marriages)',
      'Have it apostilled by the NZ Ministry of Foreign Affairs',
      'Translate into Italian',
      'Arrive 3–5 days before ceremony',
      'Sign Declaration at the Comune',
    ],
    officialUrl: 'https://www.govt.nz/browse/births-deaths-marriages-and-civil-unions/marriage-and-civil-union/',
  },
  {
    code: 'BR', flag: '🇧🇷', name: 'Brazil', difficulty: 'complex', arrivalDays: '5–7 working days before',
    keyDoc: 'Certidão Negativa de Impedimento',
    steps: [
      'Obtain Certidão Negativa de Impedimento from your local civil registry (Cartório) in Brazil',
      'Have all documents apostilled (Brazil is a member of the Hague Apostille Convention)',
      'Translate into Italian by a certified "sworn translator" (traduttore giurato)',
      'Arrive 5–7 days before — both spouses must appear at the Italian Consulate or in Italy',
      'Sign Declaration at the Comune',
    ],
    notes: 'Brazilian documents require a "tradução juramentada" (sworn translation). Allow 3–4 months for the full process.',
  },
  {
    code: 'JP', flag: '🇯🇵', name: 'Japan', difficulty: 'complex', arrivalDays: '5–7 working days before',
    keyDoc: 'Ikon-Yōken-Gubi-Shōmei-sho (婚姻要件具備証明書)',
    steps: [
      'Obtain Ikon-Yōken-Gubi-Shōmei-sho from your local municipal office (役所) in Japan',
      'Have it certified/apostilled at the Ministry of Foreign Affairs of Japan',
      'Translate into Italian by a certified translator',
      'Arrive 5–7 working days before ceremony',
      'Obtain Nulla Osta from the Japanese Embassy in Rome',
      'Sign Declaration at the Comune with an interpreter',
    ],
    notes: 'Japan uses a different romanization system — ensure names on all documents match exactly. Allow 3–4 months.',
  },
  {
    code: 'IL', flag: '🇮🇱', name: 'Israel', difficulty: 'medium', arrivalDays: '3–5 working days before',
    keyDoc: 'Certificate of No Impediment from Israeli Embassy',
    steps: [
      'Obtain Certificate of No Impediment from the Israeli Ministry of Interior or Population Registry',
      'Have it apostilled (Israel is a member of the Hague Apostille Convention)',
      'Translate into Italian',
      'Arrive 3–5 days before ceremony',
      'Obtain Nulla Osta from the Israeli Embassy in Rome',
      'Sign Declaration at the Comune',
    ],
    notes: 'Religious considerations may affect documentation. Civil marriage is not performed in Israel, so Italian civil marriage may be the primary legal ceremony.',
  },
  {
    code: 'ZA', flag: '🇿🇦', name: 'South Africa', difficulty: 'medium', arrivalDays: '3–5 working days before',
    keyDoc: 'Certificate of No Impediment',
    steps: [
      'Obtain Certificate of No Impediment from the Department of Home Affairs in South Africa',
      'Have it apostilled at the Department of International Relations and Cooperation (DIRCO)',
      'Translate into Italian',
      'Arrive 3–5 days before ceremony',
      'Sign Declaration at the Comune',
    ],
  },
  {
    code: 'ES', flag: '🇪🇸', name: 'Spain', difficulty: 'easy', arrivalDays: '1–3 working days before',
    keyDoc: 'Certificado de Capacidad Matrimonial',
    steps: [
      'Obtain Certificado de Capacidad Matrimonial from your local Registro Civil in Spain',
      'Apostille at the Ministry of Justice in Spain',
      'Translate into Italian',
      'Obtain Nulla Osta from the Spanish Embassy in Rome',
      'Arrive 1–3 days before and sign Declaration at the Comune',
    ],
    notes: 'Spain, as an EU country with similar civil law traditions, has one of the simpler processes.',
  },
];
