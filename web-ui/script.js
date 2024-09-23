// script.js
let mediaRecorder;
let audioChunks = [];
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const statusParagraph = document.getElementById('status');
const resultDiv = document.getElementById('result');
const languageSelect = document.getElementById('languageSelect');
const loadingSpinner = document.getElementById('loadingSpinner');

const promptDiv = document.getElementById('prompt-div');

// 初始化 markdown-it
const md = window.markdownit();


recordButton.addEventListener('click', async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            statusParagraph.textContent = '正在录音...';
            recordButton.disabled = true;
            stopButton.disabled = false;

            audioChunks = [];

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });
        } catch (err) {
            console.error('获取音频权限失败：', err);
            alert('无法访问麦克风，请检查浏览器设置。');
        }
    } else {
        alert('您的浏览器不支持音频录制功能。');
    }
});

stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    statusParagraph.textContent = '录音已停止，正在上传音频...';
    recordButton.disabled = false;
    stopButton.disabled = true;

    mediaRecorder.addEventListener('stop', () => {
        // 将音频数据合成为一个 Blob 对象
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        const selectedLanguage = languageSelect.value;
        formData.append('language', selectedLanguage);

        // 显示加载动画
        loadingSpinner.style.display = 'inline-block';

        // 发送表单数据到后端 API
        fetch('http://localhost:8000/', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            statusParagraph.textContent = '处理完成：';

            // 隐藏加载动画
            loadingSpinner.style.display = 'none';

            // 清空之前的结果
            //resultDiv.innerHTML = '';

            promptDiv.innerHTML = '';
            const prompt = document.createElement('div');
            prompt.classList.add("alert")
            prompt.classList.add("alert-success");
            prompt.textContent = data.prompt;
            // promptDiv.appendChild(prompt);

            const singleResult = document.createElement('div');
            singleResult.classList.add("card")
            singleResult.style = "margin-top: 20px;"
            const singleResultBody = document.createElement('div');
            singleResultBody.classList.add("card-body")
            singleResult.appendChild(singleResultBody);
            singleResultBody.appendChild(prompt);
            resultDiv.prepend(singleResult);


            if (data.type === 'text') {
                // 解析并渲染 Markdown，并进行安全处理
                const markdownContent = md.render(data.content);
                const cleanHTML = DOMPurify.sanitize(markdownContent);
                //resultDiv.innerHTML = cleanHTML;
                const textDiv = document.createElement('div');
                textDiv.innerHTML = cleanHTML;
                singleResultBody.appendChild(textDiv);
            } else if (data.type === 'image') {
                // 使用 Bootstrap Card 显示图片
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                const img = document.createElement('img');
                img.src = 'data:image/png;base64,' + data.content;
                img.classList.add('card-img-top');
                cardDiv.style = "width:512px;"
                cardDiv.appendChild(img);
                //resultDiv.appendChild(cardDiv);
                singleResultBody.appendChild(cardDiv);
            } else if (data.type === 'mermaid') {
                // 使用 Bootstrap Card 显示 Mermaid 图表
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';

                const cardBody = document.createElement('div');
                cardBody.className = 'card-body';

                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid';
                mermaidDiv.textContent = data.content;

                cardBody.appendChild(mermaidDiv);
                cardDiv.appendChild(cardBody);
                //resultDiv.appendChild(cardDiv);
                singleResultBody.appendChild(cardDiv);
                // 渲染 Mermaid 图表
                mermaid.init(undefined, mermaidDiv);
            } else if (data.type === 'error') {
                // 处理未知的类型
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-warning';
                alertDiv.role = 'alert';
                alertDiv.textContent = data.content;
                //resultDiv.appendChild(alertDiv);
                singleResultBody.appendChild(alertDiv);
            } else {
                // 处理未知的类型
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-warning';
                alertDiv.role = 'alert';
                alertDiv.textContent = '未知的内容类型。';
                resultDiv.appendChild(alertDiv);
            }
        })
        .catch(error => {
            console.error('请求失败：', error);
            statusParagraph.textContent = '发生错误，请稍后重试。';

            // 隐藏加载动画
            loadingSpinner.style.display = 'none';

            // 显示错误提示
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';
            alertDiv.role = 'alert';
            alertDiv.textContent = '请求失败，请检查网络连接。';
            resultDiv.prepend(alertDiv);
        });
    });
});

