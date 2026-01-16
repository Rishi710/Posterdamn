"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, MapPin, Edit2, Trash2 } from "lucide-react";
import { useStore, Address } from "@/context/StoreContext";
import { Country, State, City } from "country-state-city";
import SearchableSelect from "@/components/ui/SearchableSelect";

export default function CheckoutPage() {
    const {
        cart,
        addresses,
        selectedAddressId,
        addAddress,
        updateAddress,
        deleteAddress,
        selectAddress,
        placeOrder,
        user
    } = useStore();

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [isPlacing, setIsPlacing] = useState(false);
    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [isCheckingZip, setIsCheckingZip] = useState(false);
    const [zipError, setZipError] = useState(false);
    const lookupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Form State - matching account/addresses structure
    const [formData, setFormData] = useState({
        type: "Home",
        firstName: "",
        lastName: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        country: "IN", // ISO code
        zip: "",
        phone: ""
    });

    // Initialize states when country is set
    React.useEffect(() => {
        if (formData.country) {
            const countryStates = State.getStatesOfCountry(formData.country);
            setStates(countryStates);

            // If state is set, load cities
            if (formData.state) {
                const stateObj = countryStates.find(s => s.name === formData.state);
                if (stateObj) {
                    setCities(City.getCitiesOfState(formData.country, stateObj.isoCode));
                }
            }
        }
    }, [formData.country, formData.state]);

    const subtotal = cart.reduce((acc, item) => acc + item.discountedPrice, 0);
    const discount = 0; // Placeholder
    const shipping = subtotal > 1500 ? 0 : 99;
    const total = subtotal - discount + shipping;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert form data to Address format
        const addressData = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            street: formData.street,
            landmark: formData.landmark,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            zip: formData.zip,
            phone: formData.phone
        };

        if (editingAddressId) {
            await updateAddress(editingAddressId, addressData);
            setEditingAddressId(null);
        } else {
            const newId = await addAddress(addressData);
            selectAddress(newId);
            setIsAddingNew(false);
        }
        setFormData({ type: "Home", firstName: "", lastName: "", street: "", landmark: "", city: "", state: "", country: "IN", zip: "", phone: "" });
    };

    // ZIP Code Validation with India Post API for Indian PIN codes
    const fetchLocationFromZip = async (zip: string, countryCode?: string) => {
        if (!zip || zip.length < 3) {
            setZipError(false);
            return;
        }

        setIsCheckingZip(true);
        setZipError(false);

        try {
            const safeZip = zip.trim();

            // For Indian PIN codes (6 digits), use India Post API
            if ((!countryCode || countryCode === 'IN') && /^\d{6}$/.test(safeZip)) {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${safeZip}`);
                    const data = await response.json();

                    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                        const postOffice = data[0].PostOffice[0];

                        // Find India in countries
                        const india = countries.find(c => c.isoCode === 'IN');
                        if (india) {
                            // Load states for India
                            const newStates = State.getStatesOfCountry('IN');
                            setStates(newStates);

                            // Find matching state
                            const stateName = postOffice.State;
                            const foundState = newStates.find(s =>
                                s.name.toLowerCase() === stateName.toLowerCase()
                            );

                            if (foundState) {
                                // Load cities for this state
                                const newCities = City.getCitiesOfState('IN', foundState.isoCode);
                                setCities(newCities);
                            }

                            // Update form data
                            setFormData(prev => ({
                                ...prev,
                                country: 'IN',
                                state: stateName,
                                city: postOffice.District || postOffice.Name,
                                zip: safeZip
                            }));

                            setZipError(false);
                            setIsCheckingZip(false);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('India Post API error:', err);
                }
            }

            // Fallback to Zippopotam for other countries
            const countriesToTry = countryCode ? [countryCode.toLowerCase()] : ['us', 'gb', 'ca', 'au'];

            for (const country of countriesToTry) {
                try {
                    const response = await fetch(`https://api.zippopotam.us/${country}/${safeZip}`);

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.places && data.places.length > 0) {
                            const place = data.places[0];
                            const countryName = data['country abbreviation'];

                            const foundCountry = countries.find(c => c.isoCode === countryName.toUpperCase());

                            if (foundCountry) {
                                const newStates = State.getStatesOfCountry(foundCountry.isoCode);
                                setStates(newStates);

                                const stateName = place['state'];
                                const foundState = newStates.find(s =>
                                    s.name.toLowerCase() === stateName.toLowerCase() ||
                                    s.isoCode === place['state abbreviation']
                                );

                                if (foundState) {
                                    const newCities = City.getCitiesOfState(foundCountry.isoCode, foundState.isoCode);
                                    setCities(newCities);
                                }

                                setFormData(prev => ({
                                    ...prev,
                                    country: foundCountry.isoCode,
                                    state: stateName,
                                    city: place['place name'] || prev.city,
                                    zip: safeZip
                                }));

                                setZipError(false);
                                setIsCheckingZip(false);
                                return;
                            }
                        }
                    }
                } catch (err) {
                    continue;
                }
            }

            // If we get here, no valid ZIP was found
            setZipError(true);
        } catch (error) {
            console.error('ZIP lookup error:', error);
            setZipError(true);
        } finally {
            setIsCheckingZip(false);
        }
    };

    const handleZipChange = (value: string) => {
        setFormData({ ...formData, zip: value });

        if (lookupTimeoutRef.current) {
            clearTimeout(lookupTimeoutRef.current);
        }

        // For Indian PIN codes, check after 6 digits
        const minLength = /^\d{6}$/.test(value) ? 6 : 5;

        if (value.length >= minLength) {
            lookupTimeoutRef.current = setTimeout(() => {
                fetchLocationFromZip(value, formData.country || undefined);
            }, 800);
        } else {
            setZipError(false);
        }
    };

    const handleEdit = (addr: Address) => {
        const nameParts = addr.name.split(" ");
        setFormData({
            type: "Home",
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            street: addr.street,
            landmark: addr.landmark || "",
            city: addr.city,
            state: addr.state,
            country: addr.country,
            zip: addr.zip,
            phone: addr.phone
        });
        setEditingAddressId(addr.id);
        setIsAddingNew(true);
    };

    const handlePlaceOrder = async () => {
        setIsPlacing(true);
        const result = await placeOrder();
        setIsPlacing(false);

        if (result.success) {
            window.location.href = `/checkout/success?id=${result.orderId}`;
        } else {
            alert(result.error || "Failed to place order. Please try again.");
        }
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 bg-white dark:bg-black min-h-screen">
            {/* Header */}
            <div className="mb-12 flex items-center gap-4">
                <Link href="/cart" className="group flex items-center gap-2 text-sm uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Bag
                </Link>
                <h1 className="text-4xl tracking-tighter uppercase text-black dark:text-white lg:text-5xl">Checkout</h1>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
                {/* Left Column: Address Management */}
                <div className="lg:col-span-8 space-y-12">
                    <section>
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-8">
                            <h2 className="text-xl uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs text-white dark:bg-white dark:text-black">1</span>
                                Shipping Address
                            </h2>
                            {!isAddingNew && (
                                <button
                                    onClick={() => {
                                        setEditingAddressId(null);
                                        setFormData({ type: "Home", firstName: "", lastName: "", street: "", landmark: "", city: "", state: "", country: "IN", zip: "", phone: "" });
                                        setIsAddingNew(true);
                                    }}
                                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-black dark:text-white hover:opacity-50 transition-opacity"
                                >
                                    <Plus className="h-4 w-4" /> Add New
                                </button>
                            )}
                        </div>

                        {isAddingNew ? (
                            <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-zinc-900 p-8 border border-zinc-100 dark:border-zinc-800 space-y-6">
                                <h3 className="text-sm uppercase tracking-widest text-black dark:text-white">
                                    {editingAddressId ? "Edit Address" : "New Shipping Address"}
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <FormInput label="First Name" value={formData.firstName} onChange={(v) => setFormData({ ...formData, firstName: v })} placeholder="John" />
                                    <FormInput label="Last Name" value={formData.lastName} onChange={(v) => setFormData({ ...formData, lastName: v })} placeholder="Doe" />
                                    <FormInput label="Phone Number" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} placeholder="9876543210" />
                                    <div className="sm:col-span-2">
                                        <FormInput label="Street Address" value={formData.street} onChange={(v) => setFormData({ ...formData, street: v })} placeholder="House No, Street Name" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <FormInput label="Landmark / Area (Optional)" value={formData.landmark || ""} onChange={(v) => setFormData({ ...formData, landmark: v })} placeholder="Apartment, Landmark" />
                                    </div>

                                    {/* Country Dropdown */}
                                    <div className="sm:col-span-2">
                                        <SearchableSelect
                                            options={countries.map(c => ({ value: c.isoCode, label: c.name }))}
                                            value={formData.country}
                                            onChange={(val) => {
                                                setFormData({ ...formData, country: val, state: "", city: "" });
                                                setStates(State.getStatesOfCountry(val));
                                                setCities([]);
                                            }}
                                            placeholder="Select Country"
                                            label="Country"
                                        />
                                    </div>

                                    {/* State Dropdown */}
                                    <SearchableSelect
                                        options={states.map(s => ({ value: s.name, label: s.name }))}
                                        value={formData.state}
                                        onChange={(val) => {
                                            setFormData({ ...formData, state: val, city: "" });
                                            const selectedState = states.find(s => s.name === val);
                                            if (selectedState) {
                                                setCities(City.getCitiesOfState(formData.country, selectedState.isoCode));
                                            }
                                        }}
                                        placeholder="Select State"
                                        label="State"
                                    />

                                    {/* City Dropdown */}
                                    <SearchableSelect
                                        options={cities.map(c => ({ value: c.name, label: c.name }))}
                                        value={formData.city}
                                        onChange={(val) => setFormData({ ...formData, city: val })}
                                        placeholder="Select City"
                                        label="City"
                                    />

                                    {/* ZIP Code with Validation */}
                                    <div className="relative">
                                        <FormInput
                                            label="ZIP / Postal Code"
                                            value={formData.zip}
                                            onChange={handleZipChange}
                                            placeholder="452001"
                                        />
                                        {isCheckingZip && (
                                            <div className="absolute right-3 top-9 text-xs text-zinc-400">Checking...</div>
                                        )}
                                        {zipError && (
                                            <p className="mt-1 text-xs text-red-500">Invalid ZIP code</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="flex-1 bg-black py-4 text-xs uppercase tracking-widest text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity">
                                        {editingAddressId ? "Update Address" : "Save Address"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingNew(false)}
                                        className="px-8 py-4 text-xs uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {addresses.length === 0 ? (
                                    <div className="sm:col-span-2 flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                                        <MapPin className="h-10 w-10 text-zinc-300 mb-4" />
                                        <p className="text-sm text-zinc-500 uppercase tracking-widest text-center px-4">No addresses saved yet</p>
                                        <button
                                            onClick={() => setIsAddingNew(true)}
                                            className="mt-4 text-xs uppercase text-black dark:text-white underline underline-offset-4"
                                        >
                                            Add your first address
                                        </button>
                                    </div>
                                ) : (
                                    addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => selectAddress(addr.id)}
                                            className={`group relative cursor-pointer border-2 p-6 transition-all rounded-lg ${selectedAddressId === addr.id
                                                ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900'
                                                : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-300 dark:border-zinc-700">
                                                    {selectedAddressId === addr.id && <div className="h-2.5 w-2.5 rounded-full bg-black dark:bg-white" />}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(addr); }}
                                                        className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                                        aria-label="Edit address"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                                                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                                        aria-label="Delete address"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm uppercase tracking-tight text-black dark:text-white mb-2">{addr.name}</p>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                {addr.street}
                                                {addr.landmark && <>, {addr.landmark}</>}
                                                <br />
                                                {addr.city}, {addr.state} - {addr.zip}
                                                <br />
                                                {addr.country}
                                            </p>
                                            <p className="mt-3 text-[10px] uppercase tracking-widest text-zinc-400">📞 {addr.phone}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>

                    <section className={`${!selectedAddressId ? 'opacity-50 pointer-events-none' : 'opacity-100'} transition-opacity`}>
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-8">
                            <h2 className="text-xl uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs text-white dark:bg-white dark:text-black">2</span>
                                Payment Method
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 border-2 border-black dark:border-white">
                                <div className="flex items-center gap-4">
                                    <div className="h-4 w-4 rounded-full border border-zinc-300 flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-black dark:bg-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm uppercase tracking-widest text-black dark:text-white">Cash on Delivery</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Pay when you receive your posters</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="mt-16 lg:col-span-4 lg:mt-0">
                    <div className="sticky top-24 space-y-8 bg-zinc-50 p-8 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <h2 className="text-2xl tracking-tighter uppercase text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4">Order Summary</h2>

                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="h-16 w-12 flex-shrink-0 bg-white dark:bg-black overflow-hidden border border-zinc-100 dark:border-zinc-800">
                                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs uppercase tracking-tight text-black dark:text-white truncate">{item.title}</p>
                                        <p className="text-[10px] text-zinc-400">Qty: 1</p>
                                        <p className="mt-1 text-xs text-black dark:text-white">₹{item.discountedPrice}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                            <SummaryRow label="Subtotal" value={`₹${subtotal} `} />
                            <SummaryRow label="Shipping" value={shipping === 0 ? "FREE" : `₹${shipping} `} />
                            <div className="flex justify-between text-xl uppercase tracking-tighter pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                <span className="text-black dark:text-white">Total</span>
                                <span className="text-black dark:text-white">₹{Math.round(total)}</span>
                            </div>
                        </div>

                        {user ? (
                            <button
                                disabled={!selectedAddressId || isPlacing}
                                onClick={handlePlaceOrder}
                                className={`flex w-full items-center justify-center gap-2 py-6 text-sm uppercase tracking-[0.2em] transition-all ${selectedAddressId && !isPlacing
                                    ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600'
                                    }`}
                            >
                                {isPlacing ? "Processing..." : "Place Order"}
                            </button>
                        ) : (
                            <Link
                                href="/login?next=/checkout"
                                className="flex w-full items-center justify-center gap-2 py-6 text-sm uppercase tracking-[0.2em] bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all"
                            >
                                Login to Place Order
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

function FormInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
            />
        </div>
    );
}

function SummaryRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between text-sm uppercase tracking-widest">
            <span className="text-zinc-500">{label}</span>
            <span className="text-black dark:text-white">{value}</span>
        </div>
    );
}
