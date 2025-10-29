
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Download, Upload, AlertTriangle, Copy, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { HealthData, StandardPattern } from '../../types';

interface UserDataBundle {
    healthData: HealthData;
    medications: string[];
    standardPattern: StandardPattern;
}

export default function DataManagement() {
    const { healthData, medications, standardPattern, importData } = useAppContext();
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importText, setImportText] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // State for file import
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importError, setImportError] = useState('');
    const [importSuccess, setImportSuccess] = useState('');

    const handleExportToFile = async () => {
        setIsExporting(true);
        try {
            const data = { healthData, medications, standardPattern };
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = format(new Date(), 'yyyy-MM-dd');
            link.download = `health_monitor_data_${date}.json`;
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
    
    const handleCopyToClipboard = () => {
        setCopySuccess(false);
        try {
            const data = { healthData, medications, standardPattern };
            const jsonString = JSON.stringify(data);
            const base64String = btoa(unescape(encodeURIComponent(jsonString))); // Encode to Base64
            navigator.clipboard.writeText(base64String);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2500);
        } catch (error) {
            console.error("Failed to copy data", error);
            alert("Error al copiar los datos.");
        }
    };
    
    const confirmAndImport = async (data: UserDataBundle | null) => {
        if (!data) {
            setImportError('No hay datos válidos para importar.');
            return;
        }

        const confirmation = window.confirm(
            '¿Está seguro de que desea importar estos datos?\n\nATENCIÓN: Esta acción sobrescribirá permanentemente todos los datos de salud, medicamentos y patrones existentes. Esta acción no se puede deshacer.'
        );

        if (confirmation) {
            setIsImporting(true);
            setImportError('');
            setImportSuccess('');
            try {
                await importData(data);
                setImportSuccess('Datos importados con éxito. La aplicación se recargará.');
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                console.error("Failed to import data", error);
                setImportError('Ocurrió un error inesperado durante la importación.');
            } finally {
                setIsImporting(false);
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImportError('');
        setImportSuccess('');
        setSelectedFile(null);
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== 'application/json') {
                setImportError('Por favor, seleccione un fichero JSON válido.');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleImportFromFile = () => {
        if (!selectedFile) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = JSON.parse(e.target?.result as string);
                if ('healthData' in result && 'medications' in result && 'standardPattern' in result) {
                    confirmAndImport(result);
                } else {
                    setImportError('El fichero JSON no tiene el formato correcto.');
                }
            } catch (err) {
                setImportError('Error al leer el fichero JSON. Asegúrese de que el formato es correcto.');
            }
        };
        reader.readAsText(selectedFile);
    };
    
    const handleImportFromText = () => {
        if (!importText.trim()) {
            setImportError('El campo de texto está vacío.');
            return;
        }
        try {
            const jsonString = decodeURIComponent(escape(atob(importText.trim()))); // Decode from Base64
            const result = JSON.parse(jsonString);
             if ('healthData' in result && 'medications' in result && 'standardPattern' in result) {
                confirmAndImport(result);
            } else {
                setImportError('El texto de datos no tiene el formato correcto.');
            }
        } catch (err) {
            setImportError('Error al leer el texto. Asegúrese de que ha copiado la cadena completa y correcta.');
        }
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-3xl mx-auto space-y-8">
            <div>
                <h2 className="text-xl font-bold text-slate-700 mb-2">Importar y Exportar Datos</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                    <div className="flex items-start">
                        <AlertTriangle size={20} className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0"/>
                        <div>
                            <p className="font-bold text-yellow-800">Importante: Sus datos se guardan localmente</p>
                            <p className="text-sm text-yellow-700">
                                Toda la información se almacena <strong className="font-semibold">únicamente en este navegador</strong>. Si limpia los datos de su navegador o cambia de dispositivo, perderá sus datos. Le recomendamos encarecidamente que exporte sus datos con regularidad.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Exportar Datos</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Cree una copia de seguridad de sus datos para guardarla de forma segura o transferirla a otro dispositivo.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Download size={16}/> Exportar a Fichero</h4>
                        <p className="text-xs text-slate-500 my-2">Ideal para crear copias de seguridad completas en su ordenador.</p>
                        <button onClick={handleExportToFile} disabled={isExporting} className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:bg-blue-400">
                            {isExporting ? 'Exportando...' : 'Descargar Copia de Seguridad'}
                        </button>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Copy size={16}/> Copiar para Sincronizar</h4>
                        <p className="text-xs text-slate-500 my-2">Copia los datos como texto para pegarlos fácilmente en otro navegador o dispositivo.</p>
                        <button onClick={handleCopyToClipboard} className="w-full px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors">
                            {copySuccess ? <><CheckCircle size={16} className="text-green-600"/> ¡Copiado!</> : 'Copiar Datos al Portapapeles'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Import Section */}
            <div className="pt-6 border-t border-slate-200">
                 <h3 className="text-lg font-semibold text-slate-800 mb-2">Importar Datos</h3>
                 <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
                    <div className="flex items-center">
                        <AlertTriangle size={20} className="text-red-600 mr-3"/>
                        <div>
                            <p className="font-bold text-red-700">Atención: Sobrescribir Datos</p>
                            <p className="text-sm text-red-600">
                                La importación de datos <strong className="font-semibold">reemplazará permanentemente</strong> todos los datos existentes.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {/* Import from File */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                         <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Upload size={16}/> Importar desde Fichero</h4>
                         <input
                            type="file"
                            accept=".json,application/json"
                            onChange={handleFileSelect}
                            className="text-sm text-slate-500 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                         <button onClick={handleImportFromFile} disabled={!selectedFile || isImporting} className="w-full px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed">
                             {isImporting ? 'Importando...' : 'Importar desde Fichero'}
                        </button>
                    </div>
                     {/* Import from Text */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2"><FileText size={16}/> Importar desde Texto</h4>
                        <textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="Pegue aquí el texto de datos copiado..."
                            className="w-full h-16 p-2 text-xs border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            disabled={isImporting}
                        />
                        <button onClick={handleImportFromText} disabled={!importText.trim() || isImporting} className="w-full px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed">
                             {isImporting ? 'Importando...' : 'Importar desde Texto'}
                        </button>
                    </div>
                </div>

                {importError && <p className="text-sm text-red-600 mt-4 text-center">{importError}</p>}
                {importSuccess && <p className="text-sm text-green-600 mt-4 text-center">{importSuccess}</p>}
            </div>
        </div>
    );
}