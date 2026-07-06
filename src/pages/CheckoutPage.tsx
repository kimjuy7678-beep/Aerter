import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { Check, MapPin, Search, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuthStore } from '../store/useAuthStore';
import { useAddresses, type SavedAddress } from '../context/AddressContext';
import { useCards, type SavedCard } from '../context/CardContext';
import { useDaumPostcode } from '../hooks/useDaumPostcode';
import type { CartItem } from '../context/CartContext';
import SEO from '../components/SEO';

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}
function parsePrice(price: string) {
  return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
}

interface LocationState {
  items?: CartItem[];
  totalPrice?: number;
  directProduct?: CartItem;
}

const PAYMENT_METHODS = [
  { id: 'card', label: '신용 · 체크카드' },
  { id: 'kakao', label: '카카오페이' },
  { id: 'naver', label: '네이버페이' },
  { id: 'bank', label: '무통장 입금' },
];

const MEMO_OPTIONS = [
  { value: '', label: '배송 메모를 선택해 주세요' },
  { value: '문 앞에 놓아주세요', label: '문 앞에 놓아주세요' },
  { value: '경비실에 맡겨주세요', label: '경비실에 맡겨주세요' },
  { value: '배송 전 연락 주세요', label: '배송 전 연락 주세요' },
  { value: '부재 시 문자로 남겨주세요', label: '부재 시 문자로 남겨주세요' },
  { value: 'custom', label: '직접 입력' },
];

type AgreementField = 'agreeAll' | 'agreeTerms' | 'agreePrivacy';

const AGREEMENT_FIELDS: { name: AgreementField; label: string; bold: boolean }[] = [
  { name: 'agreeAll', label: '전체 동의', bold: true },
  { name: 'agreeTerms', label: '[필수] 이용약관 동의', bold: false },
  { name: 'agreePrivacy', label: '[필수] 개인정보 수집·이용 동의', bold: false },
];

type Step = 'form' | 'confirm' | 'done';

