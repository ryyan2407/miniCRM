import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import ToastNotification from './components/ToastNotification';

import Header from './components/Header';
import LeadForm from './components/LeadForm';
import DocumentUploader from './components/DocumentUploader';
import WorkflowDesigner from './components/WorkflowDesigner';
import DashboardTable from './components/DashboardTable';
import ChatPopup from './components/ChatPopup';
import './App.css';

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
        setLeads(prevLeads => [{ ...newLead, id: Date.now() }, ...prevLeads]);
        showToastMessage({ type: 'success', text: 'Lead created successfully!' });
    };

    const handleLeadsExtracted = useCallback((extractedLeads) => {
        if (!extractedLeads || extractedLeads.length === 0) {
            showToastMessage({ type: 'info', text: 'Document processed, but no leads with emails were found.' });
            return;
        }
        const formattedLeads = extractedLeads.map(lead => ({
            id: `${lead.email}-${Date.now()}`,
            name: lead.name || 'N/A',
            email: lead.email,
            phone: lead.phone || 'N/A',
            status: 'New',
            source: 'Document'
        }));

        setLeads(prevLeads => {
            const existingEmails = new Set(prevLeads.map(l => l.email));
            const uniqueNewLeads = formattedLeads.filter(l => !existingEmails.has(l.email));
            if (uniqueNewLeads.length === 0) {
                showToastMessage({ type: 'info', text: 'All leads found in the document are already in the CRM.' });
            } else {
                showToastMessage({ type: 'success', text: `Successfully added ${uniqueNewLeads.length} new lead(s)!` });
            }
            return [...uniqueNewLeads, ...prevLeads];
        });
    }, [showToastMessage]);
    
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
