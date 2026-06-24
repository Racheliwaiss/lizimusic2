import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function Contact() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const EMAIL = 'lizimusicplatform@gmail.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="page contact-page">
      <section className="hero">
        <div className="hero-sound-bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        <h1>{t('contact.title')}</h1>
        <p>{t('contact.subtitle')}</p>
      </section>

      <div className="contact-grid">
        {/* Main email card */}
        <div className="contact-card contact-card-main">
          <div className="contact-card-icon">✉️</div>
          <h2>{t('contact.emailUs')}</h2>
          <p className="contact-card-desc">{t('contact.emailDesc')}</p>

          <div className="contact-email-box">
            <span className="contact-email-addr">{EMAIL}</span>
            <button className="contact-copy-btn" onClick={handleCopy} title={t('contact.copy')}>
              {copied ? '✓' : '📋'}
            </button>
          </div>

          {copied && (
            <p className="contact-copied-msg">{t('contact.copied')}</p>
          )}

          <a
            href={`mailto:${EMAIL}`}
            className="contact-mailto-btn"
          >
            {t('contact.sendEmail')}
          </a>
        </div>

        {/* Info cards */}
        <div className="contact-info-col">
          <div className="contact-info-card">
            <div className="contact-info-icon">🎵</div>
            <h3>{t('contact.collabTitle')}</h3>
            <p>{t('contact.collabDesc')}</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">🛠️</div>
            <h3>{t('contact.supportTitle')}</h3>
            <p>{t('contact.supportDesc')}</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">💡</div>
            <h3>{t('contact.feedbackTitle')}</h3>
            <p>{t('contact.feedbackDesc')}</p>
          </div>
        </div>
      </div>

      <div className="contact-response-note">
        <span className="contact-note-icon">⏱️</span>
        {t('contact.responseNote')}
      </div>
    </div>
  );
}

export default Contact;
