import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Vessia Racing',
  description: 'Privacy policy for Vessia Racing',
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
          <h1 style={{ color: '#3EA822', fontSize: '2.2rem', marginBottom: '8px' }}>Privacy Policy</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '40px' }}>Last updated: July 16, 2026</p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Data Controller</h2>
            <p style={textStyle}>
              Vessia Racing is the data controller for the personal data collected through this
              website. Vessia Racing is an informal racing team/community without its own registered
              organization number. If you have questions about privacy or wish to exercise your
              rights, you can contact us at{' '}
              <a href="mailto:vessiaracing@gmail.com" style={{ color: '#3EA822' }}>vessiaracing@gmail.com</a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. Data Protection Officer</h2>
            <p style={textStyle}>
              Vessia Racing is not required to have a data protection officer and has not appointed
              one. Privacy-related inquiries should be directed to the contact email above.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. What information we collect</h2>
            <p style={textStyle}>
              When you create an account, we store:
            </p>
            <ul style={{ ...textStyle, paddingLeft: '20px' }}>
              <li>Name</li>
              <li>Email address (used only for login and to contact you about your account)</li>
              <li>Password (never stored in plain text — only as an irreversible, salted hash)</li>
              <li>Self-selected experience level</li>
            </ul>
            <p style={textStyle}>In addition, you may optionally add:</p>
            <ul style={{ ...textStyle, paddingLeft: '20px' }}>
              <li>Profile picture and bio</li>
              <li>A connection to your iRacing account (iRacing Customer ID and statistics such as iRating, safety rating, and license class, retrieved via iRacing&apos;s official API)</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. Purpose and legal basis</h2>
            <p style={textStyle}>
              Your name, email, and password are processed in order to create and manage your user
              account and give you access to log in to the website. This is necessary to provide the
              service to you, pursuant to the General Data Protection Regulation (GDPR) Article 6(1)(b)
              (performance of a contract).
            </p>
            <p style={textStyle}>
              Profile picture, bio, and the iRacing connection are optional and are processed on the
              basis of your consent, pursuant to GDPR Article 6(1)(a). You may withdraw your consent at
              any time by removing this information from your profile page, without affecting the
              lawfulness of processing carried out before the withdrawal.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. Who we share information with</h2>
            <p style={textStyle}>We use the following data processors to operate the website:</p>
            <ul style={{ ...textStyle, paddingLeft: '20px' }}>
              <li><strong>Supabase</strong> — database and storage of user data</li>
              <li><strong>Vercel</strong> — hosting of the website and storage of uploaded images</li>
              <li><strong>iRacing</strong> — only if you choose to connect your iRacing account, in order to retrieve your statistics</li>
            </ul>
            <p style={textStyle}>
              We never sell your personal data, and we do not share it with any third parties other
              than those mentioned here.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Transfers to countries outside the EU/EEA</h2>
            <p style={textStyle}>
              Our data processors (Supabase and Vercel) may process and store data on servers located
              outside the EU/EEA. In such cases, the transfer is safeguarded through the European
              Commission&apos;s Standard Contractual Clauses or an equivalent approved transfer
              mechanism used by the provider.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. How long we store your information</h2>
            <p style={textStyle}>
              We store your information for as long as you have an active user account with us. You can
              delete your account and all associated information yourself at any time, using the
              &quot;Delete Profile&quot; button on your{' '}
              <Link href="/profile" style={{ color: '#3EA822' }}>profile page</Link>. This permanently
              and immediately removes your data from our systems.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>8. Your rights</h2>
            <p style={textStyle}>Under GDPR Articles 15–21, you have the right to:</p>
            <ul style={{ ...textStyle, paddingLeft: '20px' }}>
              <li>Access the information we hold about you</li>
              <li>Have inaccurate information corrected</li>
              <li>Have your information deleted (&quot;the right to be forgotten&quot;)</li>
              <li>Request restriction of processing</li>
              <li>Object to processing</li>
              <li>Receive your information in a structured, machine-readable format (data portability)</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p style={textStyle}>
              To exercise your rights, contact us at vessiaracing@gmail.com. You may also file a
              complaint with the Norwegian Data Protection Authority (Datatilsynet) if you believe we
              are processing your personal data in violation of the regulations:{' '}
              <a href="https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/klage-til-datatilsynet/" target="_blank" rel="noopener noreferrer" style={{ color: '#3EA822' }}>
                datatilsynet.no
              </a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>9. Is providing this information mandatory?</h2>
            <p style={textStyle}>
              Name, email, and password are required to create a user account — without these, we
              cannot create or manage your account. Profile picture, bio, and the iRacing connection are
              entirely optional, and choosing not to add them has no impact on your account access.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>10. Automated decision-making and profiling</h2>
            <p style={textStyle}>
              We do not use automated decision-making or profiling that produces legal effects
              concerning you or similarly significantly affects you.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>11. Security</h2>
            <p style={textStyle}>
              Your password is stored only as a salted hash and never in plain text. All traffic to the
              website is encrypted (HTTPS), and access to administrative parts of the system is
              restricted to team management.
            </p>
          </div>

          <div style={{ marginTop: '40px' }}>
            <Link href="/register" style={{ color: '#3EA822', textDecoration: 'underline' }}>
              ← Back to registration
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
