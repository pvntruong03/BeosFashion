import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

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

const INTERNAL_CONTEXT_MARKERS = [
  'active product catalog',
  'store policies',
  'active coupons',
  'recent conversation',
  'current customer question',
];

const isInternalContextReply = (text) => {
  const normalized = (text || '').trim().toLowerCase();
  return INTERNAL_CONTEXT_MARKERS.some((marker) => normalized.startsWith(marker));
};

const KNOWLEDGE_BASE_EN = [
  {
    keywords: ['t-shirt', 'tee', 'size', '175cm', 'men', 'fit', 'sizing'],
    reply: 'For a height of 175cm (~65-72kg), BEO recommends **Size L** for the **BEO AirFlow Cotton Oversized T-Shirt** for a comfortable relaxed silhouette, or **Size M** if you prefer a tailored regular fit. Explore our catalog under the Tops & T-Shirts collection!'
  },
  {
    keywords: ['coupon', 'code', 'discount', 'voucher', 'promo', 'beo10', 'sale'],
    reply: '🎉 Exclusive active promotions available at BEO STORE:\n• **BEO10**: 10% OFF orders from 300,000 VND (max 100,000 VND discount).\n• **BEO50K**: 50,000 VND direct discount on orders from 400,000 VND.\n• **Free Standard Shipping** automatically applied on all orders over 500,000 VND!'
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
    reply: '📦 To track your order, visit **"My Orders"** in your account menu, or enter your Order ID (e.g. `BEO-260814-...`) on our Order Tracking page for live real-time fulfillment updates!'
  },
  {
    keywords: ['material', 'fabric', 'beo-airflow', 'cotton', 'essentials', 'quality'],
    reply: '✨ **Proprietary BEO Essentials Fabric Technologies**:\n• **BEO AirFlow**: Ultra-fine breathable microfibers with instant dry cooling touch.\n• **100% Long-Staple Supima Cotton**: Lustrous hand-feel and durable shape retention wash after wash.'
  }
];

const KNOWLEDGE_BASE_VI = [
  {
    keywords: ['size', 'kích cỡ', 'tu van', 'tư vấn', 'chiều cao', 'chieu cao', 'cân nặng', 'can nang'],
    reply: 'Bạn cho BEO biết chiều cao theo cm, cân nặng theo kg, giới tính và kiểu mặc mong muốn để được gợi ý size phù hợp nhé.'
  },
  {
    keywords: ['mã giảm', 'ma giam', 'khuyến mãi', 'khuyen mai', 'voucher', 'beo10'],
    reply: 'Bạn có thể thử mã **BEO10** cho đơn đủ điều kiện. Giỏ hàng sẽ kiểm tra điều kiện và số tiền giảm chính xác.'
  },
  {
    keywords: ['địa chỉ', 'dia chi', 'showroom', 'cửa hàng', 'cua hang', 'cần thơ', 'can tho'],
    reply: 'Showroom BEO Cần Thơ ở **209 Đường 30 Tháng 4, Xuân Khánh, Cần Thơ**, mở cửa hằng ngày từ 08:00 đến 22:00.'
  },
  {
    keywords: ['giao hàng', 'giao hang', 'đổi trả', 'doi tra', 'đổi size', 'doi size'],
    reply: 'BEO miễn phí giao hàng tiêu chuẩn cho đơn từ 500.000 VND và hỗ trợ đổi trả hoặc đổi size/màu trong 30 ngày khi sản phẩm đáp ứng điều kiện.'
  }
];

const detectChatLanguage = (text, interfaceLanguage) => {
  const lower = text.toLowerCase();
  const plain = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('đ', 'd');
  const vietnameseSignals = [
    'toi ', 'minh ', 'ban ', 'cao ', 'nang ', 'tu van', 'san pham', 'cua hang',
    'ma giam', 'khuyen mai', 'doi tra', 'giao hang', 'con hang'
  ];
  const englishSignals = [
    'what ', 'where ', 'how ', 'please ', 'can you', 'suggest ', 'recommend ', 'is there', 'are there', 'do you', 'i am ', "i'm ",
    'shipping', 'return', 'store', 'product', 'weight', 'height', 'discount',
    'order', 'track', 'available', 'hello', 'i need', 'i want'
  ];

  if (lower.includes('đ') || /[\u0300-\u036f]/.test(lower.normalize('NFD')) || vietnameseSignals.some((signal) => plain.includes(signal))) {
    return 'vi';
  }
  if (englishSignals.some((signal) => lower.includes(signal))) return 'en';
  return interfaceLanguage === 'vi' ? 'vi' : 'en';
};

const createWelcomeMessage = (lang) => ({
  id: 'welcome',
  sender: 'bot',
  text: lang === 'vi'
    ? 'Xin chào! Tôi là Trợ lý BEO. Tôi có thể hỗ trợ bạn chọn size, gợi ý phối đồ, tra cứu mã giảm giá hoặc thông tin showroom Cần Thơ. Bạn cần giúp gì hôm nay ạ?'
    : 'Hello! I am the BEO Assistant. I can help with size recommendations, outfit styling, voucher codes, or Can Tho showroom details. How may I help you today?',
  time: new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
});

