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
            statusParagraph.textContent = ' ';

            // 隐藏加载动画
            loadingSpinner.style.display = 'none';

            // 清空之前的结果
            //resultDiv.innerHTML = '';

            promptDiv.innerHTML = '';
            const prompt = document.createElement('div');
            prompt.classList.add("alert")
            prompt.classList.add("alert-light");
            const record_icon = document.createElement('i');
            record_icon.classList.add("fa")
            record_icon.classList.add("fa-microphone")
            record_icon.style = "margin-right: 10px;"
            record_icon.setAttribute("aria-hidden", "true");
            const prompt_text = document.createElement('span');
            prompt_text.textContent = data.prompt;
            prompt.appendChild(record_icon);
            prompt.appendChild(prompt_text);
            // promptDiv.appendChild(prompt);

            const singleResult = document.createElement('div');
            singleResult.classList.add("card")
            singleResult.style = "margin-top: 20px;"
            const singleResultBody = document.createElement('div');
            singleResultBody.classList.add("card-body")
            singleResult.appendChild(singleResultBody);
            singleResultBody.appendChild(prompt);
            resultDiv.append(singleResult);


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

document.getElementById('submitButton').addEventListener('click', async () => {
    const textInput = document.getElementById('textInput').value;
    const promptDiv = document.getElementById('prompt-div');
    const resultDiv = document.getElementById('result');
    const languageSelect = document.getElementById('languageSelect').value;

    // 清空之前的结果
    //promptDiv.innerHTML = '';
    //resultDiv.innerHTML = '';

    // 清空输入框
    document.getElementById('textInput').value = '';

    if (textInput.trim() === '') {
        //alert('请输入文本');
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', 'alert-warning');
        alertDiv.role = 'alert';
        alertDiv.textContent = '输入文本不能为空';
        resultDiv.appendChild(alertDiv);
        return;
    }

    // 显示加载状态
    loadingSpinner.style.display = 'inline-block';
    statusParagraph.textContent = '正在处理文本...';

    try {
        // 发送POST请求到 /text_process 接口
        const response = await fetch('http://localhost:8000/text_process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: textInput,
                language: languageSelect // 发送语言信息
            })
        });

        if (!response.ok) {
            throw new Error('网络响应错误');
        }
        statusParagraph.textContent = ' ';

        const data = await response.json();
         loadingSpinner.style.display = 'none';

        promptDiv.innerHTML = '';
        const prompt = document.createElement('div');
        prompt.classList.add("alert")
        prompt.classList.add("alert-light");
        const record_icon = document.createElement('i');
        record_icon.classList.add("fa")
        record_icon.classList.add("fa-keyboard-o")
        record_icon.style = "margin-right: 10px;"
        record_icon.setAttribute("aria-hidden", "true");
        const prompt_text = document.createElement('span');
        prompt_text.textContent = data.prompt;
        prompt.appendChild(record_icon);
        prompt.appendChild(prompt_text);

        const singleResult = document.createElement('div');
        singleResult.classList.add("card")
        singleResult.style = "margin-top: 20px;"
        const singleResultBody = document.createElement('div');
        singleResultBody.classList.add("card-body")
        singleResult.appendChild(singleResultBody);
        singleResultBody.appendChild(prompt);
        resultDiv.append(singleResult);

        if (data.type === 'text') {
            // 处理文本结果
            const textDiv = document.createElement('div');
            textDiv.innerHTML = DOMPurify.sanitize(md.render(data.content));  // 处理和渲染 Markdown 内容
            singleResultBody.appendChild(textDiv);
        } else if (data.type === 'image') {
            // 处理图片结果
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
            // 处理 Mermaid 图表
            const mermaidDiv = document.createElement('div');
            mermaidDiv.classList.add('mermaid');
            mermaidDiv.textContent = data.content;
            singleResultBody.appendChild(mermaidDiv);
            mermaid.init(undefined, mermaidDiv);  // 初始化 Mermaid 图表
        } else if (data.type === 'error') {
            // 处理错误信息
            const alertDiv = document.createElement('div');
            alertDiv.classList.add('alert', 'alert-warning');
            alertDiv.role = 'alert';
            alertDiv.textContent = data.content;
            singleResultBody.appendChild(alertDiv);
        }
    } catch (error) {
        loadingSpinner.remove();  // 移除加载动画
        console.error('请求失败:', error);
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', 'alert-danger');
        alertDiv.role = 'alert';
        alertDiv.textContent = '请求失败，请稍后再试。';
        resultDiv.appendChild(alertDiv);
    }
});


