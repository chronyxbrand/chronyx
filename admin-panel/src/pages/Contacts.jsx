import React, { useEffect, useMemo, useState } from 'react';
import { EnvelopeSimple, CheckCircle, CircleNotch } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

function InboxStat({ label, value }) {
  return (
    <div className="card inbox-stat-card">
      <p className="inbox-stat-label">{label}</p>
      <h3>{value}</h3>
    </div>
  );
}

const Contacts = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
      if (!selectedId && data?.length) {
        setSelectedId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesFilter =
        activeFilter === 'all' ? true : activeFilter === 'unread' ? !message.is_read : Boolean(message.is_read);

      const query = search.trim().toLowerCase();
      const matchesSearch = !query
        ? true
        : [message.name, message.email, message.message].some((field) =>
            String(field || '').toLowerCase().includes(query),
          );

      return matchesFilter && matchesSearch;
    });
  }, [messages, activeFilter, search]);

  const selectedMessage =
    filteredMessages.find((message) => message.id === selectedId) ||
    messages.find((message) => message.id === selectedId) ||
    null;

  const unreadCount = messages.filter((message) => !message.is_read).length;

  const updateReadState = async (message, nextReadState) => {
    setUpdatingId(message.id);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: nextReadState })
        .eq('id', message.id);

      if (error) throw error;

      setMessages((current) =>
        current.map((item) => (item.id === message.id ? { ...item, is_read: nextReadState } : item)),
      );
    } catch (error) {
      alert(`Failed to update message state: ${error.message}`);
    } finally {
      setUpdatingId('');
    }
  };

  const handleSelectMessage = async (message) => {
    setSelectedId(message.id);
    if (!message.is_read) {
      await updateReadState(message, true);
    }
  };

  if (loading) return <div>Loading contact inbox...</div>;

  return (
    <div className="inbox-page">
      <div className="page-header">
        <div>
          <h2>Contact Inbox</h2>
          <p className="cms-page-subtitle">
            Review messages sent from the storefront contact form and keep track of what still needs attention.
          </p>
        </div>
      </div>

      <section className="inbox-stat-grid">
        <InboxStat label="Total Messages" value={messages.length} />
        <InboxStat label="Unread" value={unreadCount} />
        <InboxStat label="Read" value={messages.length - unreadCount} />
      </section>

      <section className="inbox-toolbar">
        <div className="inbox-filter-group">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'read', label: 'Read' },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`inbox-filter-btn ${activeFilter === filter.id ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="inbox-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, or message..."
        />
      </section>

      <section className="inbox-layout">
        <div className="card inbox-list-card">
          {filteredMessages.length === 0 ? (
            <p className="marketing-empty">No contact messages match the current filter.</p>
          ) : (
            <div className="inbox-list">
              {filteredMessages.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  className={`inbox-list-item ${selectedId === message.id ? 'is-active' : ''} ${
                    message.is_read ? 'is-read' : 'is-unread'
                  }`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="inbox-list-row">
                    <strong>{message.name}</strong>
                    <span>{new Date(message.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="inbox-list-email">{message.email}</div>
                  <p>{message.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card inbox-detail-card">
          {selectedMessage ? (
            <div className="inbox-detail">
              <div className="inbox-detail-header">
                <div>
                  <p className="inbox-detail-eyebrow">{selectedMessage.is_read ? 'Read message' : 'Unread message'}</p>
                  <h3>{selectedMessage.name}</h3>
                  <a href={`mailto:${selectedMessage.email}`} className="inbox-detail-email">
                    {selectedMessage.email}
                  </a>
                </div>
                <button
                  type="button"
                  className="btn-secondary inbox-mark-btn"
                  onClick={() => updateReadState(selectedMessage, !selectedMessage.is_read)}
                  disabled={updatingId === selectedMessage.id}
                >
                  {updatingId === selectedMessage.id ? (
                    <CircleNotch size={16} className="spin-icon" />
                  ) : selectedMessage.is_read ? (
                    <EnvelopeSimple size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {selectedMessage.is_read ? 'Mark as unread' : 'Mark as read'}
                </button>
              </div>

              <div className="inbox-meta-row">
                <div>
                  <span>Received</span>
                  <strong>{new Date(selectedMessage.created_at).toLocaleString()}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedMessage.is_read ? 'Read' : 'Unread'}</strong>
                </div>
              </div>

              <div className="inbox-message-body">
                {selectedMessage.message.split('\n').map((line, index) => (
                  <p key={`${selectedMessage.id}-${index}`}>{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="inbox-empty-detail">
              <h3>No message selected</h3>
              <p>Choose a contact message from the list to review the full customer request.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Contacts;
