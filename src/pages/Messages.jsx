import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function Messages() {
  const { t } = useLanguage();
  const [selectedConv, setSelectedConv] = useState(null);

  const conversations = [
    { id: 1, name: 'Alex Producer', message: 'Hey, interested in collaborating?', time: '2 min', phone: '+1234567890' },
    { id: 2, name: 'Sarah Singer', message: 'I loved your last track!', time: '1 hour', phone: '+1987654321' },
    { id: 3, name: 'Mike Drummer', message: 'Let me know about that project...', time: '3 hours', phone: '+1555666777' },
  ];

  const openWhatsApp = (phone, name) => {
    const message = `Hi ${name}, I'd like to connect with you on LIZI!`;
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="page messages-page">
      <section className="hero">
        <h1>💬 {t('messages.title')}</h1>
      </section>
      <div className="messages-container">
        <div className="messages-sidebar">
          <h2>{t('messages.title')}</h2>
          <input 
            type="text" 
            placeholder={t('messages.searchConversations')}
            className="search-input"
          />
          <div className="conversations-list">
            {conversations.map((conv) => (
              <div 
                key={conv.id} 
                className={`conversation-item ${selectedConv?.id === conv.id ? 'active' : ''}`}
                onClick={() => setSelectedConv(conv)}
              >
                <div className="avatar">👤</div>
                <div className="conversation-info">
                  <h4>{conv.name}</h4>
                  <p>{conv.message}</p>
                </div>
                <span className="time">{conv.time}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="messages-main">
          <div className="chat-area">
            {!selectedConv ? (
              <div className="no-selection">
                <p>{t('messages.selectConversation')}</p>
              </div>
            ) : (
              <div className="chat-selected">
                <div className="chat-header">
                  <h3>{selectedConv.name}</h3>
                  <p className="last-message">{selectedConv.message}</p>
                </div>
                <div className="chat-content">
                  <div className="message incoming">
                    <p>{selectedConv.message}</p>
                    <span className="time-stamp">{selectedConv.time} ago</span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button 
                    className="whatsapp-btn"
                    onClick={() => openWhatsApp(selectedConv.phone, selectedConv.name)}
                  >
                    💬 Chat on WhatsApp
                  </button>
                  <button className="email-btn">
                    📧 Send Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
