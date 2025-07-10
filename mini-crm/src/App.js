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
const INITIAL_LEADS = [
    { id: 1, name: 'Jane Cooper', email: 'jane.cooper@example.com', phone: '+1 202-555-0174', status: 'Contacted', source: 'Manual' },
    { id: 2, name: 'Cody Fisher', email: 'cody.fisher@example.com', phone: '+44 20-7946-0958', status: 'New', source: 'Document' }
];

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
        // In a real app, you'd POST to a backend and then refresh.
        // Here, we just add to our local state.
        setLeads(prevLeads => [{ ...newLead, id: Date.now() }, ...prevLeads]);
    };
    
    const handleDeleteLead = (leadId) => {
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
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
                <div className="max-w-screen-xl mx-auto">
                    <Header />

                    <main className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <DashboardTable 
                                    leads={leads}
                                    onDeleteLead={handleDeleteLead}
                                    onUpdateStatus={handleUpdateStatus}
                                    onOpenChat={handleOpenChat}
                                />
                            </div>
                            <div className="space-y-8">
                                <LeadForm onLeadAdded={handleAddLead} />
                                <DocumentUploader />
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