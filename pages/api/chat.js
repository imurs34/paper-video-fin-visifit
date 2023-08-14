import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

import { makeChain } from '../../utils/make-chain';
import { pinecone } from '../../utils/pineconeClient';
import {
  PINECONE_INDEX_NAME,
  PINECONE_NAME_SPACE,
} from '../../config/pinecone';

// export const config = {
//   runtime: "edge",
// };

const chat = async (req, res) => {
  const { context, history, question } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  const CONTEXT_PROMPT = context
    ? `Take these sentences as a context "${context}" `
    : '';
  const PROMPT = `${CONTEXT_PROMPT} question: "${sanitizedQuestion}"`;

  try {
    const pineconeResult = await pinecone();
    const index = pineconeResult.Index(PINECONE_INDEX_NAME);

    /* create vectorStore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      }
    );

    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: PROMPT,
      chat_history: history || [],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
};

export default chat;
