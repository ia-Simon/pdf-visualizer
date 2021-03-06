import React, { useState } from 'react';
import { FiSettings, FiMaximize2, FiDelete, FiX } from 'react-icons/fi'

import beautify from 'xml-beautifier';
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
        let textArea = document.querySelector('#dataTextArea');

        if (confState) {
            confButton.style.background = '#808080';
            setConfState(false);

            inputAuth.style.display = 'none';
            select.style.display = 'none';
            textArea.style.resize = 'vertical';
        } else {
            confButton.style.background = '#e0b320';
            setConfState(true);

            inputAuth.style.display = 'flex';
            select.style.display = 'block';
            textArea.style.resize = 'none';
            textArea.style.height = '250px';            
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

    function handleErrorClose() {
        document.querySelector('div.errorMessage').style.display = 'none';
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

                if(!(/^<result><strResult>200/.test(response.data))) throw response.data;

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
                if (oldLink !== null) oldLink.remove();

                document.querySelector('.pdf-conf').appendChild(link);
            })
            .catch(err => {
                try {
                    err = beautify(err);

                    err = err.split("");
                    for(let i = 0, nonEnterCount = 0; i < err.length; i++) {
                        let char = err[i];

                        if(char !== '\n' && nonEnterCount*7 > (window.innerWidth > 1120 ? 1120*0.4:window.innerWidth*0.4)) {
                            err.splice(i, 0, '\n');
                            nonEnterCount = 0;
                        } else if(char === '\n') {
                            nonEnterCount = 0;
                            continue;
                        }

                        nonEnterCount++;
                    }
                    err = err.join("");

                    let errorText = document.createElement('pre');
                    errorText.id = 'errorTxt';
                    errorText.appendChild(document.createTextNode(err));

                    let oldErrorText = document.querySelector('#errorTxt');
                    if (oldErrorText !== null) oldErrorText.remove();

                    let errorMessage = document.querySelector('div.errorMessage');
                    errorMessage.appendChild(errorText);
                    errorMessage.style.display = 'block';
                } catch (e) {
                    let errorText = document.createElement('pre');
                    errorText.id = 'errorTxt';
                    errorText.appendChild(document.createTextNode("An error has occured, please check the\nconsole for further information."));

                    let oldErrorText = document.querySelector('#errorTxt');
                    if (oldErrorText !== null) oldErrorText.remove();

                    let errorMessage = document.querySelector('div.errorMessage');
                    errorMessage.appendChild(errorText);
                    errorMessage.style.display = 'flex';
                    console.error(err);
                }

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
                        id="dataTextArea"
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
                <div className="errorMessage">
                    <h3>Erro na geração do PDF</h3>
                    <span id="errorClose" className="button" onClick={handleErrorClose}>
                        <FiX size={20} color="#EEE"/>
                    </span>
                </div>

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