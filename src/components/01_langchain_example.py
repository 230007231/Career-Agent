import os
import requests
import json
# hugging face镜像设置，如果国内环境无法使用启用该设置
# os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
from dotenv import load_dotenv
from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_deepseek import ChatDeepSeek


load_dotenv()

markdown_path = "career agent/src/components/easy-rl-chapter1.md"
api_key = "Bearer WaggpvPCpiOTCsgyOInF:IaBdkSYcqwLQZHMexmPa"
url = "https://spark-api-open.xf-yun.com/v1/chat/completions"

def get_vectorstore(chunks, embeddings):
    if os.path.exists("faiss_index"):
        vectorstore = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
        vectorstore.add_documents(chunks)
    else:
        vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local("faiss_index")
    return vectorstore


async def rag(question):
    # 加载本地markdown文件
    loader = UnstructuredMarkdownLoader(markdown_path)
    docs = loader.load()

    # 文本分块
    text_splitter = RecursiveCharacterTextSplitter()
    chunks = text_splitter.split_documents(docs)

    # 中文嵌入模型
    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-zh-v1.5",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
  
    # 构建向量存储
    vectorstore = get_vectorstore(chunks, embeddings)

    # 提示词模板
    prompt = ChatPromptTemplate.from_template("""请根据下面提供的上下文信息来回答问题。
    请确保你的回答完全基于这些上下文。
    如果上下文中没有足够的信息来回答问题，请直接告知：“抱歉，我无法根据提供的上下文找到相关信息来回答此问题。”

    上下文:
    {context}

    问题: {question}

    回答:"""
                                          )

    # 配置大语言模型
    chatHistory = []
    # 用户查询
    #question = "文中举了哪些例子？"

    # 在向量存储中查询相关文档
    retrieved_docs = vectorstore.similarity_search(question, k=3)
    docs_content = "\n\n".join(doc.page_content for doc in retrieved_docs)
    message=prompt.format(question=question, context=docs_content)
    #print(message)
    answer = get_answer(getText(chatHistory,"user", message))
    return answer
def getText(text,role, content):
    jsoncon = {}
    jsoncon["role"] = role
    jsoncon["content"] = content
    text.append(jsoncon)
    return text
def get_answer(message):
    #初始化请求体
    headers = {
        'Authorization':api_key,
    }
    body = {
        "model": "lite",
        "user": "user_id",
        "messages": message,
        # 下面是可选参数
        
    }
    full_response = ""  # 存储返回结果
    isFirstContent = True  # 首帧标识

    response = requests.post(url=url,json= body,headers= headers,stream= True)
    # print(response)
    full_response=""
    if response.status_code == 200:
        data = response.json()  # Parse the JSON response
        full_response= data['choices'][0]['message']['content']  # Extract the content
    else:
        full_response= "Error:"+ str(response.status_code)+ response.text
    return full_response

import asyncio
import websockets

async def handler(websocket):
    async for message in websocket:
        print(f"Received message: {message}")
        result = await rag(message)
        print(f"Sending result: {result}")
        await websocket.send(result)
async def main():
    start_server = websockets.serve(handler, "localhost", 3001)
    
    async with start_server:
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
