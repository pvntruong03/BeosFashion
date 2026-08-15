import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Phone,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const QUICK_PROMPTS_EN = [
  '👕 Suggest t-shirt size for 175cm',
  '🎁 What discount codes are available?',
  '🏬 Can Tho flagship showroom address',
  '🚚 Shipping & 30-day return policy',
  '📦 How to track my order',
];

const QUICK_PROMPTS_VI = [
  '👕 Gợi ý áo thun cho nam 1m75',
  '🎁 Mã giảm giá hôm nay?',
  '🏬 Địa chỉ showroom Cần Thơ',
  '🚚 Chính sách giao hàng & đổi trả',
  '📦 Cách theo dõi đơn hàng',
];

const KNOWLEDGE_BASE_EN = [
  {
    keywords: ['t-shirt', 'tee', 'size', '175cm', 'men', 'fit', 'sizing'],
    reply: 'For a height of 175cm (~65-72kg), BEO recommends **Size L** for the **AIRism Cotton Oversized T-Shirt** for a comfortable relaxed silhouette, or **Size M** if you prefer a tailored regular fit. Explore our catalog under the Tops & T-Shirts collection!'
  },
  {
    keywords: ['coupon', 'code', 'discount', 'voucher', 'promo', 'beo10', 'sale'],
    reply: '🎉 Exclusive active promotions available at BEO STORE:\n• **BEO10**: 10% OFF orders from 300,000 VND (max 100,000 VND discount).\n• **LIFEWEAR50K**: 50,000 VND direct discount on orders from 400,000 VND.\n• **Free Standard Shipping** automatically applied on all orders over 500,000 VND!'
  },
  {
    keywords: ['can tho', 'showroom', 'address', 'store', 'location', 'hours'],
    reply: '🏬 **BEO STORE Can Tho Flagship Showroom**:\n• Address: **209 30th April Street, Xuan Khanh Ward, Ninh Kieu District, Can Tho City**.\n• Hotline: `1900019199999`\n• Hours: 08:00 - 22:00 Daily (Click & Collect ready in 2 hours)!'
  },
  {
    keywords: ['shipping', 'delivery', 'return', 'exchange', 'freeship', 'how long'],
    reply: '🚚 **BEO Shipping & Return Guarantee**:\n• Standard nationwide delivery within 2-3 business days.\n• **Free Shipping** on orders over 500,000 VND (standard rate 30,000 VND).\n• **30-Day Hassle-Free Returns & Exchanges** at any BEO store or online!'
  },
  {
    keywords: ['track', 'order', 'tracking', 'status', 'check'],
    reply: '📦 To track your order, visit **"My Orders"** in your account menu, or enter your Order ID (e.g. `UQ-260814-...`) on our Order Tracking page for live real-time fulfillment updates!'
  },
  {
    keywords: ['material', 'fabric', 'airism', 'cotton', 'lifewear', 'quality'],
    reply: '✨ **Proprietary LifeWear Fabric Technologies**:\n• **AIRism**: Ultra-fine breathable microfibers with instant dry cooling touch.\n• **100% Long-Staple Supima Cotton**: Lustrous hand-feel and durable shape retention wash after wash.'
  }
];

