'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { ChatMessage } from '@/types';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

/** Build a stable conversation_id from job_id + two participant UUIDs (sorted for symmetry) */
function buildConversationId(jobId: string, userIdA: string, userIdB: string): string {
  const sorted = [userIdA, userIdB].sort();
  return `${jobId}__${sorted[0]}__${sorted[1]}`;
}

export default function ChatModal() {
  const { activeModal, activeModalShift, closeModal, userProfile } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [failedMsg, setFailedMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const dealerId = activeModalShift?.applicants?.[0]?.id ?? ''; // fallback; real dealer_id from job row
  const dealerName = activeModalShift?.dealerName || 'Dealer';
  const dealerAvatarLetter = dealerName.charAt(0).toUpperCase() || 'D';
  const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const isUserAuth = isUUID(userProfile.id);

  // Determine conversation id & receiver
  const jobId = activeModalShift?.id || 'general';
  // We use the shift's dealer_id if we can get it; otherwise use a placeholder so the UI still works
  const convId = isUserAuth && isUUID(dealerId)
    ? buildConversationId(jobId, userProfile.id, dealerId)
    : `job:${jobId}`;
  const receiverId = isUUID(dealerId) ? dealerId : null;

  // Load history & subscribe to realtime — extracted to useCallback so it can be called on open
  const loadHistory = useCallback(() => {
    if (!isSupabaseConfigured() || !isUserAuth) return () => {};
    const supabase = getSupabaseBrowserClient();

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .then(({ data: dbMsgs }) => {
        if (dbMsgs) {
           
          const mapped: ChatMessage[] = dbMsgs.map((m: any) => ({
            id: m.id,
            conversationId: m.conversation_id,
            senderId: m.sender_id,
            senderName: m.sender_id === userProfile.id ? userProfile.name : dealerName,
            receiverId: m.receiver_id || undefined,
            message: m.message,
            timestamp: m.created_at,
            read: m.read || false,
          }));
          setMessages(mapped);
        }
      });

    // Subscribe to new incoming messages
    const channel = supabase
      .channel(`chat:${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
           
          const newMsg = payload.new as any;
          if (newMsg.sender_id !== userProfile.id) {
            setMessages((prev) => [
              ...prev.filter((m) => m.id !== newMsg.id),
              {
                id: newMsg.id,
                conversationId: newMsg.conversation_id,
                senderId: newMsg.sender_id,
                senderName: dealerName,
                receiverId: newMsg.receiver_id || undefined,
                message: newMsg.message,
                timestamp: newMsg.created_at,
                read: false,
              },
            ]);

            // Mark as read (only allowed to receiver via RLS)
            supabase
              .from('messages')
              .update({ read: true })
              .eq('id', newMsg.id)
              .then(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // convId, dealerName, userProfile.id/name are stable within a modal session
   
  }, [convId, dealerName, userProfile.id, userProfile.name, isUserAuth]);

  useEffect(() => {
    if (activeModal !== 'chat-modal') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]);
     
    setFailedMsg(null);
    const cleanup = loadHistory();
    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, activeModalShift?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (activeModal !== 'chat-modal') return null;

  const doSend = async (text: string) => {
    if (!text.trim() || isSending) return;

    if (!isUserAuth) {
      setFailedMsg('Please sign in to send messages.');
      return;
    }

    if (!receiverId) {
      setFailedMsg("We couldn't find the dealer's contact info. Please try again later.");
      return;
    }

    setIsSending(true);
    setFailedMsg(null);

    // Optimistic message
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      conversationId: convId,
      senderId: userProfile.id,
      senderName: userProfile.name,
      receiverId,
      message: text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputMessage('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: inserted, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          sender_id: userProfile.id,
          receiver_id: receiverId,
          message: text,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one from DB
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId
            ? { ...m, id: inserted.id, timestamp: inserted.created_at }
            : m
        )
      );
    } catch {
      // Remove optimistic message and show retry
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setFailedMsg(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => {
    const text = inputMessage.trim();
    if (text) doSend(text);
  };

  const handleRetry = () => {
    if (failedMsg) {
      const text = failedMsg;
      setFailedMsg(null);
      doSend(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`chat-modal-overlay ${activeModal === 'chat-modal' ? 'open' : ''}`}
      id="chat-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Chat with ${dealerName}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('chat-modal');
      }}
    >
      <div className="chat-container">
        <div className="chat-header">
          <button
            className="chat-back-btn"
            onClick={() => closeModal('chat-modal')}
            aria-label="Close chat"
          >
            ‹
          </button>
          <div className="chat-avatar" id="chat-avatar-text">
            {dealerAvatarLetter}
          </div>
          <div className="chat-user-info">
            <div className="chat-user-name" id="chat-user-name">
              {dealerName}
            </div>
            <div className="chat-user-status" id="chat-user-status">
              {isUserAuth ? 'Online' : 'Sign in to chat'}
            </div>
          </div>
        </div>

        <div className="chat-messages" id="chat-messages">
          {messages.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', opacity: 0.5, fontSize: '14px' }}>
              {isUserAuth
                ? 'No messages yet. Say hello!'
                : 'Sign in to start chatting with the employer.'}
            </div>
          )}
          {messages.map((msg) => {
            const isSent = msg.senderId === userProfile.id;
            const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                key={msg.id}
                className={`chat-message ${isSent ? 'sent' : 'received'}`}
              >
                {msg.message}
                <span className="chat-message-time">{timeStr}</span>
              </div>
            );
          })}

          {failedMsg && (
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--danger, #f87171)', flex: 1 }}>
                ⚠️ Message failed to send.
              </span>
              <button
                onClick={handleRetry}
                style={{
                  fontSize: '13px',
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            id="chat-input"
            placeholder={isUserAuth ? 'Type a message…' : 'Sign in to chat'}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isUserAuth || isSending}
            aria-label="Message input"
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!isUserAuth || isSending || !inputMessage.trim()}
            aria-label="Send message"
          >
            {isSending ? (
              <span style={{ fontSize: '12px' }}>…</span>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
