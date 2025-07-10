import React from 'react';

const StatusBadge = ({ status, onClick }) => {
    const isNew = status === 'New';
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full cursor-pointer transition-colors";
    const newClasses = "bg-green-100 text-green-800 hover:bg-green-200";
    const contactedClasses = "bg-blue-100 text-blue-800 hover:bg-blue-200";

    return (
        <span onClick={onClick} className={`${baseClasses} ${isNew ? newClasses : contactedClasses}`}>
            {status}
        </span>
    );
};

const DashboardTable = ({ leads, onDeleteLead, onUpdateStatus, onOpenChat }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
            </div>
            {leads.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                    <p>Add new leads to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span>{lead.email}</span>
                                            <span className="text-gray-400">{lead.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge 
                                            status={lead.status} 
                                            onClick={() => onUpdateStatus(lead.id, lead.status === 'New' ? 'Contacted' : 'New')} 
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.source}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => onOpenChat(lead)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Interact">
                                            <i className="fa fa-comment fa-lg"></i>
                                        </button>
                                        <button onClick={() => onDeleteLead(lead.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                                            <i className="fa fa-times fa-lg"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DashboardTable;