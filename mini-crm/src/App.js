import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import ToastNotification from './components/ToastNotification';

import Header from './components/Header';
import LeadForm from './components/LeadForm';
import DocumentUploader from './components/DocumentUploader';
import WorkflowDesigner from './components/WorkflowDesigner';
import DashboardTable from './components/DashboardTable';
import ChatPopup from './components/ChatPopup';
import './App.css'; // You can add any global styles here

// Initial dummy data
const INITIAL_LEADS = [];

function App() {
    const [leads, setLeads] = useState(INITIAL_LEADS);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const showToastMessage = useCallback((message) => {
        setToastMessage(message);
    }, []);

    const handleCloseToast = useCallback(() => {
        setToastMessage(null);
    }, []);

    const handleAddLead = (newLead) => {
        // Adds a single lead from the manual form
        setLeads(prevLeads => [{ ...newLead, id: Date.now() }, ...prevLeads]);
        showToastMessage({ type: 'success', text: 'Lead created successfully!' });
    };

    // --- THIS IS THE UPDATED FUNCTION ---
    const handleLeadsExtracted = useCallback((extractedLeads) => {
        // This function is now smarter. It handles responses from the backend,
        // checks for duplicates, and uses the toast notification system.
        
        if (!extractedLeads || extractedLeads.length === 0) {
            showToastMessage({ type: 'info', text: 'Document processed, but no leads with emails were found.' });
            return;
        }

        // Format the leads from the backend before adding them to state
        const formattedLeads = extractedLeads.map(lead => ({
            id: `${lead.email}-${Date.now()}`, // Create a more stable unique ID
            name: lead.name || 'N/A',
            email: lead.email,
            phone: lead.phone || 'N/A',
            status: 'New',
            source: 'Document'
        }));

        setLeads(prevLeads => {
            // Get a set of all existing email addresses for quick lookup
            const existingEmails = new Set(prevLeads.map(l => l.email));
            
            // Filter out any leads that are already in our CRM
            const uniqueNewLeads = formattedLeads.filter(l => !existingEmails.has(l.email));
            
            // Provide feedback to the user via the toast system
            if (uniqueNewLeads.length === 0) {
                showToastMessage({ type: 'info', text: 'All leads found in the document are already in the CRM.' });
            } else {
                showToastMessage({ type: 'success', text: `Successfully added ${uniqueNewLeads.length} new lead(s)!` });
            }
            
            // Return the new state, with unique new leads at the top
            return [...uniqueNewLeads, ...prevLeads];
        });
    }, [showToastMessage]); // Dependency on showToastMessage
    
    const handleDeleteLead = (leadId) => {
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
        showToastMessage({ type: 'error', text: 'Lead deleted.' });
    };

    const handleUpdateStatus = (leadId, newStatus) => {
        setLeads(prevLeads => 
            prevLeads.map(lead => 
                lead.id === leadId ? { ...lead, status: newStatus } : lead
            )
        );
    };

    const handleOpenChat = (lead) => {
        setSelectedLead(lead);
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        setSelectedLead(null);
    };

    return (
        <div>
            <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans">
                <div className="max-w-screen-xl mx-auto flex flex-col h-full">
                    <Header />

                    <main className="space-y-8 flex-grow flex flex-col">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 flex-grow h-full">
                                <DashboardTable 
                                    leads={leads}
                                    onDeleteLead={handleDeleteLead}
                                    onUpdateStatus={handleUpdateStatus}
                                    onOpenChat={handleOpenChat}
                                />
                            </div>
                            <div className="space-y-8 flex-grow flex flex-col h-full">
                                <LeadForm onLeadAdded={handleAddLead} />
                                {/* The DocumentUploader now has the powerful handler it needs */}
                                <DocumentUploader onLeadsExtracted={handleLeadsExtracted} />
                                <ReactFlowProvider>
                                    <WorkflowDesigner showToastMessage={showToastMessage} />
                                </ReactFlowProvider>
                            </div>
                        </div>
                    </main>
                </div>
                {isChatOpen && (
                    <ChatPopup 
                        lead={selectedLead} 
                        onClose={handleCloseChat} 
                    />
                )}
            </div>
            <ToastNotification message={toastMessage} onClose={handleCloseToast} />
        </div>
    );
}

export default App;