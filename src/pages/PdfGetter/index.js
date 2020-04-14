import React, { useState } from 'react';
import { Document } from 'react-pdf';

import { parseStringPromise } from 'xml2js';

import api from '../../services/api';
import pdfjs from '../../services/pdfjs';

import './styles.css';

export default function PdfGetter() {
    const [url, setUrl] = useState('');
    const [jsonPayLoad, setJsonPayLoad] = useState('');
    const [pdf, setPdf] = useState(new File(['press f to pay respects'], 'pdfPreview.pdf', { type: 'application/pdf' }));

    function handlePdfRequest(e) {
        e.preventDefault();

        let submitButton = document.getElementById('Enviar');
        submitButton.disabled = true;

        let formData = new FormData();
        formData.append("jsonPayLoad", "{\n  \"NumeroProposta\": \"123456\",\n  \"idTemplate\": \"CDA0301\",\n  \"ANS_Plano\": 482566197,\n  \"ProponenteTitular\": {\n    \"DPS\": {\n      \"TipoOrientacaoMedica\": \"SERORIENTADOPORMEDICOINDICADO\"\n    }\n  }\n} ");

        api.post(`${url}`, formData, {
            auth: {
                username: 'administrator',
                password: 'password'
            },
            headers: {
                contentType: 'multipart/form-data',
            },
        })
            .then(async response => {
                submitButton.disabled = false;

                const { result } = await parseStringPromise(response.data);
                console.log(atob(result.strFile[0]));
                
                setPdf(new File([new ArrayBuffer(result.strFile[0])], 'pdfPreview.pdf', { type: 'application/pdf' }));
            })
            .catch(err => console.error(err)); 
        
    }

    return (
        <div className="pdfGetter-container">
            <section>
                <h1>Informe a jsonPayload do pdf:</h1>

                <form onSubmit={handlePdfRequest}>
                    <select onChange={e => setUrl(e.target.value)}>
                        <option value="">Selecione uma opção...</option>
                        <option value="CriarDPS:1.7">DPS</option>
                        <option value="GerarSoDPS-PDF:1.7">DPS (PDF)</option>
                        <option value="CriarProposta:1.7">Proposta</option>
                        <option value="GerarSoPDF:1.7">Propota (PDF)</option>
                    </select>

                    <textarea
                        placeholder="{ data }"
                        value={jsonPayLoad}
                        onChange={e => setJsonPayLoad(e.target.value)}
                    />

                    <button id='Enviar' className="button" type="submit">Enviar</button>
                </form>
            </section>

            <section>
                <Document file={pdf} />
            </section>
        </div>
    );
}