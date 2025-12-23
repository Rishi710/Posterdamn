export default function AccountPage() {
    return (
        <div className="space-y-16">
            {/* Header Section */}
            <section>
                <div className="mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                    <h1 className="text-3xl font-black italic tracking-tighter lg:text-4xl uppercase text-black dark:text-white">Profile</h1>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">Manage your identity and preferences.</p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    <div className="space-y-6">
                        <InputGroup label="First Name" id="first-name" defaultValue="Abhiroop" />
                        <InputGroup label="Last Name" id="last-name" defaultValue="Singh" />
                        <InputGroup label="Email Address" id="email" type="email" defaultValue="abhiroop@posterdamn.com" />
                        <InputGroup label="Phone Number" id="phone" defaultValue="+91 98765 43210" />

                        <div className="pt-4">
                            <button className="w-full bg-black py-4 px-8 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                                Update Information
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-50/50 p-8 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Security</h4>
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                            Maintain your security by updating your password regularly. We recommend using a unique password you don&apos;t use elsewhere.
                        </p>
                        <button className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-zinc-600 dark:border-white dark:hover:text-zinc-400 transition-colors">
                            Change Password
                        </button>
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
                    <button className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        View All
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <OrderCard
                        id="#10234"
                        date="Dec 20, 2024"
                        status="Delivered"
                        price="₹1,299"
                        image="https://loremflickr.com/400/400/art,minimal"
                    />
                </div>
            </section>
        </div>
    );
}

function InputGroup({ label, id, type = "text", defaultValue }: { label: string; id: string; type?: string; defaultValue: string }) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {label}
            </label>
            <input
                type={type}
                id={id}
                className="w-full border-b border-zinc-200 bg-transparent py-2 text-base font-bold tracking-tight text-black outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors"
                defaultValue={defaultValue}
            />
        </div>
    );
}

function OrderCard({ id, date, status, price, image }: { id: string; date: string; status: string; price: string; image: string }) {
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
                <button className="text-xs font-black uppercase tracking-widest border border-zinc-200 px-6 py-2 hover:bg-black hover:text-white dark:border-zinc-800 dark:hover:bg-white dark:hover:text-black transition-all">
                    Details
                </button>
            </div>
        </div>
    );
}