export const AiChatWidget = ({ onNavigate }) => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: lang === 'vi'
        ? 'Xin chào! Tôi là **Trợ lý Ảo BEO AI**. Tôi có thể hỗ trợ bạn chọn size, gợi ý phối đồ LifeWear, tra cứu mã giảm giá hoặc thông tin showroom Cần Thơ. Bạn cần giúp gì hôm nay ạ?'
        : 'Hello! I am the **BEO AI Assistant**. I can assist you with size recommendations, LifeWear outfit styling, voucher codes, or showroom details. How may I help you today?',
      time: new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let matchedReply = null;

      for (const item of KNOWLEDGE_BASE_EN) {
        if (item.keywords.some((kw) => lower.includes(kw))) {
          matchedReply = item.reply;
          break;
        }
      }

      if (!matchedReply) {
        matchedReply = lang === 'vi'
          ? `Cảm ơn bạn đã nhắn tin! Tôi đã ghi nhận yêu cầu "${text}". Bạn có thể xem nhanh danh mục sản phẩm, hoặc liên hệ trực tiếp đội ngũ CSKH BEO qua **Zalo / Messenger / Hotline** ở tab "Kênh Hỗ Trợ" bên trên nhé!`
          : `Thank you for your message! I've noted your inquiry for "${text}". You can explore our catalog or contact our concierge directly via **Zalo / Facebook / Hotline** on the Support tab above!`;
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: matchedReply,
        time: new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const quickPrompts = lang === 'vi' ? QUICK_PROMPTS_VI : QUICK_PROMPTS_EN;

  return (
    <aside aria-label="BEO Customer Support Widget">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ai-chat-fab"
          title={lang === 'vi' ? 'Mở Trợ lý Ảo BEO & Hỗ trợ đa kênh' : 'Open BEO AI Assistant & Support'}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={22} color="#e60012" />
            {hasUnread && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#e60012',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite'
                }}
              />
            )}
          </div>
          <div className="ai-chat-text" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              BEO AI Chat
            </div>
            <div style={{ fontSize: '0.7rem', color: '#aaa' }}>
              {lang === 'vi' ? 'Hỗ trợ 24/7 & MXH' : '24/7 AI & Live Support'}
            </div>
          </div>
        </button>
      )}

      {/* Main Chat Box Container */}
      {isOpen && (
        <div className="ai-chat-popup">
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#111111',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #e60012'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  backgroundColor: '#e60012',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
              >
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>BEO AI Stylist</span>
                  <span style={{ fontSize: '0.65rem', backgroundColor: '#00875a', color: '#fff', padding: '1px 5px', borderRadius: '2px' }}>
                    ONLINE
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#aaa' }}>
                  {lang === 'vi' ? 'Trợ lý thời trang & Hỗ trợ mua sắm' : 'Fashion Concierge & Shopping Assistant'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px' }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', backgroundColor: '#fafafa' }}>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                backgroundColor: activeTab === 'chat' ? '#ffffff' : 'transparent',
                fontWeight: '700',
                fontSize: '0.82rem',
                color: activeTab === 'chat' ? '#e60012' : '#666',
                borderBottom: activeTab === 'chat' ? '2px solid #e60012' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Bot size={15} />
              <span>{lang === 'vi' ? 'Trợ Lý Ảo AI' : 'BEO AI Concierge'}</span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                backgroundColor: activeTab === 'social' ? '#ffffff' : 'transparent',
                fontWeight: '700',
                fontSize: '0.82rem',
                color: activeTab === 'social' ? '#e60012' : '#666',
                borderBottom: activeTab === 'social' ? '2px solid #e60012' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Phone size={15} />
              <span>{lang === 'vi' ? 'Kênh Hỗ Trợ (Zalo/FB)' : 'Live Channels (Zalo/FB)'}</span>
            </button>
          </div>

          {/* ================= TAB 1: AI CHAT ================= */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Messages Scroll Area */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#fdfdfd' }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '84%',
                        padding: '10px 14px',
                        backgroundColor: m.sender === 'user' ? '#111111' : '#f0f2f5',
                        color: m.sender === 'user' ? '#ffffff' : '#111111',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        borderRadius: '2px',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {m.text}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#999', marginTop: '3px' }}>
                      {m.time}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '0.8rem' }}>
                    <Bot size={14} color="#e60012" />
                    <span>{lang === 'vi' ? 'BEO AI đang phản hồi...' : 'BEO AI is typing...'}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              <div style={{ padding: '8px 12px', backgroundColor: '#f8f8f8', borderTop: '1px solid #eee', overflowX: 'auto', display: 'flex', gap: '6px', whiteSpace: 'nowrap' }}>
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #ddd',
                      fontSize: '0.72rem',
                      color: '#333',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#e60012')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ddd')}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#ffffff',
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  placeholder={lang === 'vi' ? 'Nhập câu hỏi cho trợ lý BEO...' : 'Ask BEO Stylist anything...'}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    border: '1px solid #ccc',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  style={{
                    backgroundColor: inputVal.trim() ? '#e60012' : '#ccc',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 14px',
                    cursor: inputVal.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* ================= TAB 2: MULTI-CHANNEL SOCIAL LINKS ================= */}
          {activeTab === 'social' && (
            <div style={{ padding: '20px 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5, textAlign: 'center', marginBottom: '6px' }}>
                {lang === 'vi'
                  ? 'Kết nối trực tiếp với chuyên viên chăm sóc khách hàng của BEO Fashion qua các kênh yêu thích:'
                  : 'Connect directly with our customer concierge team across channels:'}
              </div>

              {/* Zalo Official */}
              <a
                href="https://zalo.me/0567740000"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  backgroundColor: '#f0f7ff',
                  border: '1px solid #b3d7ff',
                  textDecoration: 'none',
                  color: '#0068ff',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0efff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f7ff')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#0068ff', color: '#fff', fontWeight: '900', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    Z
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0052cc' }}>Zalo Support Official</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>zalo.me/0567740000</div>
                  </div>
                </div>
                <ExternalLink size={16} />
              </a>

              {/* Facebook Fanpage */}
              <a
                href="https://www.facebook.com/beofashionstorecantho/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  backgroundColor: '#f6f0ff',
                  border: '1px solid #decbf7',
                  textDecoration: 'none',
                  color: '#0084ff',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede2fc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f6f0ff')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#1877f2', color: '#fff', fontWeight: '900', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                    f
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1877f2' }}>Facebook Fanpage</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>facebook.com/beofashionstorecantho</div>
                  </div>
                </div>
                <ExternalLink size={16} />
              </a>

              {/* Telegram Support */}
              <a
                href="https://t.me/beofashion_support"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  textDecoration: 'none',
                  color: '#0284c7',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#229ed9', color: '#fff', fontWeight: '900', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    ✈
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0369a1' }}>Telegram Channel</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>@beofashion_support</div>
                  </div>
                </div>
                <ExternalLink size={16} />
              </a>

              {/* Hotline */}
              <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#666', marginBottom: '4px' }}>
                  {lang === 'vi' ? 'TỔNG ĐÀI HOTLINE CSKH' : 'CUSTOMER SERVICE HOTLINE'}
                </div>
                <a href="tel:1900019199999" style={{ fontSize: '1.25rem', fontWeight: '900', color: '#e60012', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={18} /> 1900019199999
                </a>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                  {lang === 'vi' ? '(08:00 - 22:00 hàng ngày)' : '(08:00 - 22:00 Daily)'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
