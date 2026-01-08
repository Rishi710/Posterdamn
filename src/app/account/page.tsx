"use client";
import { useStore } from "@/context/StoreContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function AccountPage() {
    const { user, session } = useStore();
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password Change State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Recent Orders State
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!user && !session) {
            // Optional: redirect to login if not authenticated
            // router.push("/login");
        } else if (user) {
            const fullName = user.user_metadata?.full_name || "";
            const nameParts = fullName.split(" ");
            setFirstName(nameParts[0] || (user.email?.split("@")[0]) || "");
            setLastName(nameParts.slice(1).join(" ") || "");
            setPhone(user.user_metadata?.phone_number || user.phone || "");

            // Handle recovery action from query params
            const params = new URLSearchParams(window.location.search);
            if (params.get('action') === 'reset-password') {
                setIsChangingPassword(true);
                window.history.replaceState({}, '', window.location.pathname);
            }

            if (params.get('reset') === 'success') {
                setPwdMessage({ type: 'success', text: "Password was reset successfully. Your identity is secure." });
                window.history.replaceState({}, '', window.location.pathname);
            }

            // Fetch recent orders
            fetchRecentOrders();
        }
    }, [user, session, router]);

    const fetchRecentOrders = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    created_at,
                    total_amount,
                    status,
                    order_items!inner(image)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);

            if (!error && data) {
                setRecentOrders(data);
            }
        } catch (err) {
            console.error('Error fetching recent orders:', err);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: `${firstName} ${lastName}`.trim(),
                phone_number: phone,
            }
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
            setIsEditing(false);
        }
        setLoading(false);
    };

    const handleUpdatePassword = async () => {
        setPwdMessage(null);

        if (newPassword.length < 6) {
            setPwdMessage({ type: 'error', text: "Password must be at least 6 characters long." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPwdMessage({ type: 'error', text: "Passwords do not match." });
            return;
        }

        setPwdLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            setPwdMessage({ type: 'error', text: error.message });
        } else {
            setPwdMessage({ type: 'success', text: "Password updated successfully!" });
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                setIsChangingPassword(false);
                setPwdMessage(null);
            }, 2000);
        }
        setPwdLoading(false);
    };

    return (
        <div className="space-y-16">
            {/* Header Section */}
            <section>
                <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter lg:text-4xl uppercase text-black dark:text-white">Profile</h1>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">Manage your identity and preferences.</p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Edit Information
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    <div className="space-y-6">
                        {message && (
                            <div className={`flex items-center gap-2 rounded-lg p-4 text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-950/20' : 'bg-red-50 text-red-600 dark:bg-red-950/20'}`}>
                                {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {message.text}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="first-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">First Name</label>
                            <input
                                id="first-name"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={!isEditing}
                                className={`w-full border-b bg-transparent py-2 text-base font-bold tracking-tight outline-none transition-colors ${isEditing ? "border-zinc-200 text-black focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white" : "border-transparent text-zinc-600 dark:text-zinc-400 cursor-default"}`}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="last-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Last Name</label>
                            <input
                                id="last-name"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={!isEditing}
                                className={`w-full border-b bg-transparent py-2 text-base font-bold tracking-tight outline-none transition-colors ${isEditing ? "border-zinc-200 text-black focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white" : "border-transparent text-zinc-600 dark:text-zinc-400 cursor-default"}`}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="w-full border-b border-zinc-200 bg-transparent py-2 text-base font-bold tracking-tight text-zinc-400 outline-none cursor-not-allowed dark:border-zinc-800"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={!isEditing}
                                placeholder={isEditing ? "+91" : ""}
                                className={`w-full border-b bg-transparent py-2 text-base font-bold tracking-tight outline-none transition-colors ${isEditing ? "border-zinc-200 text-black focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white" : "border-transparent text-zinc-600 dark:text-zinc-400 cursor-default"}`}
                            />
                        </div>

                        {isEditing ? (
                            <div className="pt-4 flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset fields logic not strictly required but UX friendly
                                        if (user) {
                                            const fullName = user.user_metadata?.full_name || "";
                                            const nameParts = fullName.split(" ");
                                            setFirstName(nameParts[0] || (user.email?.split("@")[0]) || "");
                                            setLastName(nameParts.slice(1).join(" ") || "");
                                            setPhone(user.user_metadata?.phone_number || user.phone || "");
                                        }
                                    }}
                                    className="flex-1 bg-zinc-100 py-4 px-8 text-xs font-black uppercase tracking-widest text-zinc-500 transition-all hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={loading}
                                    className="flex-1 bg-black py-4 px-8 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="bg-zinc-50/50 p-8 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Security</h4>
                        {!isChangingPassword ? (
                            <>
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                                    Maintain your security by updating your password regularly. We recommend using a unique password you don&apos;t use elsewhere.
                                </p>
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-zinc-600 dark:border-white dark:hover:text-zinc-400 transition-colors"
                                >
                                    Change Password
                                </button>
                            </>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                {pwdMessage && (
                                    <div className={`text-[10px] font-black uppercase tracking-widest p-3 rounded ${pwdMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {pwdMessage.text}
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full border-b border-zinc-200 bg-transparent py-2 text-base font-bold tracking-tight text-black outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors"
                                            placeholder=""
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full border-b bg-transparent py-2 text-base font-bold tracking-tight text-black outline-none transition-colors placeholder:text-zinc-300 dark:text-white dark:placeholder:text-zinc-700
                                                ${confirmPassword && newPassword !== confirmPassword ? "border-red-500 focus:border-red-500" : "border-zinc-200 focus:border-black dark:border-zinc-800 dark:focus:border-white"}`}
                                            placeholder=""
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider animate-in fade-in duration-300">
                                            Passwords do not match
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={pwdLoading || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                                        className="flex-1 bg-black py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                    >
                                        {pwdLoading ? "Updating..." : "Update"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPwdMessage(null);
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }}
                                        disabled={pwdLoading}
                                        className="flex-1 border border-zinc-200 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all dark:border-zinc-800 dark:hover:bg-zinc-900"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Recent Orders Preview */}
            <section>
                <div className="mb-8 flex items-end justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-black dark:text-white">Recent Orders</h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-1">Your latest acquisitions</p>
                    </div>
                    <a href="/account/orders" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        View All
                    </a>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-lg">
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No orders yet</p>
                            <a href="/shop" className="mt-4 text-xs font-black uppercase tracking-widest text-black dark:text-white underline underline-offset-4">
                                Start Shopping
                            </a>
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                id={`#${order.id.slice(-8).toUpperCase()}`}
                                date={new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                status={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                price={`₹${order.total_amount}`}
                                image={order.order_items[0]?.image || 'https://loremflickr.com/400/400/art,minimal'}
                                orderId={order.id}
                            />
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

function OrderCard({ id, date, status, price, image, orderId }: { id: string; date: string; status: string; price: string; image: string; orderId?: string }) {
    return (
        <div className="group flex flex-col gap-6 border border-zinc-100 bg-white p-6 transition-all hover:border-black dark:border-zinc-800 dark:bg-black dark:hover:border-white sm:flex-row sm:items-center">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Order" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>

            <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-black tracking-tighter">{id}</span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:bg-zinc-900">
                        {status}
                    </span>
                </div>
                <p className="text-sm font-medium text-zinc-400">Ordered on {date}</p>
            </div>

            <div className="flex flex-col items-start gap-4 sm:items-end">
                <span className="text-xl font-black tracking-tight">{price}</span>
                <a href="/account/orders" className="text-xs font-black uppercase tracking-widest border border-zinc-200 px-6 py-2 hover:bg-black hover:text-white dark:border-zinc-800 dark:hover:bg-white dark:hover:text-black transition-all inline-block text-center">
                    Details
                </a>
            </div>
        </div>
    );
}
