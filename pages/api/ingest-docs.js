import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

import {
  PINECONE_INDEX_NAME,
  PINECONE_NAME_SPACE,
} from '../../config/pinecone.js';
import { pinecone } from '../../utils/pineconeClient.js';

// export const config = {
//   runtime: 'edge',
// };

/* Name of directory to retrieve your files from 
  Make sure to add your PDF files inside the 'pdfs' folder
*/
const filePath = './public/pdfs';

const ingestDocs = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new PDFLoader(path),
    });
    console.log(directoryLoader);
    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();

    console.log('rawDocs', rawDocs);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const pineconeResult = await pinecone();
    const index = pineconeResult.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
    console.log('Ingested document');
    res.status(200).json({
      status: true,
      message: 'Document(s) ingested',
    });
  } catch (error) {
    console.log(error, 'error');
    res.status(400).json({
      status: false,
      error,
    });
  }
};

export default ingestDocs;
