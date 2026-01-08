"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit2, Trash2, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/context/StoreContext";
import { Country, State, City } from "country-state-city";
import SearchableSelect from "@/components/ui/SearchableSelect";

interface Address {
    id: string;
    type: string;
    name: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    phone: string;
    is_default: boolean;
}

export default function AddressesPage() {
    const { user } = useStore();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCheckingZip, setIsCheckingZip] = useState(false);
    const [zipError, setZipError] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const lookupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        type: "Home",
        firstName: "",
        lastName: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        country: "IN", // ISO code for India
        zip: "",
        phone: ""
    });

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
                console.warn('RAW SUPABASE ERROR:', errorStr);
                throw new Error(error.message || `Supabase Error: ${errorStr}`);
            }
            setAddresses(data || []);
        } catch (err: any) {
            console.error('FETCH ERROR:', err);
            let message = err.message;
            if (err.code === '42P01' || message?.includes('relation "addresses" does not exist')) {
                message = "Setup Required: The 'addresses' table is missing. Please run the SQL script in Supabase.";
            }
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            alert("Please log in to save addresses.");
            return;
        }

        // Basic Validation
        if (!formData.firstName || !formData.lastName || !formData.street || !formData.city || !formData.state || !formData.zip || !formData.phone) {
            alert("Please fill in all fields.");
            return;
        }

        if (zipError) {
            alert("The provided ZIP code is invalid or not found. Please correct it before saving.");
            return;
        }

        try {
            setLoading(true);
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            const addressData = {
                user_id: user.id,
                type: formData.type || "Home", // Default if empty
                name: fullName,
                street: formData.street,
                landmark: formData.landmark,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                zip: formData.zip,
                phone: formData.phone,
                // If it's the first address, make it default automatically
                is_default: addresses.length === 0
            };

            console.log("Saving Address Data:", addressData);

            if (editingId) {
                // Update existing
                const { error } = await supabase
                    .from('addresses')
                    .update({
                        type: formData.type || "Home",
                        name: fullName,
                        street: formData.street,
                        landmark: formData.landmark,
                        city: formData.city,
                        state: formData.state,
                        country: formData.country,
                        zip: formData.zip,
                        phone: formData.phone
                    })
                    .eq('id', editingId);
                if (error) {
                    const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
                    console.warn('SAVE UPDATE ERROR:', errorStr);
                    throw error;
                }
            } else {
                // Insert new
                const { error } = await supabase
                    .from('addresses')
                    .insert([addressData]);
                if (error) {
                    const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
                    console.warn('SAVE INSERT ERROR:', errorStr);
                    throw error;
                }
            }

            await fetchAddresses();
            resetForm();
        } catch (err: any) {
            console.error("FULL SAVE ERROR:", err);
            const msg = err.message || JSON.stringify(err) || "Unknown error";
            setErrorMsg(`Error saving address: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!user) return;
        try {
            setLoading(true);
            // 1. Reset all addresses for this user to is_default = false
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);

            // 2. Set the selected address to true
            const { error } = await supabase
                .from('addresses')
                .update({ is_default: true })
                .eq('id', id);

            if (error) {
                const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
                console.warn('SET DEFAULT ERROR:', errorStr);
                throw error;
            }
            await fetchAddresses();
        } catch (err: any) {
            setErrorMsg(`Error setting default address: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string | null) => {
        if (!id) {
            alert("Error: Invalid Address ID");
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', id);

            if (error) {
                const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
                console.warn('DELETE ERROR:', errorStr);
                throw error;
            }
            await fetchAddresses();
            setAddressToDelete(null); // Close modal
        } catch (err: any) {
            setErrorMsg(`Error deleting address: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setErrorMsg(null);
        setFormData({
            type: "Home", // Default to Home
            firstName: "",
            lastName: "",
            street: "",
            landmark: "",
            city: "",
            state: "",
            country: "IN",
            zip: "",
            phone: ""
        });
        setZipError(false);
    };

    const startEdit = (address: Address) => {
        // Simple name split logic
        const nameParts = address.name.split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(' ') || "";

        setFormData({
            type: address.type,
            firstName,
            lastName,
            street: address.street,
            landmark: address.landmark || "",
            city: address.city,
            state: address.state,
            country: address.country || "IN",
            zip: address.zip,
            phone: address.phone
        });
        setEditingId(address.id);
    };

    const fetchLocationFromZip = async (zip: string, country: string) => {
        // Validation: Ensure we have a valid country and a plausible ZIP length
        if (!zip || zip.length < 3 || !country) {
            setZipError(false);
            return;
        }

        setIsCheckingZip(true);
        setZipError(false);

        try {
            const safeZip = zip.trim();

            // For Indian PIN codes (6 digits), use India Post API
            if (country === 'IN' && /^\d{6}$/.test(safeZip)) {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${safeZip}`);
                    const data = await response.json();

                    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                        const postOffice = data[0].PostOffice[0];
                        const stateName = postOffice.State;
                        const cityName = postOffice.District || postOffice.Name;

                        // Find matching state
                        const allStates = State.getStatesOfCountry('IN');
                        const matchedState = allStates.find(s =>
                            s.name.toLowerCase() === stateName.toLowerCase()
                        );

                        const stateCode = matchedState ? matchedState.isoCode : stateName;

                        setFormData(prev => ({
                            ...prev,
                            city: cityName,
                            state: stateCode
                        }));

                        // Load cities for the state
                        if (matchedState) {
                            const newCities = City.getCitiesOfState('IN', matchedState.isoCode);
                            setCities(newCities);
                        }

                        setZipError(false);
                        setIsCheckingZip(false);
                        return;
                    } else {
                        setZipError(true);
                        setIsCheckingZip(false);
                        return;
                    }
                } catch (err) {
                    console.warn('India Post API error:', err);
                    setZipError(true);
                    setIsCheckingZip(false);
                    return;
                }
            }

            // Fallback to Zippopotam for other countries
            const safeCountry = encodeURIComponent(country.toLowerCase());
            const encodedZip = encodeURIComponent(safeZip);

            const response = await fetch(`https://api.zippopotam.us/${safeCountry}/${encodedZip}`, {
                method: 'GET',
                mode: 'cors',
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.places && data.places.length > 0) {
                    const place = data.places[0];
                    const cityName = place['place name'];
                    const stateName = place['state'];
                    const stateAbbr = place['state abbreviation'];

                    const allStates = State.getStatesOfCountry(country);
                    const matchedState = allStates.find(s =>
                        s.isoCode === stateAbbr ||
                        s.name.toLowerCase() === stateName.toLowerCase()
                    );

                    const stateCode = matchedState ? matchedState.isoCode : stateAbbr;

                    setFormData(prev => ({
                        ...prev,
                        city: cityName,
                        state: stateCode
                    }));

                    const newCities = City.getCitiesOfState(country, stateCode);
                    setCities(newCities);
                } else {
                    setZipError(true);
                }
            } else {
                setZipError(true);
            }
        } catch (err) {
            console.warn("ZIP Lookup Network Error:", err);
            setZipError(true);
        } finally {
            setIsCheckingZip(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === "country") {
            const newStates = State.getStatesOfCountry(value);
            setStates(newStates);
            setFormData(prev => ({ ...prev, state: "", city: "" }));
            setCities([]);
            setZipError(false); // Reset error on country change
        } else if (field === "state") {
            const newCities = City.getCitiesOfState(formData.country, value);
            setCities(newCities);
            setFormData(prev => ({ ...prev, city: "" }));
        } else if (field === "zip") {
            setZipError(false); // Clear error while typing
            // Trigger ZIP lookup with debounce
            if (lookupTimeoutRef.current) clearTimeout(lookupTimeoutRef.current);
            lookupTimeoutRef.current = setTimeout(() => {
                fetchLocationFromZip(value, formData.country);
            }, 800);
        }
    };

    // Load states/cities when editing OR when initial default country is set
    useEffect(() => {
        if (formData.country) {
            const currentStates = State.getStatesOfCountry(formData.country);
            setStates(currentStates);

            if (formData.state) {
                const currentCities = City.getCitiesOfState(formData.country, formData.state);
                setCities(currentCities);
            }
        }
    }, [formData.country, formData.state]); // Re-run when country or state changes in formData

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter lg:text-4xl uppercase text-black dark:text-white">Addresses</h1>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">Manage your delivery locations.</p>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-black px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        <Plus className="h-3 w-3" strokeWidth={3} />
                        Add New
                    </button>
                )}
            </div>

            {errorMsg && (
                <div className="mb-8 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                    <p className="font-bold">Error Loading Addresses:</p>
                    <p>{errorMsg}</p>
                    <p className="mt-2 text-xs opacity-75">Check console for more details.</p>
                </div>
            )}

            {loading && addresses.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
            ) : (isAdding || editingId) ? (
                <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-zinc-200 animate-in fade-in zoom-in-95 duration-500 dark:bg-zinc-900 dark:ring-zinc-800">
                    <div className="mb-10 flex items-center justify-between">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase text-black dark:text-white">
                            {editingId ? "Edit Destination" : "New Destination"}
                        </h3>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <MapPin className="h-5 w-5 text-zinc-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        {/* Status / Type */}
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">
                                Address Category
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {["Home", "Work", "Friend", "Other"].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => handleChange('type', t)}
                                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                                            ${formData.type === t
                                                ? "bg-black text-white dark:bg-white dark:text-black"
                                                : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold"}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name Fields */}
                        <InputGroup
                            label="First Name"
                            placeholder="Alex"
                            value={formData.firstName}
                            onChange={(val) => handleChange('firstName', val)}
                        />
                        <InputGroup
                            label="Last Name"
                            placeholder="Damian"
                            value={formData.lastName}
                            onChange={(val) => handleChange('lastName', val)}
                        />

                        {/* Contact */}
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block">
                                Phone Number
                            </label>
                            <div className="flex items-center gap-3 border-b border-zinc-200 py-2 focus-within:border-black dark:border-zinc-800 dark:focus-within:border-white transition-colors group">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-50 dark:bg-zinc-800/50 text-sm font-black text-zinc-500">
                                    <span>+{Country.getCountryByCode(formData.country)?.phonecode}</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="9876543210"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="flex-1 bg-transparent text-base font-bold tracking-tight text-black outline-none dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="sm:col-span-2">
                            <SearchableSelect
                                label="Country"
                                placeholder="Select Country"
                                options={countries.map(c => ({ value: c.isoCode, label: c.name }))}
                                value={formData.country}
                                onChange={(val) => handleChange('country', val)}
                            />
                        </div>

                        <SearchableSelect
                            label="State / Province"
                            placeholder="Select State"
                            options={states.map(s => ({ value: s.isoCode, label: s.name }))}
                            value={formData.state}
                            onChange={(val) => handleChange('state', val)}
                            disabled={!formData.country}
                        />

                        <SearchableSelect
                            label="City"
                            placeholder="Select City"
                            options={cities.map(c => ({ value: c.name, label: c.name }))}
                            value={formData.city}
                            onChange={(val) => handleChange('city', val)}
                            disabled={!formData.state}
                        />

                        <div className="sm:col-span-2">
                            <InputGroup
                                label="Street & House Details"
                                placeholder="E.g. 42 Wallaby Way"
                                value={formData.street}
                                onChange={(val) => handleChange('street', val)}
                            />
                        </div>

                        <InputGroup
                            label="Landmark (Optional)"
                            placeholder="E.g. Opposite the park"
                            value={formData.landmark || ""}
                            onChange={(val) => handleChange('landmark', val)}
                        />

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                Postal / ZIP Code
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="110001"
                                    value={formData.zip}
                                    onChange={(e) => handleChange('zip', e.target.value)}
                                    className={`w-full border-b bg-transparent py-2 text-base font-bold tracking-tight text-black outline-none transition-colors placeholder:text-zinc-300 dark:text-white dark:placeholder:text-zinc-700
                                        ${zipError ? "border-red-500 focus:border-red-500" : "border-zinc-200 focus:border-black dark:border-zinc-800 dark:focus:border-white"}`}
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isCheckingZip && (
                                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                    )}
                                    {!isCheckingZip && formData.zip.length >= 3 && !zipError && (
                                        <button
                                            onClick={() => fetchLocationFromZip(formData.zip, formData.country)}
                                            className="text-[10px] font-black uppercase text-zinc-400 hover:text-black dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Lookup
                                        </button>
                                    )}
                                </div>
                            </div>
                            {zipError && (
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                                    ZIP not found
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-6 sm:col-span-2">
                            <button
                                onClick={handleSave}
                                disabled={loading || zipError || isCheckingZip}
                                className="flex-1 bg-black py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Saving...</span>
                                    </div>
                                ) : "Commit Address"}
                            </button>
                            <button
                                onClick={resetForm}
                                className="flex-1 border border-zinc-200 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900 active:scale-[0.98]"
                            >
                                Abort
                            </button>
                        </div>
                    </div>
                </section>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`group flex flex-col justify-between border p-6 transition-all hover:border-black dark:hover:border-white ${address.is_default ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900" : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-black"}`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${address.is_default ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
                                        {address.type}
                                    </span>
                                    {address.is_default && (
                                        <span className="flex items-center gap-1 text-[10px] font-black tracking-widest text-black dark:text-white uppercase italic">
                                            <MapPin className="h-3 w-3" /> Default
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-lg font-black tracking-tighter uppercase text-black dark:text-white">{address.name}</h4>
                                    <p className="mt-1 text-sm font-medium text-zinc-500 leading-relaxed">
                                        {address.street}
                                        {address.landmark && <><br /><span className="text-xs italic text-zinc-400">Near: {address.landmark}</span></>}
                                        <br />
                                        {address.city}, {State.getStateByCodeAndCountry(address.state, address.country)?.name || address.state} {address.zip}<br />
                                        {Country.getCountryByCode(address.country)?.name || address.country}<br />
                                        {address.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-4 border-t border-zinc-50 pt-6 dark:border-zinc-800">
                                {!address.is_default && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        <MapPin className="h-3 w-3" />
                                        Make Default
                                    </button>
                                )}
                                <button
                                    onClick={() => startEdit(address)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <Edit2 className="h-3 w-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setAddressToDelete(address.id)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex min-h-[200px] flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-100 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/30"
                    >
                        <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
                            <Plus className="h-6 w-6 text-zinc-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Add New Address</span>
                    </button>
                </div>
            )}

            {/* Premium Delete Confirmation Modal */}
            {addressToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddressToDelete(null)} />
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300 dark:bg-zinc-900">
                        <div className="p-8">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
                                <Trash2 className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="mb-4 text-2xl font-black italic tracking-tighter uppercase text-black dark:text-white">
                                Burn this address?
                            </h3>
                            <p className="mb-8 text-sm font-medium text-zinc-500 leading-relaxed">
                                This action is permanent and cannot be undone. Are you sure you want to remove this destination from your account?
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleDelete(addressToDelete)}
                                    disabled={loading}
                                    className="flex-1 rounded-xl bg-red-500 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? "Deleting..." : "Erase Forever"}
                                </button>
                                <button
                                    onClick={() => setAddressToDelete(null)}
                                    // Removed disabled={loading} so user can ALWAYS abort
                                    className="flex-1 rounded-xl border border-zinc-200 py-4 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-800"
                                >
                                    Abort
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InputGroup({
    label,
    placeholder,
    type = "text",
    value,
    onChange
}: {
    label: string;
    placeholder: string;
    type?: string;
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border-b border-zinc-200 bg-transparent py-2 text-base font-bold tracking-tight text-black outline-none focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />
        </div>
    );
}
