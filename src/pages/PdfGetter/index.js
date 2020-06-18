import React, { useState } from 'react';
import { FiSettings, FiMaximize2, FiDelete } from 'react-icons/fi'
import { parseStringPromise } from 'xml2js';

import api from '../../services/api';

import './styles.css';

export default function PdfGetter() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [jsonPayLoad, setJsonPayLoad] = useState('');
    const [pdf, setPdf] = useState('');
    const [confState, setConfState] = useState(true);

    function handleSelect(e) {
        setUrl(e.target.value);

        let submitButton = document.querySelector('#Enviar');
        if (e.target.value !== "") {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }

    function handleConf() {
        let confButton = document.querySelector('#Conf');
        let inputAuth = document.querySelector('.input-auth');
        let select = document.querySelector('#APIselect');

        if (confState) {
            confButton.style.background = '#808080';
            setConfState(false);

            inputAuth.style.display = 'none';
            select.style.display = 'none';
        } else {
            confButton.style.background = '#e0b320';
            setConfState(true);

            inputAuth.style.display = 'flex';
            select.style.display = 'block';
        }
    }

    function handlePopUp() {
        let pdfPopUp = document.querySelector('[title=PdfPopUp]');
        pdfPopUp.style.display = 'block';
        pdfPopUp.data = undefined;
        setTimeout(() => {
             pdfPopUp.data = pdf;
        }, 400);
        document.querySelector('#Close').style.display = 'flex';
        
    }
    
    function handlePopUpClose() {
        document.querySelector('[title=PdfPopUp]').style.display = 'none';
        document.querySelector('#Close').style.display = 'none';
    }

    function handlePdfRequest(e) {
        e.preventDefault();

        let submitButton = document.querySelector('#Enviar');
        submitButton.disabled = true;

        let formData = new FormData();
        formData.append("jsonPayLoad", jsonPayLoad);
        
        api.post(`${url}`, formData, {
            auth: {
                username: username,
                password: password
            },
            headers: {
                contentType: 'multipart/form-data',
            },
        })
            .then(async response => {
                submitButton.disabled = false;

                const { result } = await parseStringPromise(response.data);
                //console.log(result.strFile[0]);

                let bin = atob(result.strFile[0]);
                console.log('File Size:', Math.round(bin.length / 1024), 'KB');
                console.log('PDF Version:', bin.match(/^.PDF-([0-9.]+)/)[1]);
                console.log('Create Date:', bin.match(/<xmp:CreateDate>(.+?)<\/xmp:CreateDate>/)[1]);
                console.log('Modify Date:', bin.match(/<xmp:ModifyDate>(.+?)<\/xmp:ModifyDate>/)[1]);
                console.log('Creator Tool:', bin.match(/<xmp:CreatorTool>(.+?)<\/xmp:CreatorTool>/)[1]);

                setPdf(`data:application/pdf;base64,${result.strFile[0]}`);

                document.querySelector('#Expand').style.display = 'flex';

                let link = document.createElement('a');
                link.id = 'pdfDL';
                link.className = 'button';
                link.innerHTML = 'Download PDF file';
                link.download = `file${JSON.parse(jsonPayLoad).idTemplate}.pdf`;
                link.href = `data:application/octet-stream;base64,${result.strFile[0]}`;

                let oldLink = document.querySelector('#pdfDL');
                if (oldLink !== null)
                    oldLink.remove();

                document.querySelector('.pdf-conf').appendChild(link);
            })
            .catch(err => {
                console.error(err);

                submitButton.disabled = false;
            });

    }

    return (
        <div className="pdfGetter-container">
            <section>
                <h1>Informe os dados para acesso ao PDF:</h1>

                <form onSubmit={handlePdfRequest}>
                    <div className="input-auth">
                        <input
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />

                        <input
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <select id="APIselect" onChange={handleSelect}>
                        <option value="">Selecione uma opção...</option>
                        <option value="CriarDPS">DPS</option>
                        <option value="CriarProposta">Proposta</option>
                        <option value="CriarPropostaVD:1.7">Proposta VD</option>
                    </select>

                    <textarea
                        placeholder="{ data }"
                        value={jsonPayLoad}
                        onChange={e => setJsonPayLoad(e.target.value)}
                    />

                    <div className="input-conf">
                        <button id="Enviar" className="button" type="submit" disabled={true}>Enviar</button>
                        <span id="Conf" className="button" onClick={handleConf}>
                            <FiSettings size={24} color="#FFF" />
                        </span>
                    </div>
                </form>
            </section>

            <span id="Close" className="button" onClick={handlePopUpClose}>
                <FiDelete size={20} color="#FFF" />
            </span>
            <object title="PdfPopUp" type="application/pdf" data={pdf} />

            <section id="pdfViewer">
                <object title="PdfView" type="application/pdf" data={pdf} />

                <div className="pdf-conf">
                    <span id="Expand" className="button" onClick={handlePopUp}>
                        <FiMaximize2 size={20} color="#FFF" />
                    </span>
                </div>
            </section>
        </div>
    );
}