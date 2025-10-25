## News

2025-10-25: Introduce AI Career Coach for the Disabled! 

## Installation

### Step 1: 

Download Docker: https://www.docker.com/  ( Select a suitable Docker version for your device ) 

![Download Docker image](https://github.com/230007231/Image_Career-Agent-main/blob/8cef215f7c2cf64e8740771c048d2567fd3b3981/Images/Image1.png)

And if the download completed, then keep it running in the device background. 

Use the command below to check whether Docker has successfully downloaded (the terminal would show the current Docker version info)

```
docker --version
```

### Step 2: 

Paste the code below in the terminal to deploy the AnythingLLM in Docker

Pull the latest image
```
docker pull mintplexlabs/anythingllm:latest
```

Run the image:

Linux/Mac
```
export STORAGE_LOCATION=$HOME/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" && \
docker run -d -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

Windows
```
$env:STORAGE_LOCATION="$HOME\Documents\anythingllm"; `
If(!(Test-Path $env:STORAGE_LOCATION)) {New-Item $env:STORAGE_LOCATION -ItemType Directory}; `
If(!(Test-Path "$env:STORAGE_LOCATION\.env")) {New-Item "$env:STORAGE_LOCATION\.env" -ItemType File}; `
docker run -d -p 3001:3001 `
--cap-add SYS_ADMIN `
-v "$env:STORAGE_LOCATION`:/app/server/storage" `
-v "$env:STORAGE_LOCATION\.env:/app/server/.env" `
-e STORAGE_DIR="/app/server/storage" `
mintplexlabs/anythingllm;
```

### Step 3: 

In the Docker dashboard, click the Start button to run the image of AnythingLLM, visit http://localhost:3001 in your browser to set up the backend function on AnythingLLM

![Start AnythingLLM ](https://github.com/230007231/Image_Career-Agent-main/blob/73e40dab9a632e5e0831331df96e66424c53c8fe/image2.gif)


Visit http://localhost:3001 in your browser, click the "Get Started " button.

![click the "Get Started " button](https://github.com/230007231/Image_Career-Agent-main/blob/e3ea37459526b5a8b950d349bfc40910610d4eb6/Images/image3.gif)

Select the LLM that you prefer.
![Select the LLM that you prefer](https://github.com/230007231/Image_Career-Agent-main/blob/a0652256a0635c142042432a28da1fea757c7e11/Images/image4.png)

If you wish to utilize DeepSeek, the API Keys are provided.

```
sk-b1f7eefdc3914c9fbaae256bbeff0bcd
```

Select the "AnythingLLM Embedder" for embedding models.
![Select the AnythingLLM Embedder](https://github.com/230007231/Image_Career-Agent-main/blob/a0652256a0635c142042432a28da1fea757c7e11/Images/image5.png)

Select the "LanceDB" for the vector database.
![Select the LanceDB](https://github.com/230007231/Image_Career-Agent-main/blob/a0652256a0635c142042432a28da1fea757c7e11/Images/image6.gif)

Click the "Remove logo".
![Click the Remove logo](https://github.com/230007231/Image_Career-Agent-main/blob/a0652256a0635c142042432a28da1fea757c7e11/Images/image7.png)

Click the "Skip". (There is no requirement to set up the chatbot logo.)
![Clickthe Skip](https://github.com/230007231/Image_Career-Agent-main/blob/a0652256a0635c142042432a28da1fea757c7e11/Images/image8.gif)

Click the "Just me" and "No".
![Click the "Just me" and "No"](https://github.com/230007231/Image_Career-Agent-main/blob/a0652256a0635c142042432a28da1fea757c7e11/Images/image9.gif)

Click the "Skip Survey".
![Click the Skip Survey](https://github.com/230007231/Image_Career-Agent-main/blob/a0652256a0635c142042432a28da1fea757c7e11/Images/image10.png)

Input the Workspace Name as "genai_hackathon".
```
genai_hackathon
```
![Input the Workspace Name](https://github.com/230007231/Image_Career-Agent-main/blob/a0652256a0635c142042432a28da1fea757c7e11/Images/image11.gif)

Click the "Upload" button.
![Click the "Upload" button](https://github.com/230007231/Image_Career-Agent-main/blob/a0652256a0635c142042432a28da1fea757c7e11/Images/image12.gif)

The documentation and URL should be uploaded, then transferred to the box on the right-hand side, and finally, click the "Save and Embed" button.
![Upload documentation and URL ](https://github.com/230007231/Image_Career-Agent-main/blob/d6e6b84ccaf8317f20839150b5d38ecef55e86bc/Images/image13.png)

Click the "Setting" button.
![Click the "Setting" button](https://github.com/230007231/Image_Career-Agent-main/blob/d6e6b84ccaf8317f20839150b5d38ecef55e86bc/Images/image14.gif)

Click on the "Agent Skills". Here, you will find a multitude of skills that can be enabled to empower your chatbot. Additionally, you can utilize the workflow and MCP.
![Click the "Agent Skills"](https://github.com/230007231/Image_Career-Agent-main/blob/d6e6b84ccaf8317f20839150b5d38ecef55e86bc/Images/image15.gif)


AnythingLLM Workflows tutorial documentation: https://docs.anythingllm.com/agent-flows/tutorial-hackernews

Click on the "Developer API" option and generate a new API key.
![Click the "Developer API"](https://github.com/230007231/Image_Career-Agent-main/blob/d6e6b84ccaf8317f20839150b5d38ecef55e86bc/Images/image16.png)


To know more about API functions, refer to the URL http://localhost:3001/api/docs/.
![Click the "API functions"](https://github.com/230007231/Image_Career-Agent-main/blob/d6e6b84ccaf8317f20839150b5d38ecef55e86bc/Images/image17.png)


We could explore and learn more functions in the AnythingLLM for our project. :rocket:

## Quick start

After all the above steps, download the zip file and unzip it, cd this directory.

Run the following to talk with your AI career coach!
```
pip install -r requirements.txt

npm install

npm start
```

Then you can check on your http://localhost:3000

If necessary, open and modify the AnythingLLM API Key and the Chatbot System Prompt in the Chat.js.

System prompt template:

```
// 系统提示模板
const SYSTEM_PROMPT_TEMPLATE = `
你是一位專業的殘疾人士職業導師，致力於為香港殘疾人士提供個人化的就業支援。你的任務是：
1. 分析香港用戶上傳的 CV（透過 RAG 檢索）和香港用戶問題。
2. 利用 Web Search 和 Web Scraping 技能，搜尋並抓取香港網路上與殘疾人士相關的最新就業資訊。
3. 結合 CV 資料、RAG 結果與抓取內容，產生結構化建議：
- 推薦 1-2 個適合香港殘疾人士的職位。
- 解釋為什麼適合（基於技能、經驗及香港殘疾人士相關的支援）。
- 提供具體行動步驟（包括申請連結、香港培訓資源或香港支援機構）。
4. 使用鼓勵、支持的語氣，避免任何偏見或歧視性語言。
5. 若資訊不足，建議使用者上傳 CV 或提供更多細節。
6. 所有建議應基於最新的可用數據，確保實用性和相關性。

當使用者輸入問題時，確保回應清晰、結構化。
`;
```
API Configuration template 
```
  // API配置
  const BASE_URL = "http://localhost:3001/api/v1";  // Backend URL connect to the backend server
  const API_KEY = "MYN1CKP-P6TMVVH-HRDDJTN-1VBNA85"; // Replace your exact AnythingLLM API Key
  const WORKSPACE_SLUG = "genai_hackathon"; // Replace your exact AnythingLLM workspace name
  const HEADERS = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    Accept: "text/event-stream"
  };
```

### Reference :
AnythingLLM installation guide documentation: https://docs.anythingllm.com/installation-docker/local-docker

AnythingLLM Workflows documentation: https://docs.anythingllm.com/agent-flows/overview

AnythingLLM MCP documentation: https://docs.anythingllm.com/mcp-compatibility/overview