export const AiChatWidget = () => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState(() => [createWelcomeMessage(lang)]);
  const [aiStatus, setAiStatus] = useState({ loaded: false, configured: false, provider: 'BEO Knowledge Base' });
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages((current) => current.filter((message) => (
      message.sender !== 'bot' || !isInternalContextReply(message.text)
    )));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    let mounted = true;
    api.get('/ai/status')
      .then((status) => mounted && setAiStatus({ loaded: true, ...status }))
      .catch(() => mounted && setAiStatus((current) => ({ ...current, loaded: true })));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setMessages((current) => current.length === 1 && current[0].id === 'welcome'
      ? [createWelcomeMessage(lang)]
      : current);
  }, [lang]);

  const getLocalFallback = (text) => {
    const lower = text.toLowerCase();
    const responseLanguage = detectChatLanguage(text, lang);
    const knowledgeBase = responseLanguage === 'vi' ? KNOWLEDGE_BASE_VI : KNOWLEDGE_BASE_EN;
    const matched = knowledgeBase.find((item) =>
      item.keywords.some((keyword) => lower.includes(keyword))
    );

    if (matched) return matched.reply;

    return responseLanguage === 'vi'
      ? 'Kết nối AI đang tạm gián đoạn. Bạn vẫn có thể hỏi về size, mã giảm giá, showroom hoặc chính sách giao hàng; BEO sẽ trả lời bằng dữ liệu dự phòng.'
      : 'The AI connection is temporarily unavailable. You can still ask about sizing, promotions, stores, or shipping policies using BEO fallback data.';
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isTyping) return;
    const responseLanguage = detectChatLanguage(text, lang);

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', {
        message: text.trim(),
        language: lang,
        history: messages.slice(-6).map((message) => ({
          role: message.sender === 'bot' ? 'model' : 'user',
          content: message.text,
        })),
      });
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply,
        provider: response.aiEnabled
          ? response.model
          : (responseLanguage === 'vi' ? 'BEO dự phòng' : 'BEO fallback'),
        time: new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: getLocalFallback(text.trim()),
        provider: responseLanguage === 'vi' ? 'BEO ngoại tuyến' : 'BEO offline',
        time: new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = lang === 'vi' ? QUICK_PROMPTS_VI : QUICK_PROMPTS_EN;
  const assistantStatus = aiStatus.configured
    ? (lang === 'vi' ? 'AI đã kết nối' : 'AI connected')
    : (lang === 'vi' ? 'Hỗ trợ BEO' : 'BEO support');

  return (
    <aside aria-label="BEO Customer Support Widget">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ai-chat-fab"
          aria-label={lang === 'vi' ? `Mở Trợ lý BEO, ${assistantStatus.toLowerCase()}` : `Open BEO Assistant, ${assistantStatus.toLowerCase()}`}
          title={lang === 'vi' ? 'Mở Trợ lý Ảo BEO & Hỗ trợ đa kênh' : 'Open BEO AI Assistant & Support'}
        >
          <div className="ai-chat-fab-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <div className="ai-chat-title">
              BEO AI Chat
            </div>
            <div className="ai-chat-status-line">
              <span className="ai-chat-status-dot" aria-hidden="true" style={{ backgroundColor: aiStatus.configured ? '#00875a' : '#b7791f' }} />
              {aiStatus.configured
                ? (lang === 'vi' ? 'AI trực tuyến • Hỗ trợ 24/7' : 'AI online • 24/7 support')
                : (lang === 'vi' ? 'Hỗ trợ BEO • Phản hồi tức thì' : 'BEO support • Instant replies')}
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
                  <span>{aiStatus.configured ? 'BEO AI Stylist' : 'BEO Shopping Support'}</span>
                  <span style={{ fontSize: '0.65rem', backgroundColor: aiStatus.configured ? '#00875a' : '#9a6700', color: '#fff', padding: '1px 5px', borderRadius: '2px' }}>
                    {aiStatus.configured ? 'AI READY' : 'BEO SUPPORT'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#aaa' }}>
                  {aiStatus.configured
                    ? (lang === 'vi' ? `Được hỗ trợ bởi ${aiStatus.provider}` : `Powered by ${aiStatus.provider}`)
                    : (lang === 'vi' ? 'Tư vấn thời trang và mua sắm theo dữ liệu BEO' : 'Fashion and shopping guidance from BEO data')}
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
                      {m.provider ? `${m.provider} • ` : ''}{m.time}
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
                    disabled={isTyping}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #ddd',
                      fontSize: '0.72rem',
                      color: '#333',
                      cursor: isTyping ? 'wait' : 'pointer',
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
                  maxLength={1000}
                  disabled={isTyping}
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
                  disabled={!inputVal.trim() || isTyping}
                  style={{
                    backgroundColor: inputVal.trim() && !isTyping ? '#e60012' : '#ccc',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 14px',
                    cursor: inputVal.trim() && !isTyping ? 'pointer' : 'not-allowed',
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
