import React from 'react';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function Messages() {
  const { t } = useLanguage();

  const conversations = [
    { id: 1, name: 'Alex Producer', message: 'Hey, interested in collaborating?', time: '2 min' },
    { id: 2, name: 'Sarah Singer', message: 'I loved your last track!', time: '1 hour' },
    { id: 3, name: 'Mike Drummer', message: 'Let me know about that project...', time: '3 hours' },
  ];

  return (
    <div className="page messages-page">
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
              <div key={conv.id} className="conversation-item">
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
            <div className="no-selection">
              <p>{t('messages.selectConversation')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
