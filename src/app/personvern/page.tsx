import Link from 'next/link';

export const metadata = {
  title: 'Personvernerklæring | Vessia Racing',
  description: 'Personvernerklæring for Vessia Racing',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '28px',
};

const headingStyle: React.CSSProperties = {
  color: '#3EA822',
  fontSize: '1.3rem',
  marginBottom: '10px',
};

const textStyle: React.CSSProperties = {
  color: '#ddd',
  lineHeight: '1.7',
  fontSize: '1rem',
};

export default function PersonvernPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a', paddingTop: '100px', paddingBottom: '60px' }}>
      <main style={{ padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: '#3EA822', fontSize: '2.2rem', marginBottom: '8px' }}>Personvernerklæring</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '40px' }}>Sist oppdatert: 16. juli 2026</p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Behandlingsansvarlig</h2>
            <p style={textStyle}>
              Vessia Racing er behandlingsansvarlig for personopplysningene som samles inn gjennom denne
              nettsiden. Vessia Racing er et uformelt racing-lag/community uten eget organisasjonsnummer.
              Har du spørsmål om personvern eller ønsker å benytte deg av dine rettigheter, kan du kontakte
              oss på <a href="mailto:vessiaracing@gmail.com" style={{ color: '#3EA822' }}>vessiaracing@gmail.com</a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. Personvernombud</h2>
            <p style={textStyle}>
              Vessia Racing er ikke pålagt å ha personvernombud, og har ikke utnevnt et slikt. Henvendelser
              om personvern rettes direkte til kontakt-e-posten over.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Hvilke opplysninger vi samler inn</h2>
            <p style={textStyle}>
              Når du oppretter en bruker lagrer vi:
            </p>
            <ul style={{ ...textStyle, paddingLeft: '20px' }}>
              <li>Navn</li>
              <li>E-postadresse (brukes kun til innlogging og for å kontakte deg om kontoen din)</li>
              <li>Passord (lagres aldri i klartekst — kun som en irreversibel, saltet hash)</li>
              <li>Selvvalgt erfaringsnivå</li>
            </ul>
            <p style={textStyle}>I tillegg kan du, dersom du selv velger det, legge til:</p>
            <ul style={{ ...textStyle, paddingLeft: '20px' }}>
              <li>Profilbilde og bio</li>
              <li>Kobling til din iRacing-konto (iRacing Customer ID og statistikk som iRating, safety rating og lisensklasse, hentet via iRacings offisielle API)</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. Formål og rettslig grunnlag</h2>
            <p style={textStyle}>
              Navn, e-post og passord behandles for å kunne opprette og administrere brukerkontoen din og
              gi deg tilgang til innlogging på nettsiden. Dette er nødvendig for å kunne levere tjenesten
              til deg, jf. personvernforordningen (GDPR) artikkel 6 nr. 1 bokstav b (oppfyllelse av avtale).
            </p>
            <p style={textStyle}>
              Profilbilde, bio og iRacing-tilkobling er frivillige og behandles på grunnlag av ditt samtykke,
              jf. GDPR artikkel 6 nr. 1 bokstav a. Du kan når som helst trekke tilbake samtykket ved å fjerne
              disse opplysningene fra profilsiden din, uten at det påvirker lovligheten av behandlingen fram
              til da.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. Hvem vi deler opplysninger med</h2>
            <p style={textStyle}>Vi bruker følgende databehandlere for å drifte nettsiden:</p>
            <ul style={{ ...textStyle, paddingLeft: '20px' }}>
              <li><strong>Supabase</strong> — database og lagring av brukerdata</li>
              <li><strong>Vercel</strong> — hosting av nettsiden og lagring av opplastede bilder</li>
              <li><strong>iRacing</strong> — kun dersom du selv velger å koble til iRacing-kontoen din, for å hente inn statistikken din</li>
            </ul>
            <p style={textStyle}>
              Vi selger aldri personopplysningene dine videre, og deler dem ikke med andre tredjeparter enn
              de som er nevnt her.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Overføring til land utenfor EU/EØS</h2>
            <p style={textStyle}>
              Våre databehandlere (Supabase og Vercel) kan behandle og lagre data på servere utenfor EU/EØS.
              I slike tilfeller er overføringen sikret gjennom EU-kommisjonens standard personvernbestemmelser
              (Standard Contractual Clauses) eller tilsvarende godkjente overføringsgrunnlag hos leverandøren.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. Hvor lenge vi lagrer opplysningene</h2>
            <p style={textStyle}>
              Vi lagrer opplysningene dine så lenge du har en aktiv brukerkonto hos oss. Dersom du ønsker å
              slette kontoen din og opplysningene som er knyttet til den, kan du kontakte oss på
              vessiaracing@gmail.com, så sletter vi dette uten unødig opphold.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>8. Dine rettigheter</h2>
            <p style={textStyle}>Du har, i henhold til GDPR artikkel 15–21, rett til å:</p>
            <ul style={{ ...textStyle, paddingLeft: '20px' }}>
              <li>Få innsyn i hvilke opplysninger vi har lagret om deg</li>
              <li>Få rettet feilaktige opplysninger</li>
              <li>Få slettet opplysningene dine (&quot;retten til å bli glemt&quot;)</li>
              <li>Kreve begrensning av behandlingen</li>
              <li>Protestere mot behandlingen</li>
              <li>Få utlevert opplysningene dine i et strukturert, maskinlesbart format (dataportabilitet)</li>
              <li>Trekke tilbake et samtykke når som helst</li>
            </ul>
            <p style={textStyle}>
              For å benytte deg av rettighetene dine, kontakt oss på vessiaracing@gmail.com. Du kan også klage
              til Datatilsynet dersom du mener vi behandler personopplysningene dine i strid med regelverket:{' '}
              <a href="https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/klage-til-datatilsynet/" target="_blank" rel="noopener noreferrer" style={{ color: '#3EA822' }}>
                datatilsynet.no
              </a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>9. Er det frivillig å oppgi opplysningene?</h2>
            <p style={textStyle}>
              Navn, e-post og passord er nødvendig for å opprette en brukerkonto — uten disse kan vi ikke
              opprette eller drifte kontoen din. Profilbilde, bio og iRacing-tilkobling er helt frivillig, og
              det får ingen konsekvenser for tilgangen til kontoen din om du lar være å legge dette til.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>10. Automatiserte avgjørelser og profilering</h2>
            <p style={textStyle}>
              Vi bruker ikke automatiserte avgjørelser eller profilering som har rettsvirkning for deg eller
              på tilsvarende måte påvirker deg i betydelig grad.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>11. Sikkerhet</h2>
            <p style={textStyle}>
              Passordet ditt lagres kun som en saltet hash og aldri i klartekst. All trafikk til nettsiden er
              kryptert (HTTPS), og tilgang til administrative deler av systemet er begrenset til
              teamledelsen.
            </p>
          </div>

          <div style={{ marginTop: '40px' }}>
            <Link href="/register" style={{ color: '#3EA822', textDecoration: 'underline' }}>
              ← Tilbake til registrering
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
