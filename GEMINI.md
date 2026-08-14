# BEO Fashion & Antigravity Core Guidelines

## 🌟 ALWAYS-ACTIVE SKILLS PROTOCOL (TỰ ĐỘNG BẬT SKILLS)

Whenever interacting with this codebase or assisting the user, Antigravity **MUST ALWAYS AUTOMATICALLY ACTIVATE AND APPLY** the following two core skill suites without waiting for explicit prompt triggers:

---

### 1. 🎨 UI/UX PRO MAX SKILL SUITE (Luôn Tự Động Kích Hoạt Cho Mọi Tác Vụ Giao Diện)
- **Repository**: `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` (Đã cài đặt tại `.agents/skills/ui-ux-pro-max/`)
- **Scope**: Tất cả các yêu cầu liên quan đến Frontend, React components, CSS, thiết kế giao diện, màu sắc, bố cục (layout), typography, micro-animations, UX, form input, responsive và accessibility.
- **Skills áp dụng**:
  - `ui-ux-pro-max`: Áp dụng 84 UI styles, 192 bảng màu chuẩn, 74 bộ font chữ, 119 quy chuẩn UX (touch target $\ge 44\times 44\text{px}$, tương phản $\ge 4.5:1$, mobile-first responsive).
  - `design-system`: Thiết kế tokens kiến trúc (colors, spacing, shadows, radii).
  - `ui-styling`: Tailwind CSS & Vanilla CSS tinh chỉnh thẩm mỹ cao cấp.
  - `brand`: Nhất quán nhận diện thương hiệu BEO Modern Fashion (Logo BEO STORE, bảng màu, typography, tone giọng).
- **Tra cứu nhanh tri thức Design**: Chạy lệnh `node .agents/skills/ui-ux-pro-max/scripts/search.js "<chủ đề>"` bất kỳ lúc nào.
- **Nguyên tắc thẩm mỹ bắt buộc**: Thiết kế phải đạt chuẩn **Premium & State of the art**, có micro-interactions mượt mà, hover effects tinh tế, tuyệt đối không dùng giao diện thô sơ/cũ kỹ.

---

### 2. 🧠 UNDERSTAND-ANYTHING SKILL SUITE (Luôn Tự Động Kích Hoạt Cho Mọi Tác Vụ Kiến Trúc & Codebase)
- **Scope**: Tất cả các yêu cầu liên quan đến đọc hiểu cấu trúc dự án, giải thích luồng hoạt động (business flows), tra cứu API, phân tích tác động thay đổi (diff impact), kiến trúc nhiều tầng (layered architecture), và sơ đồ tri thức (Knowledge Graph).
- **Skills áp dụng**:
  - `understand`: Tự động phân tích và đồng bộ đồ thị tri thức kiến trúc `.ua/knowledge-graph.json`.
  - `understand-chat` & `understand-explain`: Tự động tham chiếu sơ đồ liên kết giữa Backend Spring Boot $\leftrightarrow$ Frontend React $\leftrightarrow$ Database H2/MySQL khi giải thích code hoặc trả lời câu hỏi.
  - `understand-domain`: Bóc tách và theo dõi đúng các luồng nghiệp vụ thời trang (Đặt hàng $\rightarrow$ Phân bổ kho $\rightarrow$ Quản lý đơn tại Showroom Cần Thơ $\rightarrow$ Giao hàng $\rightarrow$ Báo cáo ca).
  - `understand-dashboard`: Sẵn sàng khởi chạy và cập nhật dashboard trực quan hóa dự án khi cần.

---

## 🏬 PROJECT CONTEXT: BEO MODERN FASHION
- **Brand**: BEO Modern Fashion (Chi nhánh trung tâm: Cần Thơ - `STR-CT-01`).
- **Hotline**: `1900019199999`
- **Socials**: Facebook (`https://www.facebook.com/beofashionstorecantho/`), Zalo (`https://zalo.me/0567740000`).
- **Roles**: Chỉ có 3 vai trò duy nhất: `ROLE_CUSTOMER`, `ROLE_STAFF_MANAGER`, `ROLE_ADMIN`.
- **Tech Stack**:
  - Backend: Java 17 + Spring Boot 3 + Spring Data JPA + Spring Security + JWT + VietQR.
  - Frontend: React (Vite) + Tailwind CSS + Lucide Icons.
