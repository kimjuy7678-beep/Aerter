import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Package, Heart, MapPin, ChevronRight, LogOut, ShoppingBag, Check, Search, X } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useOrders, type Order } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useAddresses, type SavedAddress } from '../context/AddressContext';
import { useDaumPostcode } from '../hooks/useDaumPostcode';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';
import ProtectedRoute from '../components/ProtectedRoute';

const STATUS_STYLE: Record<string, string> = {
  '결제 완료': 'text-foreground/70',
  '배송 준비': 'text-amber-600',
  '배송 중': 'text-blue-600',
  '배송 완료': 'text-foreground/40',
  '취소됨': 'text-red-400',
};

const CANCELLABLE_STATUSES = ['결제 완료', '배송 준비'];

const ORDER_STEPS = ['결제 완료', '배송 준비', '배송 중', '배송 완료'] as const;

function OrderStatusTimeline({ status }: { status: Order['status'] }) {
  if (status === '취소됨') {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <span className="font-pretendard text-[11px] tracking-wide text-red-400">
          주문이 취소되었어요
        </span>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.indexOf(status as (typeof ORDER_STEPS)[number]);

  return (
    <div className="flex items-center py-4">
      {ORDER_STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === ORDER_STEPS.length - 1;
        return (
          <div key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${reached ? 'bg-foreground' : 'bg-border'
                  }`}
              />
              <span
                className={`font-pretendard text-[10px] tracking-wide whitespace-nowrap transition-colors duration-300 ${reached ? 'text-foreground' : 'text-muted-foreground'
                  }`}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-px mx-2 mb-4 transition-colors duration-300 ${i < currentIndex ? 'bg-foreground' : 'bg-border'
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const CANCEL_REASON_OPTIONS = [
  { value: '', label: '취소 사유를 선택해 주세요' },
  { value: '단순 변심', label: '단순 변심' },
  { value: '다른 상품을 잘못 주문했어요', label: '다른 상품을 잘못 주문했어요' },
  { value: '배송이 너무 늦어요', label: '배송이 너무 늦어요' },
  { value: '상품 정보와 달라요', label: '상품 정보와 달라요' },
  { value: '결제를 잘못했어요', label: '결제를 잘못했어요' },
  { value: 'custom', label: '직접 입력' },
];

const TABS = [
  { id: 'orders', label: '주문 내역', icon: Package },
  { id: 'wishlist', label: '위시리스트', icon: Heart },
  { id: 'address', label: '배송지 관리', icon: MapPin },
  { id: 'account', label: '계정 정보', icon: User },
];

const ACCOUNT_STORAGE_KEY = 'aerher_account';

interface StoredAccountExtras {
  name?: string;
  email?: string;
  phone?: string;
  grade?: string;
  point?: number;
}

// name/email default to the real logged-in social account. Extra fields
// (phone/grade/point) — and a manually-edited name/email override, if the
// user explicitly saved one in the 계정 정보 tab — persist locally, since
// Google/Kakao/Naver don't provide them.
function loadAccount(authUser: { name: string; email: string } | null) {
  let stored: StoredAccountExtras = {};
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {
    /* ignore malformed storage */
  }

  return {
    name: stored.name || authUser?.name || '회원',
    email: stored.email || authUser?.email || '',
    phone: stored.phone ?? '',
    grade: stored.grade ?? 'SILVER',
    point: stored.point ?? 0,
  };
}

function MyPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const { items: wishItems, toggle } = useWishlist();
  const { orders, cancelOrder } = useOrders();
  const { addItem } = useCart();
  const { addresses, addAddress, updateAddress, deleteAddress, setDefault } = useAddresses();
  const { openPostcode } = useDaumPostcode();
  const { user, logout } = useAuthStore();
  const { showToast, showConfirm } = useToast();
  const navigate = useNavigate();

  // New address form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({ label: '집', name: '', phone: '', postcode: '', address: '', addressDetail: '', isDefault: false });
  const [addrPostcodeManual, setAddrPostcodeManual] = useState(false);

  const resetAddrForm = () => {
    setAddrForm({ label: '집', name: '', phone: '', postcode: '', address: '', addressDetail: '', isDefault: false });
    setShowAddForm(false);
    setEditingId(null);
  };

  const startEdit = (addr: SavedAddress) => {
    setAddrForm({ label: addr.label, name: addr.name, phone: addr.phone, postcode: addr.postcode, address: addr.address, addressDetail: addr.addressDetail, isDefault: addr.isDefault });
    setEditingId(addr.id);
    setShowAddForm(true);
  };

  const handleAddrPostcode = () => {
    openPostcode(
      (result) => {
        setAddrForm((prev) => ({ ...prev, postcode: result.zonecode, address: result.address, addressDetail: '' }));
        setAddrPostcodeManual(false);
      },
      () => setAddrPostcodeManual(true),
    );
  };

  const handleAddrSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateAddress(editingId, addrForm);
    } else {
      addAddress(addrForm);
    }
    resetAddrForm();
  };

  const [account, setAccount] = useState(() => loadAccount(user));
  const [accountSaved, setAccountSaved] = useState(false);

  // If the logged-in user changes (e.g. logs in after this component mounted,
  // or switches accounts) and no manual override is stored, keep name/email
  // in sync with the real social account.
  useEffect(() => {
    let stored: StoredAccountExtras = {};
    try {
      const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      /* ignore */
    }
    setAccount((prev) => ({
      ...prev,
      name: stored.name || user?.name || prev.name,
      email: stored.email || user?.email || prev.email,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccount((prev: typeof account) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAccountSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [customCancelReason, setCustomCancelReason] = useState('');

  const openCancelForm = (orderId: string) => {
    setCancelingOrderId(orderId);
    setCancelReason('');
    setCustomCancelReason('');
  };

  const closeCancelForm = () => {
    setCancelingOrderId(null);
    setCancelReason('');
    setCustomCancelReason('');
  };

  const resolvedCancelReason = cancelReason === 'custom' ? customCancelReason : cancelReason;

  const handleCancelSubmit = (orderId: string) => {
    const reason = resolvedCancelReason.trim();
    if (!reason) return;
    cancelOrder(orderId, reason);
    showToast('주문이 취소되었습니다', 'info');
    closeCancelForm();
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem(item.product, item.collection, item.qty);
    });
    showToast('장바구니에 담았습니다', 'success');
    navigate('/cart');
  };

  const handleAddAllWishlistToCart = () => {
    if (wishItems.length === 0) return;
    wishItems.forEach(({ product, collection }) => {
      addItem(product, collection, 1);
    });
    showToast(`위시리스트 ${wishItems.length}개 상품을 장바구니에 담았습니다`, 'success');
  };

  return (
    <div className="pt-20 min-h-screen pb-24">
      <SEO title="마이페이지" description="주문 내역, 위시리스트, 배송지, 계정 정보를 관리하세요." />
      {/* Profile header */}
      <div className="bg-[#f9f7f5] px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={account.name} className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-foreground/40" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-pretendard font-normal text-[18px] text-foreground">{account.name}</p>
                <span className="font-pretendard text-[10px] tracking-widest text-foreground border border-foreground px-2 py-0.5">
                  {account.grade}
                </span>
              </div>
              <p className="font-pretendard font-light text-[13px] text-muted-foreground">{account.email}</p>
            </div>
          </div>
          <div className="flex gap-8 md:gap-12">
            {[
              { label: '주문', value: orders.length },
              { label: '포인트', value: Number(account.point).toLocaleString('ko-KR') + 'P' },
              { label: '위시리스트', value: wishItems.length },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-pretendard text-[28px] font-normal text-foreground">{s.value}</p>
                <p className="font-pretendard font-light text-[11px] tracking-widest text-muted-foreground uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10 items-start">
          {/* Sidebar */}
          <nav className="flex md:flex-col gap-1" aria-label="마이페이지 메뉴">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 w-full rounded-[2px] ${activeTab === id
                  ? 'bg-foreground text-background'
                  : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  }`}
              >
                <Icon size={15} />
                <span className="font-pretendard text-[13px] tracking-wide">{label}</span>
                {activeTab !== id && <ChevronRight size={13} className="ml-auto opacity-40" />}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-left text-muted-foreground hover:text-foreground transition-colors mt-4 md:mt-8"
            >
              <LogOut size={15} />
              <span className="font-pretendard text-[13px] tracking-wide">로그아웃</span>
            </button>
          </nav>

          {/* Content */}
          <div>
            {/* ─ Orders ─ */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-pretendard text-[28px] font-normal text-foreground mb-8">주문 내역</h2>
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center gap-5 py-20 text-center">
                    <ShoppingBag size={36} className="text-foreground/20" />
                    <p className="font-pretendard font-light text-[14px] text-muted-foreground">
                      아직 주문 내역이 없습니다.
                    </p>
                    <Link
                      to="/collection"
                      className="font-pretendard font-light text-[12px] tracking-widest text-foreground border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-300"
                    >
                      쇼핑하러 가기
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-border p-6 rounded-[4px]">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground mb-1">{order.date}</p>
                            <p className="font-pretendard text-[12px] text-foreground/55">{order.id}</p>
                          </div>
                          <span className={`font-pretendard text-[12px] tracking-wide ${STATUS_STYLE[order.status] ?? 'text-foreground/60'}`}>
                            {order.status}
                          </span>
                        </div>

                        <OrderStatusTimeline status={order.status} />

                        <div className="flex flex-col gap-4 mt-1">
                          {order.items.map((item, i) => (
                            <div key={`${item.product.id}-${i}`} className="flex gap-4 items-center">
                              <Link to={`/collection/${item.product.id}`} className="shrink-0">
                                <div className="w-16 h-20 rounded-[10px] overflow-hidden bg-[#f5f3f0]">
                                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                </div>
                              </Link>
                              <div className="flex-1 min-w-0">
                                <p className="font-pretendard text-[10px] text-muted-foreground uppercase tracking-widest">{item.product.type}</p>
                                <p className="font-pretendard text-[15px] font-normal text-foreground truncate">{item.product.name}</p>
                                <p className="font-pretendard text-[12px] text-foreground/55">
                                  {item.product.volume} · {item.qty}개
                                </p>
                              </div>
                              <p className="font-pretendard font-medium text-[15px] text-foreground shrink-0">
                                {(parseInt(item.product.price.replace(/[^0-9]/g, '')) * item.qty).toLocaleString('ko-KR')}원
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-5 pt-5 border-t border-border">
                          <p className="font-pretendard font-medium text-[15px] text-foreground">
                            총 {order.totalPrice.toLocaleString('ko-KR')}원
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleReorder(order)}
                              className="font-pretendard text-[11px] tracking-widest text-foreground border border-foreground px-5 py-2 hover:bg-foreground hover:text-background transition-all duration-200"
                            >
                              재구매
                            </button>
                            <button className="font-pretendard text-[11px] tracking-widest text-muted-foreground border border-border px-5 py-2 hover:border-foreground hover:text-foreground transition-all duration-200">
                              리뷰 작성
                            </button>
                            {CANCELLABLE_STATUSES.includes(order.status) && (
                              <button
                                onClick={() =>
                                  cancelingOrderId === order.id ? closeCancelForm() : openCancelForm(order.id)
                                }
                                className="font-pretendard text-[11px] tracking-widest text-muted-foreground border border-border px-5 py-2 hover:border-red-400 hover:text-red-400 transition-all duration-200"
                              >
                                주문 취소
                              </button>
                            )}
                          </div>
                        </div>

                        {order.status === '취소됨' && order.cancelReason && (
                          <p className="font-pretendard font-light text-[12px] text-red-400 mt-3">
                            취소 사유: {order.cancelReason}
                          </p>
                        )}

                        {cancelingOrderId === order.id && (
                          <div className="mt-4 pt-4 border-t border-border space-y-3">
                            <label className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block">
                              취소 사유
                            </label>
                            <select
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="w-full border-b border-border bg-transparent font-pretendard font-light text-[13px] text-foreground py-2 outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
                            >
                              {CANCEL_REASON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            {cancelReason === 'custom' && (
                              <input
                                type="text"
                                value={customCancelReason}
                                onChange={(e) => setCustomCancelReason(e.target.value)}
                                placeholder="취소 사유를 입력해 주세요"
                                className="w-full border-b border-border bg-transparent font-pretendard font-light text-[13px] text-foreground py-2 outline-none focus:border-foreground transition-colors placeholder-foreground/25"
                                autoFocus
                              />
                            )}

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleCancelSubmit(order.id)}
                                disabled={!resolvedCancelReason.trim()}
                                className={`flex-1 h-10 font-pretendard text-[12px] tracking-wide transition-colors ${resolvedCancelReason.trim()
                                  ? 'bg-red-500 text-white hover:bg-red-600'
                                  : 'bg-foreground/10 text-foreground/40 cursor-not-allowed'
                                  }`}
                              >
                                취소 확정
                              </button>
                              <button
                                onClick={closeCancelForm}
                                className="flex-1 h-10 border border-border font-pretendard text-[12px] text-foreground/70 hover:border-foreground transition-colors"
                              >
                                닫기
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─ Wishlist ─ */}
            {activeTab === 'wishlist' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-pretendard text-[28px] font-normal text-foreground">위시리스트</h2>
                  {wishItems.length > 0 && (
                    <button
                      onClick={handleAddAllWishlistToCart}
                      className="font-pretendard text-[11px] tracking-widest text-foreground border border-foreground px-5 py-2.5 hover:bg-foreground hover:text-background transition-all duration-200"
                    >
                      전체 장바구니 담기
                    </button>
                  )}
                </div>
                {wishItems.length === 0 ? (
                  <div className="flex flex-col items-center gap-5 py-20 text-center">
                    <Heart size={36} className="text-foreground/20" />
                    <p className="font-pretendard font-light text-[14px] text-muted-foreground">
                      위시리스트가 비어 있습니다.
                    </p>
                    <Link
                      to="/collection"
                      className="font-pretendard font-light text-[12px] tracking-widest text-foreground border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-300"
                    >
                      컬렉션 둘러보기
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {wishItems.map(({ product, collection }) => (
                      <div key={product.id} className="group relative">
                        <Link to={`/collection/${product.id}`} className="block">
                          <div className="relative aspect-[3/4] rounded-[16px] overflow-hidden bg-[#f5f3f0] mb-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          </div>
                          <p className="font-pretendard text-[10px] tracking-widest text-muted-foreground uppercase">{collection.name}</p>
                          <p className="font-pretendard text-[14px] font-normal text-foreground">{product.name}</p>
                          <p className="font-pretendard font-medium text-[16px] text-foreground mt-1">{product.price}</p>
                        </Link>
                        <button
                          onClick={() =>
                            showConfirm(`${product.name}을(를) 위시리스트에서 삭제하시겠어요?`, [
                              {
                                label: '삭제',
                                onClick: () => {
                                  toggle(product, collection);
                                  showToast('위시리스트에서 삭제했습니다', 'info');
                                },
                              },
                              { label: '취소', onClick: () => { }, variant: 'ghost' },
                            ])
                          }
                          aria-label="위시리스트에서 삭제"
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm transition-all duration-200 hover:scale-110"
                        >
                          <X size={14} className="text-foreground/60" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─ Address ─ */}
            {activeTab === 'address' && (
              <div>
                <h2 className="font-pretendard text-[28px] font-normal text-foreground mb-8">배송지 관리</h2>

                {/* Address list */}
                <div className="flex flex-col gap-4 mb-6">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="border border-border p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {addr.isDefault && (
                            <span className="font-pretendard text-[10px] tracking-widest text-background bg-foreground px-2 py-0.5">기본</span>
                          )}
                          <span className="font-pretendard text-[14px] text-foreground">{addr.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {!addr.isDefault && (
                            <button onClick={() => setDefault(addr.id)}
                              className="font-pretendard text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                              기본으로
                            </button>
                          )}
                          <button onClick={() => startEdit(addr)}
                            className="font-pretendard text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                            수정
                          </button>
                          <button onClick={() => deleteAddress(addr.id)}
                            className="font-pretendard text-[11px] text-muted-foreground hover:text-red-500 transition-colors">
                            삭제
                          </button>
                        </div>
                      </div>
                      <p className="font-pretendard font-normal text-[15px] text-foreground">{addr.name}</p>
                      <p className="font-pretendard font-light text-[13px] text-foreground/65 mt-1">{addr.phone}</p>
                      <p className="font-pretendard font-light text-[13px] text-foreground/65">
                        [{addr.postcode}] {addr.address} {addr.addressDetail}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add/edit form */}
                {showAddForm ? (
                  <form onSubmit={handleAddrSave} className="border border-border p-6 space-y-5">
                    <h3 className="font-pretendard text-[13px] tracking-widest text-foreground uppercase">
                      {editingId ? '배송지 수정' : '새 배송지 추가'}
                    </h3>

                    {/* Label */}
                    <div className="flex gap-3">
                      {['집', '회사', '기타'].map((l) => (
                        <button key={l} type="button" onClick={() => setAddrForm((p) => ({ ...p, label: l }))}
                          className={`font-pretendard text-[12px] tracking-wide px-4 py-2 border transition-colors duration-200 ${addrForm.label === l ? 'border-foreground text-foreground bg-foreground/5' : 'border-border text-muted-foreground hover:border-foreground/40'
                            }`}>
                          {l}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {([
                        { label: '받는 분', name: 'name', type: 'text', placeholder: '홍길동' },
                        { label: '연락처', name: 'phone', type: 'tel', placeholder: '010-0000-0000' },
                      ] as const).map((f) => (
                        <div key={f.name}>
                          <label className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2">{f.label}</label>
                          <input type={f.type} value={addrForm[f.name]} placeholder={f.placeholder}
                            onChange={(e) => setAddrForm((p) => ({ ...p, [f.name]: e.target.value }))}
                            className="w-full border-b border-border bg-transparent font-pretendard font-light text-[14px] text-foreground py-2 outline-none focus:border-foreground transition-colors placeholder-foreground/25" />
                        </div>
                      ))}

                      {/* Postcode */}
                      <div className="md:col-span-2">
                        <label className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2">주소</label>
                        <div className="flex gap-3 items-center mb-3 flex-wrap">
                          <input type="text" value={addrForm.postcode} placeholder="우편번호"
                            readOnly={!addrPostcodeManual}
                            onChange={(e) => setAddrForm((p) => ({ ...p, postcode: e.target.value }))}
                            className={`w-28 border-b border-border bg-transparent font-pretendard font-light text-[14px] text-foreground py-2 outline-none focus:border-foreground transition-colors placeholder-foreground/25 ${!addrPostcodeManual ? 'cursor-default' : ''}`} />
                          {!addrPostcodeManual ? (
                            <button type="button" onClick={handleAddrPostcode}
                              className="flex items-center gap-2 font-pretendard font-light text-[11px] tracking-[0.2em] text-foreground border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-all duration-200">
                              <Search size={12} /> 주소 검색
                            </button>
                          ) : (
                            <span className="font-pretendard text-[11px] text-muted-foreground">
                              직접 입력해 주세요.{' '}
                              <button type="button" onClick={() => setAddrPostcodeManual(false)}
                                className="underline underline-offset-2 hover:text-foreground transition-colors">
                                재시도
                              </button>
                            </span>
                          )}
                        </div>
                        <input type="text" value={addrForm.address} placeholder="도로명 주소"
                          onChange={(e) => setAddrForm((p) => ({ ...p, address: e.target.value }))}
                          className="w-full border-b border-border bg-transparent font-pretendard font-light text-[14px] text-foreground py-2 outline-none focus:border-foreground transition-colors placeholder-foreground/25 mb-3" />
                        <input type="text" value={addrForm.addressDetail} placeholder="상세 주소"
                          onChange={(e) => setAddrForm((p) => ({ ...p, addressDetail: e.target.value }))}
                          className="w-full border-b border-border bg-transparent font-pretendard font-light text-[14px] text-foreground py-2 outline-none focus:border-foreground transition-colors placeholder-foreground/25" />
                      </div>

                      {/* Default checkbox */}
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className={`w-4 h-4 border flex items-center justify-center transition-all ${addrForm.isDefault ? 'border-foreground bg-foreground' : 'border-border'}`}>
                            {addrForm.isDefault && <Check size={10} className="text-background" />}
                          </div>
                          <input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm((p) => ({ ...p, isDefault: e.target.checked }))} className="sr-only" />
                          <span className="font-pretendard font-light text-[13px] text-foreground/70">기본 배송지로 설정</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit"
                        className="font-pretendard font-light text-[11px] tracking-widest text-background bg-foreground px-8 py-3 hover:bg-foreground/85 transition-colors">
                        저장하기
                      </button>
                      <button type="button" onClick={resetAddrForm}
                        className="font-pretendard font-light text-[11px] tracking-widest text-muted-foreground border border-border px-8 py-3 hover:border-foreground hover:text-foreground transition-colors">
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowAddForm(true)}
                    className="font-pretendard font-light text-[12px] tracking-widest text-foreground border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-all duration-200">
                    + 새 배송지 추가
                  </button>
                )}
              </div>
            )}

            {/* ─ Account ─ */}
            {activeTab === 'account' && (
              <div>
                <h2 className="font-pretendard text-[28px] font-normal text-foreground mb-8">계정 정보</h2>
                <form className="flex flex-col gap-6 max-w-[480px]" onSubmit={handleAccountSave}>
                  {([
                    { label: '이름', name: 'name', type: 'text', value: account.name },
                    { label: '이메일', name: 'email', type: 'email', value: account.email },
                    { label: '전화번호', name: 'phone', type: 'tel', value: account.phone },
                  ] as const).map((f) => (
                    <div key={f.name}>
                      <label
                        htmlFor={`account-${f.name}`}
                        className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2"
                      >
                        {f.label}
                      </label>
                      <input
                        id={`account-${f.name}`}
                        type={f.type}
                        name={f.name}
                        value={f.value}
                        onChange={handleAccountChange}
                        className="w-full border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-2 outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  ))}

                  {/* Password — separate since it doesn't sync to account state */}
                  <div>
                    <label
                      htmlFor="account-password"
                      className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2"
                    >
                      새 비밀번호
                    </label>
                    <input
                      id="account-password"
                      type="password"
                      placeholder="변경 시에만 입력하세요"
                      className="w-full border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-2 outline-none focus:border-foreground transition-colors placeholder-foreground/25"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`mt-2 w-fit inline-flex items-center gap-2 font-pretendard font-light text-[12px] tracking-[0.25em] px-10 py-4 transition-all duration-300 ${accountSaved
                      ? 'bg-foreground/70 text-background cursor-default'
                      : 'bg-foreground text-background hover:bg-foreground/85'
                      }`}
                  >
                    {accountSaved ? (
                      <>
                        <Check size={14} />
                        저장되었습니다
                      </>
                    ) : (
                      '저장하기'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap with auth guard
const MyPageGuarded = () => (
  <ProtectedRoute>
    <MyPage />
  </ProtectedRoute>
);

export { MyPageGuarded as default };