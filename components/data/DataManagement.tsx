import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface UserDataBundle {
    healthData: unknown;
    medications: unknown;
    standardPattern: unknown;
}

export default function DataManagement() {
    const { currentUser } = useAppContext();
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<UserDataBundle | null>(null);
    const [importError, setImportError] = useState('');
    const [importSuccess, setImportSuccess] = useState('');

    const handleExport = async () => {
        if (!currentUser) return;
        setIsExporting(true);
        try {
            const data = await api.exportUserData();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = format(new Date(), 'yyyy-MM-dd');
            link.download = `health_monitor_data_${currentUser.username}_${date}.json`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export data", error);
            alert("Error al exportar los datos.");
        }
        setIsExporting(false);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImportError('');
        setImportSuccess('');
        setParsedData(null);
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== 'application/json') {
                setImportError('Por favor, seleccione un fichero JSON válido.');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = JSON.parse(e.target?.result as string);
                    // Basic validation
                    if ('healthData' in result && 'medications' in result && 'standardPattern' in result) {
                        setParsedData(result);
                    } else {
                        setImportError('El fichero JSON no tiene el formato correcto.');
                    }
                } catch (err) {
                    setImportError('Error al leer el fichero JSON. Asegúrese de que el formato es correcto.');
                }
            };
            reader.readAsText(file);
        }
    };
    
    const handleImport = async () => {
        if (!parsedData || !currentUser) return;

        const confirmation = window.confirm(
            '¿Está seguro de que desea importar estos datos?\n\nATENCIÓN: Esta acción sobrescribirá permanentemente todos los datos de salud, medicamentos y patrones existentes para su usuario. Esta acción no se puede deshacer.'
        );

        if (confirmation) {
            setIsImporting(true);
            setImportError('');
            try {
                // The API expects a specific shape, but we validated the keys exist.
                // We cast to `any` to satisfy the type-checker for the import function.
                const success = await api.importUserData(parsedData as any);
                if (success) {
                    setImportSuccess('Datos importados con éxito. La aplicación se recargará para aplicar los cambios.');
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                } else {
                    throw new Error("API returned failure");
                }
            } catch (error) {
                console.error("Failed to import data", error);
                setImportError('Ocurrió un error inesperado durante la importación.');
            } finally {
                setIsImporting(false);
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-slate-700 mb-2">Gestionar Datos</h2>
            <p className="text-sm text-slate-500 mb-6">
                Use estas herramientas para mover sus datos entre dispositivos o para crear una copia de seguridad.
            </p>

            {/* Export Section */}
            <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Exportar Datos</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Guarde una copia de todos sus datos (registros de salud, lista de medicamentos y patrón estándar) en un único fichero JSON en su ordenador.
                </p>
                <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:bg-blue-400"
                >
                    <Download size={16}/> {isExporting ? 'Exportando...' : 'Exportar mis datos'}
                </button>
            </div>

            {/* Import Section */}
            <div className="border-t border-slate-200 pt-6 mt-6">
                 <h3 className="text-lg font-semibold text-slate-800 mb-2">Importar Datos</h3>
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
                    <div className="flex items-center">
                        <AlertTriangle size={20} className="text-red-600 mr-3"/>
                        <div>
                            <p className="font-bold text-red-700">Atención</p>
                            <p className="text-sm text-red-600">
                                La importación de datos <strong className="font-semibold">sobrescribirá permanentemente</strong> todos los datos existentes para su usuario.
                            </p>
                        </div>
                    </div>
                </div>
                 <p className="text-sm text-slate-500 mb-4">
                    Seleccione un fichero JSON que haya exportado previamente para restaurar sus datos.
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileSelect}
                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                     <button 
                        onClick={handleImport} 
                        disabled={!parsedData || isImporting}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                        <Upload size={16}/> {isImporting ? 'Importando...' : 'Importar y Sobrescribir'}
                    </button>
                </div>
                {selectedFile && !importError && <p className="text-sm text-slate-600 mt-2">Fichero seleccionado: <span className="font-medium">{selectedFile.name}</span>. Listo para importar.</p>}
                {importError && <p className="text-sm text-red-600 mt-2">{importError}</p>}
                {importSuccess && <p className="text-sm text-green-600 mt-2">{importSuccess}</p>}
            </div>
        </div>
    );
}
