import { useState } from 'react';
import { Link } from 'react-router';
import { User, Package, Heart, MapPin, ChevronRight, LogOut, ShoppingBag, Check, Search } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useOrders } from '../context/OrderContext';
import { useAddresses, type SavedAddress } from '../context/AddressContext';
import { useDaumPostcode } from '../hooks/useDaumPostcode';
import ProtectedRoute from '../components/ProtectedRoute';

const STATUS_STYLE: Record<string, string> = {
  '결제 완료': 'text-foreground/70',
  '배송 준비': 'text-amber-600',
  '배송 중': 'text-blue-600',
  '배송 완료': 'text-foreground/40',
};

const TABS = [
  { id: 'orders', label: '주문 내역', icon: Package },
  { id: 'wishlist', label: '위시리스트', icon: Heart },
  { id: 'address', label: '배송지 관리', icon: MapPin },
  { id: 'account', label: '계정 정보', icon: User },
];

const ACCOUNT_STORAGE_KEY = 'aerher_account';

function loadAccount() {
  try {
    const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { }
  return { name: '김에테르', email: 'aether@example.com', phone: '010-1234-5678', grade: 'SILVER', point: 3_200 };
}

function MyPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const { items: wishItems, toggle } = useWishlist();
  const { orders } = useOrders();
  const { addresses, addAddress, updateAddress, deleteAddress, setDefault } = useAddresses();
  const { openPostcode } = useDaumPostcode();

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

  const [account, setAccount] = useState(loadAccount);
  const [accountSaved, setAccountSaved] = useState(false);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccount((prev: typeof account) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAccountSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 2500);
  };

  return (
    <div className="pt-20 min-h-screen pb-24">
      {/* Profile header */}
      <div className="bg-[#f9f7f5] px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center">
              <User size={28} className="text-foreground/40" />
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
            <button className="flex items-center gap-3 px-4 py-3 text-left text-muted-foreground hover:text-foreground transition-colors mt-4 md:mt-8">
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
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground mb-1">{order.date}</p>
                            <p className="font-pretendard text-[12px] text-foreground/55">{order.id}</p>
                          </div>
                          <span className={`font-pretendard text-[12px] tracking-wide ${STATUS_STYLE[order.status] ?? 'text-foreground/60'}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="flex flex-col gap-4">
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
                            <Link
                              to="/collection"
                              className="font-pretendard text-[11px] tracking-widest text-foreground border border-foreground px-5 py-2 hover:bg-foreground hover:text-background transition-all duration-200"
                            >
                              재구매
                            </Link>
                            <button className="font-pretendard text-[11px] tracking-widest text-muted-foreground border border-border px-5 py-2 hover:border-foreground hover:text-foreground transition-all duration-200">
                              리뷰 작성
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─ Wishlist ─ */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="font-pretendard text-[28px] font-normal text-foreground mb-8">위시리스트</h2>
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
                        {/* Remove from wishlist */}
                        <button
                          onClick={() => toggle(product, collection)}
                          aria-label="위시리스트에서 제거"
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
                        >
                          <Heart size={13} className="fill-foreground text-foreground" />
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
                      {[
                        { label: '받는 분', name: 'name', type: 'text', placeholder: '홍길동' },
                        { label: '연락처', name: 'phone', type: 'tel', placeholder: '010-0000-0000' },
                      ].map((f) => (
                        <div key={f.name}>
                          <label className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2">{f.label}</label>
                          <input type={f.type} value={(addrForm as Record<string, string>)[f.name]} placeholder={f.placeholder}
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
                  {[
                    { label: '이름', name: 'name', type: 'text', value: account.name },
                    { label: '이메일', name: 'email', type: 'email', value: account.email },
                    { label: '전화번호', name: 'phone', type: 'tel', value: account.phone },
                  ].map((f) => (
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
