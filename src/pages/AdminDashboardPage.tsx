import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, TrendingUp, Users, LogOut } from 'lucide-react';
import { useOrders, type Order } from '../context/OrderContext';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';
import AdminProtectedRoute from '../components/AdminProtectedRoute';

const STATUS_OPTIONS: Order['status'][] = ['결제 완료', '배송 준비', '배송 중', '배송 완료', '취소됨'];

const STATUS_STYLE: Record<string, string> = {
    '결제 완료': 'text-foreground/70',
    '배송 준비': 'text-amber-600',
    '배송 중': 'text-blue-600',
    '배송 완료': 'text-foreground/40',
    '취소됨': 'text-red-400',
};

function formatWon(n: number) {
    return n.toLocaleString('ko-KR') + '원';
}

function parsePrice(price: string) {
    return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
}

type Tab = 'orders' | 'sales' | 'customers';

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'orders', label: '주문 관리', icon: Package },
    { id: 'sales', label: '상품별 판매량', icon: TrendingUp },
    { id: 'customers', label: '고객 통계', icon: Users },
];

function AdminDashboardPage() {
    const { orders, updateOrderStatus } = useOrders();
    const { logoutAdmin } = useAdminAuthStore();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('orders');

    const activeOrders = orders.filter((o) => o.status !== '취소됨');
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const uniqueCustomers = new Set(orders.map((o) => o.shippingPhone.replace(/[^0-9]/g, ''))).size;

    const productSales = useMemo(() => {
        const map = new Map<string, { name: string; type: string; image: string; qty: number; revenue: number }>();
        activeOrders.forEach((order) => {
            order.items.forEach((item) => {
                const existing = map.get(item.product.id);
                const lineRevenue = parsePrice(item.product.price) * item.qty;
                if (existing) {
                    existing.qty += item.qty;
                    existing.revenue += lineRevenue;
                } else {
                    map.set(item.product.id, {
                        name: item.product.name,
                        type: item.product.type,
                        image: item.product.image,
                        qty: item.qty,
                        revenue: lineRevenue,
                    });
                }
            });
        });
        return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
    }, [activeOrders]);

    const handleStatusChange = (orderId: string, status: Order['status']) => {
        updateOrderStatus(orderId, status);
        showToast('주문 상태를 변경했습니다', 'success');
    };

    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };

    return (
        <div className="pt-20 min-h-screen pb-24">
            <SEO title="관리자 대시보드" />

            <div className="border-b border-border px-8 md:px-16 lg:px-24 py-10 flex items-center justify-between">
                <div>
                    <h1 className="font-pretendard text-[36px] font-normal text-foreground">관리자 대시보드</h1>
                    <p className="font-pretendard font-light text-[13px] text-muted-foreground mt-1">
                        주문·판매·고객 데이터를 관리하세요
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 font-pretendard text-[12px] tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                    <LogOut size={14} /> 로그아웃
                </button>
            </div>

            <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 mt-8">
                {/* Stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="border border-border p-6 rounded-[4px]">
                        <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase mb-2">
                            총 주문 수
                        </p>
                        <p className="font-pretendard text-[32px] text-foreground">{orders.length}건</p>
                    </div>
                    <div className="border border-border p-6 rounded-[4px]">
                        <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase mb-2">
                            총 매출 (취소 제외)
                        </p>
                        <p className="font-pretendard text-[32px] text-foreground">{formatWon(totalRevenue)}</p>
                    </div>
                    <div className="border border-border p-6 rounded-[4px]">
                        <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase mb-2">
                            구매 고객 수
                        </p>
                        <p className="font-pretendard text-[32px] text-foreground">{uniqueCustomers}명</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0 border-b border-border mb-8">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 font-pretendard text-[12px] tracking-widest px-6 py-4 border-b-[1.5px] -mb-px transition-all duration-200 ${activeTab === id
                                ? 'border-foreground text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'orders' && (
                    <div className="flex flex-col gap-4">
                        {orders.length === 0 ? (
                            <p className="font-pretendard font-light text-[14px] text-muted-foreground text-center py-16">
                                주문 내역이 없습니다.
                            </p>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="border border-border p-5 rounded-[4px]">
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                        <div>
                                            <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground">
                                                {order.date} · {order.id}
                                            </p>
                                            <p className="font-pretendard text-[13px] text-foreground mt-0.5">
                                                {order.shippingName} · {order.shippingPhone}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-pretendard text-[12px] ${STATUS_STYLE[order.status] ?? 'text-foreground/60'}`}>
                                                {order.status}
                                            </span>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                                className="border border-border font-pretendard text-[12px] text-foreground px-3 py-1.5 outline-none focus:border-foreground cursor-pointer"
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {order.items.map((item, i) => (
                                            <p key={i} className="font-pretendard font-light text-[13px] text-foreground/70">
                                                {item.product.name} · {item.qty}개
                                            </p>
                                        ))}
                                    </div>

                                    <p className="font-pretendard font-medium text-[14px] text-foreground mt-3 pt-3 border-t border-border text-right">
                                        {formatWon(order.totalPrice)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'sales' && (
                    <div className="flex flex-col gap-3">
                        {productSales.length === 0 ? (
                            <p className="font-pretendard font-light text-[14px] text-muted-foreground text-center py-16">
                                판매 데이터가 없습니다.
                            </p>
                        ) : (
                            productSales.map((p, i) => (
                                <div key={p.name + i} className="flex items-center gap-4 border border-border p-4 rounded-[4px]">
                                    <span className="pretendard text-[20px] text-foreground/30 w-8 shrink-0 text-center">
                                        {i + 1}
                                    </span>
                                    <div className="w-14 h-16 rounded-[8px] overflow-hidden bg-[#f5f3f0] shrink-0">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-pretendard text-[10px] tracking-widest text-muted-foreground uppercase">
                                            {p.type}
                                        </p>
                                        <p className="font-pretendard text-[14px] text-foreground truncate">{p.name}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-pretendard text-[15px] font-medium text-foreground">{p.qty}개 판매</p>
                                        <p className="font-pretendard text-[12px] text-muted-foreground">{formatWon(p.revenue)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="border border-border p-6 rounded-[4px]">
                        <p className="font-pretendard font-light text-[13px] text-foreground/75 leading-relaxed">
                            현재 고객 통계는 <strong className="font-normal text-foreground">주문 데이터</strong> 기준으로 계산돼요
                            (전화번호 기준 고유 고객 수). Firebase에 가입된 전체 회원 수는 클라이언트에서 직접 조회할 수 없어서
                            (Admin SDK 필요), 별도 Cloud Function을 추가하면 실제 가입자 수까지 연동할 수 있어요.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                                <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase mb-1">
                                    구매 고객 수
                                </p>
                                <p className="font-pretendard text-[28px] text-foreground">{uniqueCustomers}명</p>
                            </div>
                            <div>
                                <p className="font-pretendard text-[11px] tracking-widest text-muted-foreground uppercase mb-1">
                                    고객당 평균 주문 수
                                </p>
                                <p className="font-pretendard text-[28px] text-foreground">
                                    {uniqueCustomers > 0 ? (orders.length / uniqueCustomers).toFixed(1) : '0'}건
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const AdminDashboardPageGuarded = () => (
    <AdminProtectedRoute>
        <AdminDashboardPage />
    </AdminProtectedRoute>
);

export { AdminDashboardPageGuarded as default };