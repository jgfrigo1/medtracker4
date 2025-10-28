
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function MedicationManager() {
    const { medications, addMedication, editMedication, deleteMedication } = useAppContext();
    const [newMed, setNewMed] = useState('');
    const [editingMed, setEditingMed] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const handleAdd = () => {
        if (newMed.trim() && !medications.includes(newMed.trim())) {
            addMedication(newMed.trim());
            setNewMed('');
        }
    };

    const handleEdit = (med: string) => {
        if (editText.trim() && editText.trim() !== med) {
            editMedication(med, editText.trim());
            setEditingMed(null);
            setEditText('');
        } else {
            setEditingMed(null);
            setEditText('');
        }
    };
    
    const startEditing = (med: string) => {
        setEditingMed(med);
        setEditText(med);
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Gestionar Lista de Medicamentos</h2>
            
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newMed}
                    onChange={(e) => setNewMed(e.target.value)}
                    placeholder="Añadir nuevo medicamento"
                    className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button onClick={handleAdd} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus size={16}/> Añadir
                </button>
            </div>

            <div className="space-y-3">
                {medications.length > 0 ? medications.map(med => (
                    <div key={med} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        {editingMed === med ? (
                            <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={() => handleEdit(med)}
                                onKeyDown={(e) => e.key === 'Enter' && handleEdit(med)}
                                autoFocus
                                className="flex-grow p-1 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                            />
                        ) : (
                            <span className="text-slate-800">{med}</span>
                        )}
                        <div className="flex gap-2">
                            <button onClick={() => startEditing(med)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded-full"><Edit size={16}/></button>
                            <button onClick={() => deleteMedication(med)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-full"><Trash2 size={16}/></button>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 text-center py-4">No hay medicamentos en la lista.</p>
                )}
            </div>
        </div>
    );
}
