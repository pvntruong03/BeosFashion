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

const QUICK_PROMPTS = [
  '👕 Gợi ý áo thun cho nam 1m75',
  '🎁 Mã giảm giá hôm nay?',
  '🏬 Địa chỉ showroom Cần Thơ',
  '🚚 Chính sách giao hàng & đổi trả',
  '📦 Cách theo dõi đơn hàng',
];

const KNOWLEDGE_BASE = [
  {
    keywords: ['áo thun', 'ao thun', 'nam', '1m75', 'size', 'kích thước', 'chon size'],
    reply: 'Với chiều cao 1m75 (cân nặng ~65-72kg), BEO gợi ý bạn chọn **Size L** cho dòng áo **AIRism Cotton Oversized T-Shirt** để mặc chuẩn phom thoải mái hoặc **Size M** nếu thích phom Regular vừa vặn. Bạn có thể xem ngay bộ sưu tập Áo Thun Nam ở mục BỘ SƯU TẬP nhé!'
  },
  {
    keywords: ['mã giảm giá', 'ma giam gia', 'voucher', 'coupon', 'khuyen mai', 'uu dai', 'beo10'],
    reply: '🎉 Hiện tại BEO đang có các mã ưu đãi độc quyền:\n• **BEO10**: Giảm ngay 10% (tối đa 100.000đ cho đơn từ 300.000đ).\n• **LIFEWEAR50K**: Giảm ngay 50.000đ cho đơn từ 400.000đ.\n• **Freeship toàn quốc** tự động áp dụng cho đơn từ 500.000đ!'
  },
  {
    keywords: ['cần thơ', 'can tho', 'xuan khanh', 'chi nhánh', 'dia chi', 'showroom', 'cua hang', 'dong khoi'],
    reply: '🏬 Showroom **BEO Vincom Xuân Khánh Cần Thơ** tọa lạc tại: **Tòa tháp Vincom Xuân Khánh, 209 Đường 30 Tháng 4, Phường Xuân Khánh, Quận Ninh Kiều, Cần Thơ**.\n• Hotline: `0292 3788 888`\n• Giờ mở cửa: 09:30 - 22:00 hàng ngày (Có dịch vụ Click & Collect nhận hàng trong 2 giờ)!'
  },
  {
    keywords: ['giao hàng', 'giao hang', 'doi tra', 'đổi trả', 'freeship', 'phi ship', 'bao lau'],
    reply: '🚚 **Chính sách giao hàng & Đổi trả của BEO:**\n• Giao hàng tiêu chuẩn 2-3 ngày toàn quốc.\n• **Miễn phí vận chuyển** cho đơn từ 500.000đ (phí tiêu chuẩn 30.000đ).\n• Hỗ trợ đổi hàng trong vòng **30 ngày** tại bất kỳ showroom BEO nào trên toàn quốc!'
  },
  {
    keywords: ['tra cứu', 'tra cuu', 'theo doi', 'don hang', 'order', 'kiem tra don'],
    reply: '📦 Để tra cứu đơn hàng, bạn có thể vào menu **"Đơn hàng của tôi"** trong tài khoản, hoặc nhập Mã đơn hàng (VD: `UQ-260814-...`) trên trang Kiểm tra đơn. Mọi cập nhật trạng thái sẽ được hiển thị theo thời gian thực!'
  },
  {
    keywords: ['chất liệu', 'chat lieu', 'airism', 'heattech', 'lifewear'],
    reply: '✨ **Công nghệ độc quyền LifeWear của BEO:**\n• **AIRism**: Vải sợi siêu mịn mát lạnh, thoáng khí gấp 3 lần, thấm hút mồ hôi tối ưu cho mùa hè.\n• **100% Supima Cotton**: Sợi bông dài cao cấp giữ phom bền đẹp sau nhiều lần giặt.'
  }
];

export const AiChatWidget = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'social'
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là **Trợ lý Ảo BEO AI**. Tôi có thể hỗ trợ bạn chọn size, gợi ý phối đồ LifeWear, tra cứu mã giảm giá hoặc thông tin showroom Cần Thơ. Bạn cần giúp gì hôm nay ạ?',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
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
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    // AI Response Simulation with pattern matching
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matchedReply = null;

      for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some((kw) => lower.includes(kw))) {
          matchedReply = item.reply;
          break;
        }
      }

      if (!matchedReply) {
        matchedReply = `Cảm ơn bạn đã nhắn tin! Tôi đã ghi nhận yêu cầu "${text}". Bạn có thể xem nhanh danh mục sản phẩm, hoặc liên hệ trực tiếp đội ngũ CSKH BEO qua **Zalo / Messenger / Hotline** ở tab "Kênh Hỗ Trợ" bên trên nhé!`;
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: matchedReply,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <aside aria-label="BEO Customer Support Widget">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            backgroundColor: '#111111',
            color: '#ffffff',
            border: '2px solid #e60012',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Mở Trợ lý Ảo BEO & Hỗ trợ đa kênh"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              BEO AI Chat
            </div>
            <div style={{ fontSize: '0.7rem', color: '#aaa' }}>
              Hỗ trợ 24/7 & MXH
            </div>
          </div>
        </button>
      )}

      {/* Main Chat Box Container */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 2000,
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
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
                  Trợ lý thời trang & Hỗ trợ mua sắm
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px' }}
              title="Đóng cửa sổ"
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
              <span>Trợ Lý Ảo AI</span>
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
              <span>Kênh Hỗ Trợ (Zalo/FB)</span>
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
                    <span>BEO AI đang phản hồi...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel / Pills */}
              <div style={{ padding: '8px 12px', backgroundColor: '#f8f8f8', borderTop: '1px solid #eee', overflowX: 'auto', display: 'flex', gap: '6px', whiteSpace: 'nowrap' }}>
                {QUICK_PROMPTS.map((p, idx) => (
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
                  placeholder="Nhập câu hỏi cho trợ lý BEO..."
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
                Kết nối trực tiếp với chuyên viên chăm sóc khách hàng của <strong>BEO Fashion</strong> qua các kênh yêu thích:
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
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0052cc' }}>Zalo Chat Official</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>zalo.me/0567740000</div>
                  </div>
                </div>
                <ExternalLink size={16} />
              </a>

              {/* Facebook Messenger */}
              <a
                href="https://m.me/beofashionstorecantho"
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
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#0084ff', color: '#fff', fontWeight: '900', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    M
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0066cc' }}>Facebook Messenger</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>m.me/beofashionstorecantho</div>
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
                <div style={{ fontSize: '0.78rem', color: '#666', marginBottom: '4px' }}>TỔNG ĐÀI HOTLINE CSKH</div>
                <a href="tel:1900019199999" style={{ fontSize: '1.25rem', fontWeight: '900', color: '#e60012', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={18} /> 1900019199999
                </a>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                  (08:00 - 22:00 hàng ngày)
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