function AddressPicker({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  openPostcode,
}: {
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (addr: SavedAddress) => void;
  onAddNew: (addr: Omit<SavedAddress, 'id'>) => void;
  openPostcode: ReturnType<typeof useDaumPostcode>['openPostcode'];
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newAddrManual, setNewAddrManual] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: '', name: '', phone: '',
    postcode: '', address: '', addressDetail: '', isDefault: false,
  });

  const selected = addresses.find((a) => a.id === selectedId);

  const handleNewAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddr((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNewAddrPostcodeSearch = () => {
    openPostcode(
      (result) => {
        setNewAddr((prev) => ({ ...prev, postcode: result.zonecode, address: result.address, addressDetail: '' }));
        setNewAddrManual(false);
      },
      () => setNewAddrManual(true),
    );
  };

  const canSaveNew = newAddr.label && newAddr.name && newAddr.phone && newAddr.address;

  const handleSaveNew = () => {
    if (!canSaveNew) return;
    onAddNew(newAddr);
    setNewAddr({ label: '', name: '', phone: '', postcode: '', address: '', addressDetail: '', isDefault: false });
    setAdding(false);
    setNewAddrManual(false);
  };

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full border border-border px-5 py-4 text-left hover:border-foreground/40 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <MapPin size={15} className="text-muted-foreground shrink-0" />
          {selected ? (
            <div>
              <span className="font-pretendard text-[13px] text-foreground font-normal">
                [{selected.label}] {selected.address} {selected.addressDetail}
              </span>
              <span className="font-pretendard text-[12px] text-muted-foreground ml-2">
                {selected.name} · {selected.phone}
              </span>
            </div>
          ) : (
            <span className="font-pretendard text-[13px] text-muted-foreground">저장된 배송지 선택</span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-muted-foreground shrink-0" /> : <ChevronDown size={15} className="text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="border border-t-0 border-border divide-y divide-border">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              type="button"
              onClick={() => { onSelect(addr); setOpen(false); }}
              className={`w-full text-left px-5 py-4 transition-colors duration-150 flex items-start gap-3 ${selectedId === addr.id ? 'bg-foreground/5' : 'hover:bg-foreground/3'
                }`}
            >
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                {selectedId === addr.id && <Check size={13} className="text-foreground" />}
                <span className="font-pretendard text-[11px] tracking-widest text-foreground/60 uppercase">{addr.label}</span>
                {addr.isDefault && (
                  <span className="font-pretendard text-[9px] tracking-widest border border-foreground/30 text-foreground/50 px-1.5 py-0.5">기본</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-pretendard text-[13px] font-normal text-foreground">{addr.name} · {addr.phone}</p>
                <p className="font-pretendard font-light text-[12px] text-muted-foreground mt-0.5 truncate">
                  [{addr.postcode}] {addr.address} {addr.addressDetail}
                </p>
              </div>
            </button>
          ))}

          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full text-left px-5 py-4 font-pretendard text-[13px] text-foreground/70 hover:text-foreground hover:bg-foreground/3 transition-colors duration-150"
            >
              + 새 배송지 추가
            </button>
          ) : (
            <div className="px-5 py-5 bg-foreground/[0.02] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" name="label" value={newAddr.label} onChange={handleNewAddrChange}
                  placeholder="배송지 별칭 (집, 회사 등)"
                  className="border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25"
                />
                <input
                  type="text" name="name" value={newAddr.name} onChange={handleNewAddrChange}
                  placeholder="받는 분"
                  className="border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25"
                />
              </div>
              <input
                type="tel" name="phone" value={newAddr.phone} onChange={handleNewAddrChange}
                placeholder="연락처"
                className="w-full border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25"
              />

              <div className="flex gap-2 items-center">
                <input
                  type="text" name="postcode" value={newAddr.postcode} onChange={handleNewAddrChange}
                  placeholder="우편번호" readOnly={!newAddrManual}
                  className="w-24 border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25"
                />
                {!newAddrManual && (
                  <button type="button" onClick={handleNewAddrPostcodeSearch}
                    className="flex items-center gap-1.5 font-pretendard text-[11px] text-foreground border border-foreground px-3 py-2 hover:bg-foreground hover:text-background transition-all duration-200 whitespace-nowrap">
                    <Search size={12} /> 검색
                  </button>
                )}
                {newAddrManual && (
                  <span className="font-pretendard text-[10px] text-muted-foreground">직접 입력해 주세요</span>
                )}
              </div>
              <input
                type="text" name="address" value={newAddr.address} onChange={handleNewAddrChange}
                placeholder="도로명 주소"
                className="w-full border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25"
              />
              <input
                type="text" name="addressDetail" value={newAddr.addressDetail} onChange={handleNewAddrChange}
                placeholder="상세 주소"
                className="w-full border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25"
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isDefault" checked={newAddr.isDefault} onChange={handleNewAddrChange} className="w-4 h-4" />
                <span className="font-pretendard text-[12px] text-foreground/70">기본 배송지로 설정</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  type="button" onClick={handleSaveNew} disabled={!canSaveNew}
                  className={`flex-1 h-10 font-pretendard text-[12px] tracking-wide transition-colors ${canSaveNew ? 'bg-foreground text-background hover:bg-foreground/85' : 'bg-foreground/20 text-foreground/40 cursor-not-allowed'
                    }`}
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => { setAdding(false); setNewAddrManual(false); }}
                  className="flex-1 h-10 border border-border font-pretendard text-[12px] text-foreground/70 hover:border-foreground transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CardPicker({
  cards,
  selectedId,
  onSelect,
  onAddNew,
}: {
  cards: SavedCard[];
  selectedId: string | null;
  onSelect: (card: SavedCard) => void;
  onAddNew: (card: Omit<SavedCard, 'id'>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(cards.length === 0);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isDefault, setIsDefault] = useState(cards.length === 0);

  const selected = cards.find((c) => c.id === selectedId);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits.replace(/(.{4})(?=.)/g, '$1 '));
  };

  const digitsOnly = cardNumber.replace(/\D/g, '');
  const canSaveNew =
    digitsOnly.length === 16 &&
    expiryMonth.length === 2 &&
    expiryYear.length === 2 &&
    cvc.length === 3 &&
    cardholderName.trim().length > 0;

  const resetForm = () => {
    setCardNumber('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvc('');
    setCardholderName('');
    setIsDefault(false);
  };

  const handleSaveNew = () => {
    if (!canSaveNew) return;
    const last4 = digitsOnly.slice(-4);
    onAddNew({
      label: `카드 •••• ${last4}`,
      last4,
      expiryMonth,
      expiryYear,
      cardholderName,
      isDefault,
    });
    // CVC is only used to simulate verification for this one action — it's
    // discarded immediately and never passed to onAddNew, so it's never
    // persisted anywhere (matches how real card-on-file systems work).
    resetForm();
    setAdding(false);
    setOpen(false);
  };

  return (
    <div className="mb-6">
      {cards.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between w-full border border-border px-5 py-4 text-left hover:border-foreground/40 transition-colors duration-200 mb-3"
        >
          <div className="flex items-center gap-3">
            <CreditCard size={15} className="text-muted-foreground shrink-0" />
            {selected ? (
              <span className="font-pretendard text-[13px] text-foreground font-normal">
                {selected.label} · {selected.expiryMonth}/{selected.expiryYear}
              </span>
            ) : (
              <span className="font-pretendard text-[13px] text-muted-foreground">저장된 카드 선택</span>
            )}
          </div>
          {open ? (
            <ChevronUp size={15} className="text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown size={15} className="text-muted-foreground shrink-0" />
          )}
        </button>
      )}

      {open && cards.length > 0 && (
        <div className="border border-border divide-y divide-border mb-3">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                onSelect(card);
                setOpen(false);
                setAdding(false);
              }}
              className={`w-full text-left px-5 py-4 transition-colors duration-150 flex items-center gap-3 ${selectedId === card.id ? 'bg-foreground/5' : 'hover:bg-foreground/3'
                }`}
            >
              {selectedId === card.id && <Check size={13} className="text-foreground" />}
              <div>
                <p className="font-pretendard text-[13px] font-normal text-foreground">
                  •••• •••• •••• {card.last4}
                </p>
                <p className="font-pretendard font-light text-[12px] text-muted-foreground mt-0.5">
                  {card.cardholderName} · {card.expiryMonth}/{card.expiryYear}
                  {card.isDefault && ' · 기본 카드'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full text-left px-5 py-4 border border-border font-pretendard text-[13px] text-foreground/70 hover:text-foreground hover:border-foreground/40 transition-colors duration-150"
        >
          + 새 카드 추가
        </button>
      ) : (
        <div className="border border-border px-5 py-5 bg-foreground/[0.02] space-y-3">
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="카드번호 (16자리)"
            maxLength={19}
            className="w-full border-b border-border bg-transparent font-pretendard text-[14px] py-2 outline-none focus:border-foreground placeholder-foreground/25 tracking-wider"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={expiryMonth}
              onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="MM"
              maxLength={2}
              className="border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25 text-center"
            />
            <input
              type="text"
              inputMode="numeric"
              value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="YY"
              maxLength={2}
              className="border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25 text-center"
            />
            <input
              type="password"
              inputMode="numeric"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="CVC"
              maxLength={3}
              className="border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25 text-center"
            />
          </div>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="카드 소유자 이름"
            className="w-full border-b border-border bg-transparent font-pretendard text-[13px] py-2 outline-none focus:border-foreground placeholder-foreground/25"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-pretendard text-[12px] text-foreground/70">기본 카드로 설정</span>
          </label>

          <p className="font-pretendard font-light text-[11px] text-muted-foreground/70 leading-relaxed">
            카드번호와 CVC는 저장되지 않아요. 등록 시 마지막 4자리와 유효기간만 저장되어, 다음 결제부터 이 카드를
            바로 선택할 수 있어요.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveNew}
              disabled={!canSaveNew}
              className={`flex-1 h-10 font-pretendard text-[12px] tracking-wide transition-colors ${canSaveNew
                ? 'bg-foreground text-background hover:bg-foreground/85'
                : 'bg-foreground/20 text-foreground/40 cursor-not-allowed'
                }`}
            >
              카드 등록
            </button>
            {cards.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  resetForm();
                }}
                className="flex-1 h-10 border border-border font-pretendard text-[12px] text-foreground/70 hover:border-foreground transition-colors"
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { isLoggedIn } = useAuthStore();
  const { addresses, defaultAddress, addAddress } = useAddresses();
  const { cards, defaultCard, addCard } = useCards();
  const { openPostcode } = useDaumPostcode();
  const state = location.state as LocationState | null;

  const checkoutItems: CartItem[] = state?.directProduct
    ? [state.directProduct]
    : state?.items ?? cartItems;

  useEffect(() => {
    if (checkoutItems.length === 0) {
      navigate('/cart', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = checkoutItems.reduce((sum, i) => sum + parsePrice(i.product.price) * i.qty, 0);
  const shipping = subtotal >= 50000 ? 0 : 3000;
  const total = subtotal + shipping;

  const [completedOrderId, setCompletedOrderId] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [postcodeManual, setPostcodeManual] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [memoOption, setMemoOption] = useState('');
  const [customMemo, setCustomMemo] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    postcode: '', address: '', addressDetail: '',
    memo: '', agreeAll: false, agreeTerms: false, agreePrivacy: false,
  });

  useEffect(() => {
    if (isLoggedIn && defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      setForm((prev) => ({
        ...prev,
        name: defaultAddress.name,
        phone: defaultAddress.phone,
        postcode: defaultAddress.postcode,
        address: defaultAddress.address,
        addressDetail: defaultAddress.addressDetail,
      }));
    }
  }, [isLoggedIn, defaultAddress]);

  useEffect(() => {
    if (defaultCard) {
      setSelectedCardId(defaultCard.id);
    }
  }, [defaultCard]);

  const applyAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setForm((prev) => ({
      ...prev,
      name: addr.name,
      phone: addr.phone,
      postcode: addr.postcode,
      address: addr.address,
      addressDetail: addr.addressDetail,
    }));
  };

  const handlePostcodeSearch = () => {
    openPostcode(
      (result) => {
        setSelectedAddressId(null);
        setForm((prev) => ({ ...prev, postcode: result.zonecode, address: result.address, addressDetail: '' }));
        setPostcodeManual(false);
      },
      () => setPostcodeManual(true),
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => {
      const updated = { ...prev, [name]: checked !== undefined ? checked : value };
      if (name === 'agreeAll') return { ...updated, agreeTerms: !!checked, agreePrivacy: !!checked };
      if (['name', 'phone', 'postcode', 'address', 'addressDetail'].includes(name)) {
        setSelectedAddressId(null);
      }
      return updated;
    });
  };

  const handleMemoOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMemoOption(value);
    if (value === 'custom') {
      setForm((prev) => ({ ...prev, memo: customMemo }));
    } else {
      setForm((prev) => ({ ...prev, memo: value }));
    }
  };

  const handleCustomMemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomMemo(value);
    setForm((prev) => ({ ...prev, memo: value }));
  };

  const cardOk = paymentMethod !== 'card' || !!selectedCardId;
  const canSubmit = form.name && form.phone && form.email && form.address && form.agreeTerms && form.agreePrivacy && cardOk;
  const selectedCard = cards.find((c) => c.id === selectedCardId);

  const handleOrder = () => { if (canSubmit) setStep('confirm'); };

  const handleConfirm = () => {
    const order = addOrder({
      items: checkoutItems,
      totalPrice: total,
      shippingName: form.name,
      shippingPhone: form.phone,
      shippingAddress: `[${form.postcode}] ${form.address} ${form.addressDetail}`.trim(),
    });
    setCompletedOrderId(order.id);
    clearCart();
    setStep('done');
  };

  if (step === 'done') {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center gap-8 px-6">
        <SEO title="주문 완료" description="주문이 완료되었습니다." />
        <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center">
          <Check size={28} className="text-background" />
        </div>
        <div className="text-center">
          <h1 className="font-cormorant text-[42px] font-normal text-foreground mb-3">주문이 완료되었습니다</h1>
          <p className="font-pretendard font-light text-[14px] text-muted-foreground mb-1">
            주문 번호: <span className="text-foreground">{completedOrderId}</span>
          </p>
          <p className="font-pretendard font-light text-[14px] text-muted-foreground">
            입력하신 이메일로 주문 확인서를 보내드렸습니다.
          </p>
          {!isLoggedIn && (
            <p className="font-pretendard font-light text-[12px] text-muted-foreground/80 mt-3 max-w-[360px]">
              비회원 주문은 계정에 저장되지 않아요. 문의가 필요하면 위 주문 번호를 꼭 기억해 주세요.
            </p>
          )}
        </div>
        <div className="flex gap-4 mt-4">
          {isLoggedIn && (
            <Link to="/mypage" className="font-pretendard font-light text-[12px] tracking-[0.25em] text-foreground border border-foreground px-8 py-4 hover:bg-foreground hover:text-background transition-all duration-300">
              주문 내역 보기
            </Link>
          )}
          <Link to="/" className="font-pretendard font-light text-[12px] tracking-[0.25em] text-muted-foreground border border-border px-8 py-4 hover:border-foreground hover:text-foreground transition-all duration-300">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="pt-20 pb-28 min-h-screen">
        <div className="max-w-[640px] mx-auto px-8 md:px-0 pt-12">
          <SEO title="주문 확인" description="주문 내용을 확인하고 결제를 진행하세요." />
          <h1 className="font-cormorant text-[36px] md:text-[44px] font-normal text-foreground mb-2">주문 확인</h1>
          <p className="font-pretendard font-light text-[13px] text-muted-foreground mb-10">아래 내용을 확인하고 결제를 진행해 주세요</p>

          <div className="border border-border p-6 mb-6 space-y-3">
            <h2 className="font-pretendard text-[12px] tracking-widest text-muted-foreground uppercase mb-4">배송 정보</h2>
            {[
              ['받는 분', form.name],
              ['연락처', form.phone],
              ['이메일', form.email],
              ['주소', `[${form.postcode}] ${form.address} ${form.addressDetail}`],
              ['배송 메모', form.memo || '없음'],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4">
                <span className="font-pretendard font-light text-[13px] text-muted-foreground w-20 shrink-0">{label}</span>
                <span className="font-pretendard font-light text-[13px] text-foreground">{value}</span>
              </div>
            ))}
          </div>

          <div className="border border-border p-6 mb-6">
            <h2 className="font-pretendard text-[12px] tracking-widest text-muted-foreground uppercase mb-5">주문 상품</h2>
            {checkoutItems.map((item) => (
              <div key={item.product.id} className="flex gap-4 items-center mb-4 last:mb-0">
                <div className="w-14 aspect-[3/4] rounded-[10px] overflow-hidden bg-[#f5f3f0] shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-pretendard text-[13px] font-normal text-foreground">{item.product.name}</p>
                  <p className="font-pretendard text-[11px] font-light text-muted-foreground">{item.product.type} · {item.product.volume} · {item.qty}개</p>
                </div>
                <p className="font-pretendard font-medium text-[15px] text-foreground">
                  {formatPrice(parsePrice(item.product.price) * item.qty)}
                </p>
              </div>
            ))}
          </div>

          <div className="border border-border p-6 mb-8 space-y-3">
            <div className="flex justify-between font-pretendard text-[13px]">
              <span className="text-muted-foreground font-light">상품 합계</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-pretendard text-[13px]">
              <span className="text-muted-foreground font-light">배송비</span>
              <span>{shipping === 0 ? '무료' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between font-pretendard pt-3 border-t border-border">
              <span className="text-[15px] text-foreground">결제 금액</span>
              <span className="text-[20px] font-medium text-foreground">{formatPrice(total)}</span>
            </div>
            <p className="font-pretendard text-[12px] text-muted-foreground font-light">
              결제 수단: {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
              {paymentMethod === 'card' && selectedCard && (
                <> · •••• {selectedCard.last4} ({selectedCard.expiryMonth}/{selectedCard.expiryYear})</>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handleConfirm}
              className="w-full h-14 bg-foreground text-background font-pretendard font-light text-[13px] tracking-[0.25em] hover:bg-foreground/85 transition-colors">
              {formatPrice(total)} 결제하기
            </button>
            <button onClick={() => setStep('form')}
              className="w-full h-14 border border-border text-foreground font-pretendard font-light text-[12px] tracking-widest hover:border-foreground transition-colors">
              이전으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-28 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 pt-12">
        <SEO title="결제" description="배송 정보를 입력하고 결제를 진행하세요." />
        <h1 className="font-cormorant text-[42px] md:text-[52px] font-normal text-foreground mb-10">결제</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
          <div className="space-y-10">
            <section>
              <h2 className="font-pretendard text-[12px] tracking-[0.3em] text-muted-foreground uppercase mb-6 pb-4 border-b border-border">
                배송 정보
              </h2>

              {!isLoggedIn && (
                <p className="font-pretendard font-light text-[12px] text-muted-foreground mb-6">
                  비회원으로 주문하고 있어요. 받는 분 정보를 직접 입력해 주세요.
                </p>
              )}

              {isLoggedIn && (
                <AddressPicker
                  addresses={addresses}
                  selectedId={selectedAddressId}
                  onSelect={applyAddress}
                  onAddNew={(addr) => {
                    const saved = addAddress(addr);
                    applyAddress(saved);
                  }}
                  openPostcode={openPostcode}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="f-name" className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2">받는 분 *</label>
                  <input id="f-name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="홍길동"
                    className="w-full border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-3 outline-none focus:border-foreground transition-colors placeholder-foreground/25" />
                </div>

                <div>
                  <label htmlFor="f-phone" className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2">연락처 *</label>
                  <input id="f-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000"
                    className="w-full border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-3 outline-none focus:border-foreground transition-colors placeholder-foreground/25" />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="f-email" className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2">이메일 *</label>
                  <input id="f-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com"
                    className="w-full border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-3 outline-none focus:border-foreground transition-colors placeholder-foreground/25" />
                </div>

                <div className="md:col-span-2">
                  <label className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2">주소 *</label>
                  <div className="flex gap-3 items-center mb-2">
                    <input type="text" name="postcode" value={form.postcode} onChange={handleChange} placeholder="우편번호"
                      readOnly={!postcodeManual}
                      className={`w-28 border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-3 outline-none focus:border-foreground transition-colors placeholder-foreground/25 ${!postcodeManual ? 'cursor-default' : ''}`} />
                    {!postcodeManual && (
                      <button type="button" onClick={handlePostcodeSearch}
                        className="flex items-center gap-2 font-pretendard font-light text-[11px] tracking-[0.2em] text-foreground border border-foreground px-5 py-2.5 hover:bg-foreground hover:text-background transition-all duration-200 whitespace-nowrap">
                        <Search size={13} /> 주소 검색
                      </button>
                    )}
                    {postcodeManual && (
                      <span className="font-pretendard text-[11px] text-muted-foreground leading-snug">
                        미리보기 환경에서는 직접 입력해 주세요.{' '}
                        <button type="button" onClick={() => setPostcodeManual(false)}
                          className="underline underline-offset-2 hover:text-foreground transition-colors">
                          검색 재시도
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="도로명 주소 (주소 검색 후 자동 입력)"
                    className="w-full border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-3 outline-none focus:border-foreground transition-colors placeholder-foreground/25" />
                </div>

                <div className="md:col-span-2">
                  <input id="f-detail" type="text" name="addressDetail" value={form.addressDetail} onChange={handleChange} placeholder="상세 주소 (동, 호수 등)"
                    className="w-full border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-3 outline-none focus:border-foreground transition-colors placeholder-foreground/25" />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="f-memo" className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase block mb-2">
                    배송 요청사항
                  </label>
                  <select
                    id="f-memo"
                    value={memoOption}
                    onChange={handleMemoOptionChange}
                    className="w-full border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-3 outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
                  >
                    {MEMO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {memoOption === 'custom' && (
                    <input
                      type="text"
                      value={customMemo}
                      onChange={handleCustomMemoChange}
                      placeholder="요청사항을 직접 입력해 주세요"
                      className="w-full border-b border-border bg-transparent font-pretendard font-light text-[15px] text-foreground py-3 mt-3 outline-none focus:border-foreground transition-colors placeholder-foreground/25"
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-pretendard text-[12px] tracking-[0.3em] text-muted-foreground uppercase mb-6 pb-4 border-b border-border">결제 수단</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                    className={`py-4 px-3 border text-center font-pretendard text-[12px] tracking-wide transition-all duration-200 ${paymentMethod === m.id
                      ? 'border-foreground text-foreground bg-foreground/5'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                      }`}>
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <CardPicker
                  cards={cards}
                  selectedId={selectedCardId}
                  onSelect={(card) => setSelectedCardId(card.id)}
                  onAddNew={(card) => {
                    const saved = addCard(card);
                    setSelectedCardId(saved.id);
                  }}
                />
              )}
            </section>

            <section>
              <h2 className="font-pretendard text-[12px] tracking-[0.3em] text-muted-foreground uppercase mb-6 pb-4 border-b border-border">약관 동의</h2>
              <div className="space-y-4">
                {AGREEMENT_FIELDS.map((a) => (
                  <label key={a.name} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-200 shrink-0 ${form[a.name] ? 'border-foreground bg-foreground' : 'border-border group-hover:border-foreground/50'
                      }`}>
                      {form[a.name] && <Check size={12} className="text-background" />}
                    </div>
                    <input type="checkbox" name={a.name} checked={form[a.name]} onChange={handleChange} className="sr-only" />
                    <span className={`font-pretendard text-[13px] ${a.bold ? 'font-normal text-foreground' : 'font-light text-foreground/70'}`}>{a.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="border border-border p-7">
              <h2 className="font-cormorant text-[22px] font-normal text-foreground mb-6">주문 상품</h2>
              <div className="flex flex-col gap-5 mb-6 max-h-[320px] overflow-y-auto pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <div className="w-[60px] aspect-[3/4] rounded-[10px] overflow-hidden bg-[#f5f3f0] shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-pretendard text-[12px] text-muted-foreground uppercase tracking-widest truncate">{item.product.type}</p>
                      <p className="font-pretendard text-[14px] font-normal text-foreground truncate">{item.product.name}</p>
                      <p className="font-pretendard font-light text-[12px] text-foreground/55">{item.product.volume} · {item.qty}개</p>
                    </div>
                    <p className="font-pretendard font-medium text-[14px] text-foreground shrink-0">
                      {formatPrice(parsePrice(item.product.price) * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-5 space-y-3">
                <div className="flex justify-between font-pretendard text-[13px]">
                  <span className="text-muted-foreground font-light">상품 합계</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-pretendard text-[13px]">
                  <span className="text-muted-foreground font-light">배송비</span>
                  <span>{shipping === 0 ? '무료' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-pretendard pt-3 border-t border-border">
                  <span className="text-[15px] text-foreground">결제 금액</span>
                  <span className="text-[22px] font-medium text-foreground">{formatPrice(total)}</span>
                </div>
              </div>
              <button onClick={handleOrder} disabled={!canSubmit}
                className={`w-full mt-7 h-14 font-pretendard font-light text-[12px] tracking-[0.3em] transition-all duration-300 ${canSubmit ? 'bg-foreground text-background hover:bg-foreground/85' : 'bg-foreground/20 text-foreground/40 cursor-not-allowed'
                  }`}>
                주문 확인하기
              </button>
              {!canSubmit && (
                <p className="font-pretendard text-[11px] text-muted-foreground text-center mt-2">필수 정보를 모두 입력해 주세요</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}