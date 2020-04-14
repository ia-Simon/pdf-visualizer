import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = process.env.PUBLIC_URL + 'pdfjs-dist/build/pdf.worker.js';

export default pdfjs;