import React, { useState } from 'react';
import countryCodes from '../country-codes.json';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const LeadForm = ({ onLeadAdded }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState(countryCodes[0].code);
    const [error, setError] = useState('');

    const clearError = () => {
        if (error) {
            setError('');
        }
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        clearError();
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        clearError();
    };

    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
        clearError();
    };
    
    const handleCountryChange = (e) => {
        setCountry(e.target.value);
        clearError();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email) {
            setError('Name and Email are required!');
            return;
        }

        const phoneNumber = parsePhoneNumberFromString(phone, country);
        if (!phoneNumber || !phoneNumber.isValid()) {
            setError('Phone number is not valid for the selected country.');
            return;
        }

        const newLead = {
            name,
            email,
            phone: phoneNumber.number, // Store in E.164 format
            status: 'New',
            source: 'Manual'
        };
        onLeadAdded(newLead);
        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setCountry(countryCodes[0].code);
        setError('');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Create Lead</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" value={name} onChange={handleNameChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={email} onChange={handleEmailChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="flex space-x-2">
                            <select value={country} onChange={handleCountryChange} className="w-1/3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {countryCodes.map(c => <option key={c.code} value={c.code}>{c.name} ({c.dial_code})</option>)}
                            </select>
                            <input type="tel" value={phone} onChange={handlePhoneChange} className="flex-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter phone number" />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        Create Lead
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LeadForm;